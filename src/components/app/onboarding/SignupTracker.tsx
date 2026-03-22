'use client'

/**
 * Fires signup_completed once when the onboarding welcome page loads with
 * ?signup=1 (set by the auth callback for new users). Cleans the URL param
 * after firing so it doesn't persist across navigation.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { track } from '@/lib/posthog'

export function SignupTracker() {
  const router = useRouter()

  useEffect(() => {
    track('signup_completed')
    // Remove ?signup=1 from the URL without a full navigation
    const url = new URL(window.location.href)
    url.searchParams.delete('signup')
    router.replace(url.pathname + (url.search || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
