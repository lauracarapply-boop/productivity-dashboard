import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token ?? null
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get('google_access_token')?.value
  const refreshToken = cookieStore.get('google_refresh_token')?.value

  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken(refreshToken) ?? undefined
    if (accessToken) {
      const expires = new Date(Date.now() + 3600 * 1000)
      cookieStore.set('google_access_token', accessToken, { httpOnly: true, secure: true, expires })
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const timeMin = searchParams.get('timeMin') ?? new Date().toISOString()
  const timeMax = searchParams.get('timeMax') ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch calendar', status: res.status }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
