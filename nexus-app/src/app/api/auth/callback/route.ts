import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=1`)
  }

  // On Vercel, x-forwarded-host is the real public hostname (stable across deployments)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const redirectBase = forwardedHost ? `https://${forwardedHost}` : origin

  const response = NextResponse.redirect(`${redirectBase}${next}`)

  // Create Supabase client tied directly to this request/response
  // so session cookies are written onto the redirect response itself
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${redirectBase}/login?error=1`)
  }

  // Store Google provider tokens so Calendar/Gmail/Drive API routes work
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
