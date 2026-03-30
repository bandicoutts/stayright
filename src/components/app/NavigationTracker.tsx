'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'

export function NavigationTracker() {
  const pathname = usePathname()
  const startRef = useRef<number>(0)
  const prevRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevRef.current && prevRef.current !== pathname) {
      posthog.capture('page_navigation', {
        from: prevRef.current,
        to: pathname,
        duration_ms: Math.round(performance.now() - startRef.current),
      })
    }
    prevRef.current = pathname
    startRef.current = performance.now()
  }, [pathname])

  return null
}
