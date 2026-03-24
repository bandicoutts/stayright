import Link from 'next/link'
import { Shield } from '@/components/ui/Icons'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s — StayRight',
    default: 'StayRight',
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#191C1D] hover:text-[#006948] transition-colors"
        >
          <Shield className="w-5 h-5 text-[#006948]" weight="regular" />
          <span className="font-[family-name:var(--font-manrope)] font-bold text-base tracking-tight">
            StayRight
          </span>
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center shrink-0">
        <p className="text-xs text-[#3D4A42]">
          Not legal advice — always verify with UKVI.{' '}
          <Link
            href="/privacy-policy"
            className="underline hover:text-[#006948] transition-colors"
          >
            Privacy
          </Link>{' '}
          ·{' '}
          <Link
            href="/terms"
            className="underline hover:text-[#006948] transition-colors"
          >
            Terms
          </Link>
        </p>
      </footer>
    </div>
  )
}
