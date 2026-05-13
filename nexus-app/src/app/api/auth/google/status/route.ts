import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('google_access_token')?.value
  const email = cookieStore.get('google_email')?.value
  const name = cookieStore.get('google_name')?.value

  return NextResponse.json({
    connected: !!accessToken,
    email: email ?? null,
    name: name ?? null,
  })
}
