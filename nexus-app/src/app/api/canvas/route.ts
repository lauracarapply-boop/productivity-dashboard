import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const canvasUrl = searchParams.get('url')
  const token = searchParams.get('token')
  const endpoint = searchParams.get('endpoint') // e.g. '/api/v1/courses'

  if (!canvasUrl || !token || !endpoint) {
    return NextResponse.json({ error: 'Missing url, token, or endpoint' }, { status: 400 })
  }

  // Sanitize: ensure endpoint starts with /api/v1/
  if (!endpoint.startsWith('/api/v1/')) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  const base = canvasUrl.replace(/\/$/, '')
  const targetUrl = `${base}${endpoint}`

  try {
    const res = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Canvas API returned ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to reach Canvas' }, { status: 502 })
  }
}
