import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('ms_access_token')
  cookieStore.delete('ms_refresh_token')
  cookieStore.delete('ms_email')
  cookieStore.delete('ms_name')
  return NextResponse.json({ ok: true })
}
