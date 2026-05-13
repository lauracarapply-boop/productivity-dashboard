import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const method = searchParams.get('method') // e.g. 'conversations.list'

  if (!token || !method) {
    return NextResponse.json({ error: 'Missing token or method' }, { status: 400 })
  }

  // Allowlist of safe read-only Slack API methods
  const allowed = [
    'conversations.list',
    'conversations.history',
    'users.info',
    'auth.test',
    'channels.list',
    'im.list',
    'mpim.list',
  ]

  if (!allowed.includes(method)) {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 403 })
  }

  // Forward remaining query params to Slack
  const slackParams = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key !== 'token' && key !== 'method') slackParams.set(key, value)
  })

  try {
    const res = await fetch(`https://slack.com/api/${method}?${slackParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Slack API returned ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    if (!data.ok) {
      return NextResponse.json({ error: data.error ?? 'Slack API error' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to reach Slack API' }, { status: 502 })
  }
}
