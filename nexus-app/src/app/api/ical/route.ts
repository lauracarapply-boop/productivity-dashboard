import { NextRequest, NextResponse } from 'next/server'

interface ICalEvent {
  id: string
  title: string
  start: string
  end: string
  location: string
  description: string
  allDay: boolean
}

function unfoldLines(raw: string): string[] {
  return raw
    .replace(/\r\n[ \t]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')
}

function parseICalDate(value: string, tzid?: string): string {
  // All-day: YYYYMMDD
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`
  }
  // With time: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/)
  if (!m) return new Date().toISOString()
  const [, yr, mo, dy, hr, mn, sc, utc] = m
  if (utc === 'Z' || !tzid) {
    return new Date(`${yr}-${mo}-${dy}T${hr}:${mn}:${sc}Z`).toISOString()
  }
  // Treat as local time in tzid (simplified: just parse as local)
  return `${yr}-${mo}-${dy}T${hr}:${mn}:${sc}`
}

function parseICS(text: string): ICalEvent[] {
  const lines = unfoldLines(text)
  const events: ICalEvent[] = []
  let inEvent = false
  let current: Record<string, string> = {}
  let startTzid = ''
  let endTzid = ''

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      current = {}
      startTzid = ''
      endTzid = ''
      continue
    }
    if (line === 'END:VEVENT') {
      inEvent = false
      if (!current.DTSTART || !current.SUMMARY) continue

      const allDay = /VALUE=DATE/.test(current.DTSTART_RAW ?? '') && !/T/.test(current.DTSTART)

      const start = parseICalDate(current.DTSTART, startTzid)
      const end = current.DTEND
        ? parseICalDate(current.DTEND, endTzid)
        : start

      events.push({
        id: current.UID ?? `ical-${Date.now()}-${Math.random()}`,
        title: current.SUMMARY?.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\;/g, ';') ?? '',
        start,
        end,
        location: current.LOCATION?.replace(/\\,/g, ',').replace(/\\n/g, '\n') ?? '',
        description: current.DESCRIPTION?.replace(/\\,/g, ',').replace(/\\n/g, '\n') ?? '',
        allDay,
      })
      continue
    }
    if (!inEvent) continue

    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const rawKey = line.slice(0, colonIdx)
    const val = line.slice(colonIdx + 1).trim()

    // Extract TZID from key params e.g. DTSTART;TZID=America/New_York
    const keyBase = rawKey.split(';')[0]
    const tzidMatch = rawKey.match(/TZID=([^;:]+)/)

    if (keyBase === 'DTSTART') {
      current.DTSTART = val
      current.DTSTART_RAW = rawKey
      if (tzidMatch) startTzid = tzidMatch[1]
    } else if (keyBase === 'DTEND') {
      current.DTEND = val
      if (tzidMatch) endTzid = tzidMatch[1]
    } else {
      current[keyBase] = val
    }
  }

  return events
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') ?? process.env.ICAL_URL

  if (!url) {
    return NextResponse.json({ error: 'No iCal URL provided. Pass ?url= or set ICAL_URL env var.' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'NexusDashboard/1.0' },
      next: { revalidate: 300 }, // cache 5 min
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch iCal: ${res.status}` }, { status: 502 })
    }
    const text = await res.text()
    const events = parseICS(text)
    return NextResponse.json({ events })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
