/**
 * StayRight Service Worker
 *
 * Strategy:
 *   /_next/static/*  — cache-first (immutable, content-addressed by Next.js)
 *   navigation/HTML  — network-first, serve cached version when offline
 *   /api/*           — network-only (never cache live data or Stripe/Supabase calls)
 *   cross-origin     — network-only (Supabase, PostHog, Stripe hosted pages)
 *
 * Offline behaviour:
 *   If the user is offline and visits a page they've loaded before, they see
 *   the last cached version (read-only). Trips, dashboard, reports — all work
 *   offline as long as they were visited at least once while online.
 */

const STATIC_CACHE = 'stayright-static-v1'
const PAGES_CACHE = 'stayright-pages-v1'

// ─── Lifecycle ───────────────────────────────────────────────────────────────

self.addEventListener('install', () => {
  // Take control immediately without waiting for old SW to finish
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Delete any old cache versions so stale assets don't linger
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ─── Fetch interception ──────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept GET requests from this origin
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Never cache API routes, auth callbacks, or Stripe redirects
  const skip = ['/api/', '/auth/', '/_next/webpack-hmr']
  if (skip.some((p) => url.pathname.startsWith(p))) return

  // Static assets (JS, CSS, fonts, images) — cache first
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Page navigations — network first, cache fallback for offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGES_CACHE))
    return
  }
})

// ─── Strategies ──────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Asset unavailable offline.', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // Offline fallback — only shown if the page was never cached
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>You're offline — StayRight</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0; background: #F8F9FA; }
    .card { background: white; border-radius: 1rem; padding: 2rem; max-width: 360px;
            text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    h1 { font-size: 1.25rem; color: #191C1D; margin: 0 0 .5rem; }
    p  { font-size: .875rem; color: #3D4A42; margin: 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You're offline</h1>
    <p>Visit this page while connected to the internet at least once and StayRight will cache it for offline use.</p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  }
}
