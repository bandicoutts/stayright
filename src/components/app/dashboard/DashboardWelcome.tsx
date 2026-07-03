'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function DashboardWelcome() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('onboarded') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('onboarded')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  if (!show) return null

  return (
    <div
      className="mb-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-green)]/20 p-5"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-base text-[var(--color-text-primary)]">
            Setup complete
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Your dashboard now uses your visa start date and saved trips.
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors shrink-0 cursor-pointer mt-0.5"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: '⏱',
            title: 'Rolling window',
            desc: 'Your current 180-day absence count, based on saved trips.',
          },
          {
            icon: '📅',
            title: 'Qualifying period',
            desc: 'Your progress toward ILR eligibility from your visa start date.',
          },
          {
            icon: '✈️',
            title: 'Log trips',
            desc: 'Add trips when you return so the count stays current.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex gap-3 p-3 bg-[var(--color-bg-tinted)] rounded-xl">
            <span className="text-lg shrink-0" aria-hidden="true">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShow(false)}
        className="mt-4 text-sm font-medium text-[var(--color-green)] hover:underline cursor-pointer"
      >
        Got it
      </button>
    </div>
  )
}
