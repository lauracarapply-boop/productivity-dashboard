import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('google_access_token')?.value

  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pageToken = searchParams.get('pageToken') ?? ''
  const query = searchParams.get('q') ?? "trashed=false and 'me' in owners"

  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name,mimeType,modifiedTime,size,parents,webViewLink,iconLink),nextPageToken',
    pageSize: '50',
    orderBy: 'modifiedTime desc',
  })
  if (pageToken) params.set('pageToken', pageToken)

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Drive API error', status: res.status }, { status: res.status })
  return NextResponse.json(await res.json())
}
