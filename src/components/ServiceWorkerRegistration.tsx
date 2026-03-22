'use client'

/**
 * Registers the service worker on mount.
 * Only runs in production — in development, the SW would cache stale
 * Turbopack chunks and cause confusing behaviour.
 */

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('[SW] Registration failed:', err))
    }
  }, [])

  return null
}
