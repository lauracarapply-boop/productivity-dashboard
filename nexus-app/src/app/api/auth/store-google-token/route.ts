import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { access_token, refresh_token, email, name } = await req.json()

  const res = NextResponse.json({ ok: true })
  const base = { secure: true, path: '/', sameSite: 'lax' as const }
  const expires7d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const expires1y = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  if (access_token) {
    res.cookies.set('google_access_token', access_token, { ...base, httpOnly: true, expires: expires7d })
  }
  if (refresh_token) {
    res.cookies.set('google_refresh_token', refresh_token, { ...base, httpOnly: true, expires: expires1y })
  }
  if (email) {
    res.cookies.set('google_email', email, { ...base, httpOnly: false, expires: expires7d })
  }
  if (name) {
    res.cookies.set('google_name', name, { ...base, httpOnly: false, expires: expires7d })
  }

  return res
}
