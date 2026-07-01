'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to server-side error tracking when available
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-[family-name:var(--font-heading)] font-extrabold text-[var(--color-status-red)] mb-4">
          Oops
        </p>
        <h1 className="text-xl font-[family-name:var(--font-heading)] font-bold text-[var(--color-text-primary)] mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          An unexpected error occurred. Try again, or contact support if the problem persists.
        </p>
        <button
          type="button"
          onClick={reset}
          className="text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
