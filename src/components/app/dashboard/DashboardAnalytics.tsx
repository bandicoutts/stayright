'use client'

/**
 * Fires dashboard_viewed on mount and sets all PostHog user properties.
 * Rendered as a Suspense child of the dashboard Server Component so it has
 * access to the fully computed profile + subscription + trip data.
 */

import { useEffect } from 'react'
import { track, setUserProperties } from '@/lib/posthog'
import type { UserProperties } from '@/lib/posthog'

interface Props {
  visaRoute: string | null
  ilrEligibilityDate: string | null   // YYYY-MM-DD
  daysUntilIlr: number | null
  isPro: boolean
  tripCount: number
  rollingWindowDays: number
  complianceStatus: 'SAFE' | 'WARNING' | 'DANGER' | 'BREACH'
}

export function DashboardAnalytics({
  visaRoute,
  ilrEligibilityDate,
  daysUntilIlr,
  isPro,
  tripCount,
  rollingWindowDays,
  complianceStatus,
}: Props) {
  useEffect(() => {
    track('dashboard_viewed')

    const props: UserProperties = {
      is_pro: isPro,
      trip_count: tripCount,
      current_rolling_window_days: rollingWindowDays,
      compliance_status: complianceStatus,
    }
    if (visaRoute) props.visa_route = visaRoute
    if (ilrEligibilityDate) props.qualifying_period = ilrEligibilityDate
    if (daysUntilIlr !== null) props.days_until_ilr = daysUntilIlr

    setUserProperties(props)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
