'use client'

/**
 * Fires login once when the dashboard (or any post-auth page) loads with
 * ?login=1 — set by the auth callback for returning Google OAuth users.
 * Email logins are tracked directly in LoginForm.
 */

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { track } from '@/lib/posthog'

function Inner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('login') !== '1') return
    track('login')
    const url = new URL(window.location.href)
    url.searchParams.delete('login')
    router.replace(url.pathname + (url.search || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

// Exported with its own Suspense boundary so callers don't need to wrap it
import { Suspense } from 'react'
export function LoginTracker() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
