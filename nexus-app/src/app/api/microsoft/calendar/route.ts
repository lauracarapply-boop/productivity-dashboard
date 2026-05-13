import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function refreshMsToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.MICROSOFT_CLIENT_ID ?? '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token ?? null
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get('ms_access_token')?.value
  const refreshToken = cookieStore.get('ms_refresh_token')?.value

  if (!accessToken && refreshToken) {
    accessToken = await refreshMsToken(refreshToken) ?? undefined
    if (accessToken) {
      cookieStore.set('ms_access_token', accessToken, {
        httpOnly: true, secure: true,
        expires: new Date(Date.now() + 3600 * 1000),
      })
    }
  }

  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDateTime = searchParams.get('startDateTime') ?? new Date().toISOString()
  const endDateTime = searchParams.get('endDateTime') ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const params = new URLSearchParams({
    startDateTime,
    endDateTime,
    $orderby: 'start/dateTime',
    $top: '100',
    $select: 'subject,start,end,location,bodyPreview,organizer,isOnlineMeeting,onlineMeetingUrl',
  })

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}`, Prefer: 'outlook.timezone="UTC"' } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Graph API error', status: res.status }, { status: res.status })
  return NextResponse.json(await res.json())
}
