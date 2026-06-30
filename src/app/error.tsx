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
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-[family-name:var(--font-heading)] font-extrabold text-[#BA1A1A] mb-4">
          Oops
        </p>
        <h1 className="text-xl font-[family-name:var(--font-heading)] font-bold text-[#191C1D] mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-[#3D4A42] mb-8">
          An unexpected error occurred. Try again, or contact support if the problem persists.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-[#006948] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#00855D] transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
