'use client'

import { useState, useEffect } from 'react'
import { PaywallModal } from '@/components/app/trips/PaywallModal'
import { track } from '@/lib/posthog'
import type { ReportProfile, ReportTrip } from '@/lib/pdf/reportDocuments'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportsClientProps {
  profile: ReportProfile
  trips: ReportTrip[]
  isPro: boolean
}

type ReportType = 'ilr' | 'rolling' | 'custom'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayIso(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDateForFilename(iso: string): string {
  return iso // already YYYY-MM-DD
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Report card config
// ---------------------------------------------------------------------------

const REPORT_CARDS = [
  {
    id: 'ilr' as ReportType,
    title: 'ILR Absence Table',
    description:
      'Complete absence record for the full ILR qualifying period. Matches the format requested by the Home Office on the SET(O) form.',
    filename: (date: string) => `StayRight_ILR_Absence_Table_${date}.pdf`,
  },
  {
    id: 'rolling' as ReportType,
    title: 'Rolling Window History',
    description:
      'Month-by-month rolling window breakdown showing your 12-month absence count at the start of each month throughout your qualifying period.',
    filename: (date: string) => `StayRight_Rolling_Window_History_${date}.pdf`,
  },
  {
    id: 'custom' as ReportType,
    title: 'Custom Date Range',
    description: 'Absence record filtered to a date range you specify. Useful for focused reporting or specific visa renewal periods.',
    filename: (date: string) => `StayRight_Custom_Date_Range_${date}.pdf`,
    requiresDates: true,
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportsClient({ profile, trips, isPro }: ReportsClientProps) {
  const [showPaywall, setShowPaywall] = useState(false)
  const [generating, setGenerating] = useState<ReportType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState(todayIso())

  const today = todayIso()
  const hasTrips = trips.length > 0

  // Fire reports_viewed once when the reports page mounts
  useEffect(() => {
    track('reports_viewed')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGenerate(type: ReportType) {
    if (!isPro) {
      setShowPaywall(true)
      return
    }

    if (type === 'custom') {
      if (!customStart || !customEnd) {
        setError('Please select both a start and end date.')
        return
      }
      if (customStart > customEnd) {
        setError('Start date must be before end date.')
        return
      }
    }

    setError(null)
    setGenerating(type)

    try {
      // Dynamic import — keeps @react-pdf/renderer out of the initial bundle
      const { pdf } = await import('@react-pdf/renderer')
      const docs = await import('@/lib/pdf/reportDocuments')

      const generatedOn = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      // Typed to match what pdf() expects from @react-pdf/renderer
      type PdfArg = Parameters<typeof pdf>[0]
      let element: PdfArg

      if (type === 'ilr') {
        element = docs.ILRAbsenceTableDocument({ trips, profile, generatedOn }) as unknown as PdfArg
      } else if (type === 'rolling') {
        element = docs.RollingWindowHistoryDocument({ trips, profile, generatedOn }) as unknown as PdfArg
      } else {
        element = docs.CustomDateRangeDocument({
          trips,
          profile,
          generatedOn,
          startDate: customStart,
          endDate: customEnd,
        }) as unknown as PdfArg
      }

      const blob = await pdf(element).toBlob()
      const card = REPORT_CARDS.find((c) => c.id === type)!
      triggerDownload(blob, card.filename(formatDateForFilename(today)))
      track('pdf_generated', { report_type: type })
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <>
      <div className="p-6 md:p-8 max-w-4xl">
        {/* Page header */}
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-1">
          Reports &amp; Exports
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Generate PDF documents suitable for inclusion in an ILR application.
          {!isPro && (
            <span className="ml-1 text-[var(--color-green-light)] font-medium">
              Pro plan required —{' '}
              <button
                className="underline"
                onClick={() => setShowPaywall(true)}
              >
                upgrade to download
              </button>
              .
            </span>
          )}
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!hasTrips && (
          <div className="mb-8 px-5 py-4 bg-[var(--color-bg-tinted)] rounded-xl text-sm text-[var(--color-text-muted)]">
            No absence data to report yet. Log your trips first, then come back to generate your ILR absence table.
          </div>
        )}

        {/* Report cards */}
        <div className="flex flex-col gap-4">
          {REPORT_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-[family-name:var(--font-manrope)] font-bold text-base text-[var(--color-text-primary)]">
                      {card.title}
                    </h2>
                    {!isPro && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-green-pale)] text-[var(--color-green)] text-[10px] font-semibold rounded-full uppercase tracking-wide">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{card.description}</p>

                  {/* Custom date range inputs */}
                  {card.requiresDates && (
                    <div className="flex items-center gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1 font-medium">From</label>
                        <input
                          type="date"
                          value={customStart}
                          max={customEnd || today}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="block px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1 font-medium">To</label>
                        <input
                          type="date"
                          value={customEnd}
                          min={customStart}
                          max={today}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="block px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleGenerate(card.id)}
                  disabled={generating === card.id}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isPro
                      ? 'text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-[var(--color-green-pale)] text-[var(--color-green)] hover:bg-[var(--color-border-strong)]'
                  }`}
                  style={isPro ? { background: 'var(--gradient-green)' } : undefined}
                >
                  {generating === card.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating…
                    </span>
                  ) : isPro ? (
                    'Download PDF'
                  ) : (
                    'Upgrade to Download'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pro note */}
        {!isPro && (
          <p className="mt-6 text-xs text-[var(--color-text-muted)]">
            PDF exports are available on the Pro plan.{' '}
            <button
              className="text-[var(--color-green-light)] underline font-medium"
              onClick={() => setShowPaywall(true)}
            >
              View Pro plans
            </button>
          </p>
        )}
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} triggerReason="pdf_export" />
    </>
  )
}
