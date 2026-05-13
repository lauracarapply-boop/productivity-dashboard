import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const endpoint = searchParams.get('endpoint') // e.g. '/v1/search'

  if (!token || !endpoint) {
    return NextResponse.json({ error: 'Missing token or endpoint' }, { status: 400 })
  }

  if (!endpoint.startsWith('/v1/')) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.notion.com${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Notion API returned ${res.status}` }, { status: res.status })
    }

    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Failed to reach Notion API' }, { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const endpoint = searchParams.get('endpoint')

  if (!token || !endpoint || !endpoint.startsWith('/v1/')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const res = await fetch(`https://api.notion.com${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Notion API returned ${res.status}` }, { status: res.status })
    }

    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Failed to reach Notion API' }, { status: 502 })
  }
}
