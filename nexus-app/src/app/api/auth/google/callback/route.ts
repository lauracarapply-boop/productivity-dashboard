import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings?integration=google&status=error', req.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/settings?integration=google&status=misconfigured', req.url))
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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
      return NextResponse.redirect(new URL('/settings?integration=google&status=token_error', req.url))
    }

    const tokenData = await tokenRes.json()

    // Fetch user info to get email
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const userInfo = await userRes.json()

    const cookieStore = await cookies()

    // Store tokens in HTTP-only cookies (7 days)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    cookieStore.set('google_access_token', tokenData.access_token, { httpOnly: true, secure: true, expires })
    if (tokenData.refresh_token) {
      cookieStore.set('google_refresh_token', tokenData.refresh_token, { httpOnly: true, secure: true, expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })
    }
    cookieStore.set('google_email', userInfo.email ?? '', { httpOnly: false, secure: true, expires })
    cookieStore.set('google_name', userInfo.name ?? '', { httpOnly: false, secure: true, expires })

    return NextResponse.redirect(new URL('/settings?integration=google&status=connected', req.url))
  } catch {
    return NextResponse.redirect(new URL('/settings?integration=google&status=error', req.url))
  }
}
