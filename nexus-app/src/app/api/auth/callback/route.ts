import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const session = data.session
      const response = NextResponse.redirect(`${origin}${next}`)

      // Store the Google provider token in cookies so Calendar/Gmail/Drive routes can use it
      const expires7d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const expires1y = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      const cookieOpts = { httpOnly: true, secure: true, path: '/', sameSite: 'lax' as const }

      if (session.provider_token) {
        response.cookies.set('google_access_token', session.provider_token, { ...cookieOpts, expires: expires7d })
      }
      if (session.provider_refresh_token) {
        response.cookies.set('google_refresh_token', session.provider_refresh_token, { ...cookieOpts, expires: expires1y })
      }

      const email = session.user.email ?? ''
      const name = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? ''

      response.cookies.set('google_email', email, { httpOnly: false, secure: true, path: '/', sameSite: 'lax', expires: expires7d })
      response.cookies.set('google_name', name, { httpOnly: false, secure: true, path: '/', sameSite: 'lax', expires: expires7d })

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=1`)
}
