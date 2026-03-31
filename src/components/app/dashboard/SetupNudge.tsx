'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const DISMISSED_KEY = 'setup-nudge-dismissed'

export function SetupNudge() {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid hydration flash

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(localStorage.getItem(DISMISSED_KEY) === '1')
  }, [])

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="mb-6 px-4 py-3 bg-[var(--color-green-pale)] border border-[var(--color-green)]/20 rounded-xl flex items-center gap-3">
      <div className="flex-1 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-green)]/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[var(--color-green)]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.5a1 1 0 110-2 1 1 0 010 2z" fill="currentColor" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-primary)]">
          <span className="font-semibold">Finish setting up your profile</span>{' '}
          to see your compliance status.{' '}
          <Link
            href="/onboarding/visa?force=1"
            className="text-[var(--color-green)] font-medium underline underline-offset-2"
          >
            Complete setup →
          </Link>
        </p>
      </div>
      <button
        onClick={dismiss}
        className="text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss setup nudge"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
