'use client'

/**
 * Fires onboarding_skipped before invoking the server action.
 * Replaces the `<form action={skipOnboardingAction}>` button in the
 * onboarding welcome page.
 */

import { track } from '@/lib/posthog'
import { skipOnboardingAction } from '@/app/(app)/onboarding/actions'

export function SkipButton() {
  async function handleSkip() {
    track('onboarding_skipped')
    await skipOnboardingAction()
  }

  return (
    <button
      type="button"
      onClick={handleSkip}
      className="text-sm text-[#3D4A42] hover:text-[#006948] transition-colors cursor-pointer"
    >
      Skip setup
    </button>
  )
}
