import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('google_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const maxResults = searchParams.get('maxResults') ?? '20'
  const query = searchParams.get('q') ?? 'in:inbox'

  // List messages
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!listRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch Gmail', status: listRes.status }, { status: listRes.status })
  }

  const listData = await listRes.json()
  const messages = listData.messages ?? []

  // Fetch metadata for each message (batch up to 10)
  const details = await Promise.all(
    messages.slice(0, 20).map(async (msg: { id: string }) => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!res.ok) return null
      return res.json()
    })
  )

  return NextResponse.json({ messages: details.filter(Boolean) })
}
