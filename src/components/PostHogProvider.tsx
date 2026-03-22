'use client'

/**
 * PostHogProvider
 *
 * - Wraps the app and initialises PostHog on mount if the user has already
 *   accepted analytics cookies.
 * - Listens for a custom `cookie-consent` window event dispatched by
 *   CookieBanner when the user makes a choice in the same tab (the native
 *   `storage` event only fires in other tabs).
 * - Tracks page views on route changes via usePathname / useSearchParams.
 */

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, optOutCapturing } from '@/lib/posthog'

// Inner component — useSearchParams() must be inside Suspense in App Router
function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Dynamically import to avoid SSR issues
    import('posthog-js').then(({ default: posthog }) => {
      if (posthog.__loaded) {
        posthog.capture('$pageview', {
          $current_url: window.location.href,
        })
      }
    })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (consent === 'accepted') {
      initPostHog()
    }

    // Handle consent change in this tab (CookieBanner dispatches this event)
    function onConsentChange(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      if (detail === 'accepted') {
        initPostHog() // idempotent — won't double-init
      } else {
        optOutCapturing()
      }
    }

    window.addEventListener('cookie-consent', onConsentChange)
    return () => window.removeEventListener('cookie-consent', onConsentChange)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  )
}
