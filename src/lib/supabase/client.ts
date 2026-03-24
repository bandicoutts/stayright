import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Browser client — use in Client Components ('use client')
export function createClient() {
  const isBrowser = typeof window !== 'undefined'
  // Use proxy path on browser to avoid CORS/CSP issues in CI
  // Must be an absolute URL for createBrowserClient
  const supabaseUrl = isBrowser 
    ? `${window.location.origin}/supabase-api` 
    : process.env.NEXT_PUBLIC_SUPABASE_URL!
  
  return createBrowserClient<Database>(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
