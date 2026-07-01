import Link from 'next/link'
import { ThemeToggle } from '@/components/app/ThemeToggle'
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
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 shrink-0 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold leading-none"
            style={{ background: 'var(--gradient-green)', color: '#fff' }}
            aria-hidden="true"
          >
            S
          </div>
          <span className="font-[family-name:var(--font-heading)] font-extrabold text-[1.0625rem] tracking-[-0.03em] text-[var(--color-text-primary)]">
            Stayright
          </span>
        </Link>

        <ThemeToggle />
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center shrink-0">
        <p className="text-xs text-[var(--color-text-muted)]">
          Not legal advice — always verify with UKVI.{' '}
          <Link
            href="/privacy-policy"
            className="underline hover:text-[var(--color-green)] transition-colors"
          >
            Privacy
          </Link>{' '}
          ·{' '}
          <Link
            href="/terms"
            className="underline hover:text-[var(--color-green)] transition-colors"
          >
            Terms
          </Link>
        </p>
      </footer>
    </div>
  )
}
