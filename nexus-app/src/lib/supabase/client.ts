import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use localStorage so the PKCE code verifier survives the OAuth redirect
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  )
}
