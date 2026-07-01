import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})


const nextConfig: NextConfig = {
  // @react-pdf/renderer uses Node.js built-ins (fs, path) in its server build.
  // Marking it external prevents webpack from bundling it and breaking those imports.
  serverExternalPackages: ['@react-pdf/renderer'],

  // Dev-only error/build indicator — move it off the bottom-left so it doesn't
  // overlap the mobile bottom nav while developing. Not present in production.
  devIndicators: {
    position: 'top-right',
  },

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
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://eu.i.posthog.com http://127.0.0.1:54321 http://localhost:54321",
              "frame-src https://js.stripe.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async rewrites() {
    // Only proxy in development/test to avoid CSP/CI networking issues
    if (process.env.NODE_ENV === 'production' && !process.env.CI) {
      return []
    }

    return [
      {
        source: '/supabase-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'}/:path*`,
      },
    ]
  },
}

export default analyzer(nextConfig)
