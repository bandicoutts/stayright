'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TripDrawer } from '@/components/app/trips/TripDrawer'
import type { TripInput } from '@/lib/calculations/absenceEngine'

interface Props {
  trips: TripInput[]
  visaStartDate?: string
  isPro: boolean
  tripCount: number
}

/**
 * Reads ?drawer=plan|log from the current URL and opens TripDrawer on the
 * dashboard without navigating away. After save (or "Just checking"),
 * TripFlowClient redirects back to /dashboard.
 *
 * Free users at the 3-trip limit are redirected to /trips instead, where
 * the existing PaywallModal fires via TripsClient.
 */
export function DashboardDrawerWrapper({ trips, visaStartDate, isPro, tripCount }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawMode = searchParams.get('drawer')
  const drawerMode = rawMode === 'plan' || rawMode === 'log' ? rawMode : null
  const atLimit = !isPro && tripCount >= 3

  // Free users at the limit: send them to the trips page where the paywall fires
  useEffect(() => {
    if (drawerMode && atLimit) {
      router.replace('/trips')
    }
  }, [drawerMode, atLimit, router])

  const drawerOpen = drawerMode !== null && !atLimit

  return (
    <TripDrawer
      open={drawerOpen}
      mode={drawerMode ?? 'log'}
      onClose={() => router.push('/dashboard')}
      existingTrips={trips}
      visaStartDate={visaStartDate}
      isPro={isPro}
      tripCount={tripCount}
      redirectTo="/dashboard"
    />
  )
}
