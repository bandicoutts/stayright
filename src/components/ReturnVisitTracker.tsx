'use client'

/**
 * Fires return_visit { days_since_last: n } once per calendar day when an
 * authenticated user returns to the app after being away.
 *
 * Uses localStorage key 'sr_last_visit' (epoch ms) to compute the gap.
 * Only fires when the user has been away at least 1 full day, so a page
 * refresh doesn't re-trigger it. Updates the stored timestamp on every visit.
 */

import { useEffect } from 'react'
import { track } from '@/lib/posthog'

export function ReturnVisitTracker() {
  useEffect(() => {
    try {
      const KEY = 'sr_last_visit'
      const now = Date.now()
      const stored = localStorage.getItem(KEY)

      if (stored) {
        const lastVisit = parseInt(stored, 10)
        const daysSince = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24))
        if (daysSince >= 1) {
          track('return_visit', { days_since_last: daysSince })
        }
      }

      // Always update to today's timestamp
      localStorage.setItem(KEY, String(now))
    } catch {
      // localStorage may be unavailable in some private browsing contexts
    }
  }, [])

  return null
}
