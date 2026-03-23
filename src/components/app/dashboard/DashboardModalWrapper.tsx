'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TripModal } from '@/components/app/trips/TripModal'
import { PaywallModal } from '@/components/app/trips/PaywallModal'
import type { TripInput } from '@/lib/calculations/absenceEngine'

interface Props {
  trips: TripInput[]
  visaStartDate?: string
  isPro: boolean
  tripCount: number
}

/**
 * Reads ?modal=plan|log from the current URL and opens TripModal on the
 * dashboard without navigating away. After save (or "Just checking"),
 * TripFlowClient redirects back to /dashboard.
 *
 * Free users at the 3-trip limit are redirected to /trips instead, where
 * the existing PaywallModal fires via TripsClient.
 */
export function DashboardModalWrapper({ trips, visaStartDate, isPro, tripCount }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawMode = searchParams.get('modal')
  const drawerMode = rawMode === 'plan' || rawMode === 'log' ? rawMode : null
  const atLimit = !isPro && tripCount >= 3
  const [showPaywall, setShowPaywall] = useState(false)

  // Free users at the limit: intercept drawer opening and show paywall instead
  useEffect(() => {
    if (drawerMode && atLimit) {
      setShowPaywall(true)
      router.replace('/dashboard') // clear the URL param
    }
  }, [drawerMode, atLimit, router])

  const drawerOpen = drawerMode !== null && !atLimit

  return (
    <>
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        triggerReason="trip_limit"
      />
      <TripModal
      open={drawerOpen}
      mode={drawerMode ?? 'log'}
      onClose={() => router.push('/dashboard')}
      existingTrips={trips}
      visaStartDate={visaStartDate}
      isPro={isPro}
      tripCount={tripCount}
      redirectTo="/dashboard"
    />
    </>
  )
}
