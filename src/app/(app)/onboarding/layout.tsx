import Link from 'next/link'
import { Shield } from '@/components/ui/Icons'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s — StayRight',
    default: 'Get started — StayRight',
  },
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="px-6 py-5 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-text-primary)] hover:text-[var(--color-green)] transition-colors"
        >
          <Shield className="w-5 h-5 text-[var(--color-green)]" weight="regular" />
          <span className="font-[family-name:var(--font-heading)] font-bold text-base tracking-tight">
            StayRight
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  )
}
