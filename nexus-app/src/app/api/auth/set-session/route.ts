import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  const { access_token, refresh_token, google_token, google_refresh, email, name } = await req.json()

  const response = NextResponse.json({ ok: true })

  // Use createServerClient so setSession writes cookies in the format the middleware expects
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.setSession({ access_token, refresh_token })

  // Also store Google provider tokens for Calendar/Gmail/Drive routes
  const base = { secure: true, path: '/', sameSite: 'lax' as const }
  const expires7d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const expires1y = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  if (google_token) {
    response.cookies.set('google_access_token', google_token, { ...base, httpOnly: true, expires: expires7d })
  }
  if (google_refresh) {
    response.cookies.set('google_refresh_token', google_refresh, { ...base, httpOnly: true, expires: expires1y })
  }
  if (email) response.cookies.set('google_email', email, { ...base, httpOnly: false, expires: expires7d })
  if (name) response.cookies.set('google_name', name, { ...base, httpOnly: false, expires: expires7d })

  return response
}
