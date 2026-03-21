import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Admin client — service role, bypasses RLS.
// Use ONLY in server-side code: API routes, Stripe webhooks, cron jobs.
// NEVER import this in Client Components or expose to the browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
