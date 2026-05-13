import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings?integration=microsoft&status=error', req.url))
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/settings?integration=microsoft&status=misconfigured', req.url))
  }

  try {
    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/settings?integration=microsoft&status=token_error', req.url))
    }

    const tokenData = await tokenRes.json()

    const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const userInfo = await userRes.json()

    const cookieStore = await cookies()
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    cookieStore.set('ms_access_token', tokenData.access_token, { httpOnly: true, secure: true, expires })
    if (tokenData.refresh_token) {
      cookieStore.set('ms_refresh_token', tokenData.refresh_token, {
        httpOnly: true, secure: true,
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
    }
    cookieStore.set('ms_email', userInfo.mail ?? userInfo.userPrincipalName ?? '', { httpOnly: false, secure: true, expires })
    cookieStore.set('ms_name', userInfo.displayName ?? '', { httpOnly: false, secure: true, expires })

    return NextResponse.redirect(new URL('/settings?integration=microsoft&status=connected', req.url))
  } catch {
    return NextResponse.redirect(new URL('/settings?integration=microsoft&status=error', req.url))
  }
}
