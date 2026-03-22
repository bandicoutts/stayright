'use client'

/**
 * Fires upgrade_completed once when the user lands on the dashboard
 * after a successful Stripe Checkout (the checkout API sets ?upgraded=1
 * as the success_url). Cleans the param from the URL after firing.
 */

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { track } from '@/lib/posthog'

export function UpgradeTracker({ planType }: { planType?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      track('upgrade_completed', { plan: planType ?? 'unknown' })
      // Remove the query param without a page reload
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      router.replace(url.pathname + (url.search || ''))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
