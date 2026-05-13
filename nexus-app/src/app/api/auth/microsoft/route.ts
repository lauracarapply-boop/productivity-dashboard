import { NextResponse } from 'next/server'

const SCOPES = [
  'offline_access',
  'https://graph.microsoft.com/Calendars.Read',
  'https://graph.microsoft.com/Mail.Read',
  'https://graph.microsoft.com/Team.ReadBasic.All',
  'https://graph.microsoft.com/Files.Read',
  'User.Read',
].join(' ')

export async function GET() {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Microsoft OAuth not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_REDIRECT_URI.' },
      { status: 503 }
    )
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: 'code',
    response_mode: 'query',
  })

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`
  return NextResponse.redirect(authUrl)
}
