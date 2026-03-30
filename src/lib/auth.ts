import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Returns the authenticated Supabase user for the current request.
 * Wrapped in React cache() so multiple Server Components in the same render
 * tree (e.g. layout + page) share a single getUser() round-trip to Supabase.
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
