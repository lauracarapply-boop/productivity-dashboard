import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let sessionInfo: unknown = 'skipped'

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      })
      const { data, error } = await supabase.auth.getUser()
      sessionInfo = error ? { error: error.message } : { user: data.user?.email ?? null, id: data.user?.id ?? null }
    } catch (e) {
      sessionInfo = { threw: String(e) }
    }
  }

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `set (${supabaseUrl.slice(0, 30)}...)` : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? `set (${supabaseKey.slice(0, 20)}...)` : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'MISSING',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? 'MISSING',
    cookies: request.cookies.getAll().map(c => c.name),
    session: sessionInfo,
  })
}
