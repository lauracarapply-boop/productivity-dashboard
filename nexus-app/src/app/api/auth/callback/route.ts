import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // No code = Supabase never reached this callback (redirect URL not whitelisted)
  if (!code) {
    const error = searchParams.get('error') ?? 'no_code'
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const redirectBase = forwardedHost ? `https://${forwardedHost}` : origin

  const response = NextResponse.redirect(`${redirectBase}${next}`)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  // Redirect to login with the exact error so we can diagnose
  if (error) {
    return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(error.message)}`)
  }

  if (!data.session) {
    return NextResponse.redirect(`${redirectBase}/login?error=no_session`)
  }

  // Store Google provider tokens so Calendar/Gmail/Drive routes work
  const { session } = data
  const expires7d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const expires1y = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  const base = { secure: true, path: '/', sameSite: 'lax' as const }

  if (session.provider_token) {
    response.cookies.set('google_access_token', session.provider_token, { ...base, httpOnly: true, expires: expires7d })
  }
  if (session.provider_refresh_token) {
    response.cookies.set('google_refresh_token', session.provider_refresh_token, { ...base, httpOnly: true, expires: expires1y })
  }

  const email = session.user.email ?? ''
  const name = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? ''
  response.cookies.set('google_email', email, { ...base, httpOnly: false, expires: expires7d })
  response.cookies.set('google_name', name, { ...base, httpOnly: false, expires: expires7d })

  return response
}
