import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})


const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-inline for its runtime scripts.
              // Nonce-based CSP is deferred to post-launch hardening (see DECISIONS.md).
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://eu.i.posthog.com",
              "frame-src https://js.stripe.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default analyzer(nextConfig)
