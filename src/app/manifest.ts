import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StayRight — UK Visa Absence Tracker',
    short_name: 'StayRight',
    description:
      'Track your 180-day absence limit for Indefinite Leave to Remain. Built for Skilled Worker visa holders.',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#006948',
    theme_color: '#006948',
    categories: ['productivity', 'utilities'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        purpose: 'any maskable' as any,
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  }
}
