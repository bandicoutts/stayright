'use client'

/**
 * Fires signup_completed once when the onboarding welcome page loads with
 * ?signup=1 (set by the auth callback or LoginForm for new users).
 * Reads ?method=google|email from the URL and passes it as a property.
 * Cleans both params after firing.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { track } from '@/lib/posthog'

export function SignupTracker() {
  const router = useRouter()

  useEffect(() => {
    const url = new URL(window.location.href)
    const method = url.searchParams.get('method') ?? 'email'
    track('signup_completed', { method })
    url.searchParams.delete('signup')
    url.searchParams.delete('method')
    router.replace(url.pathname + (url.search || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
