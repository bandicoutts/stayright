'use client'

/**
 * Fires onboarding_started once when the onboarding welcome page mounts.
 * Separate from SignupTracker so it fires for both new signups and users
 * who started onboarding but didn't complete it.
 */

import { useEffect } from 'react'
import { track } from '@/lib/posthog'

export function OnboardingStartedTracker() {
  useEffect(() => {
    track('onboarding_started')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
