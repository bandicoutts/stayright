'use client'

/**
 * Fires posthog.identify(userId) once per authenticated session.
 * Only the Supabase user ID (UUID) is sent — no name or email (PRD §4n).
 */

import { useEffect } from 'react'
import { identifyUser } from '@/lib/posthog'

export function PostHogIdentify({ userId }: { userId: string }) {
  useEffect(() => {
    identifyUser(userId)
  }, [userId])
  return null
}
