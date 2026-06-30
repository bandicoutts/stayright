'use client'

import { useState, useEffect, useMemo } from 'react'
import { PaywallModal } from '@/components/app/trips/PaywallModal'
import { track } from '@/lib/posthog'
import {
  calculateTripAbsenceDays,
  getPeakRollingWindow,
  getRiskStatus,
  isCrownDependency,
  type TripInput,
} from '@/lib/calculations/absenceEngine'
import { ReportPreview, type PreviewRow } from './ReportPreview'
import { Spinner } from '@/components/ui/Spinner'
import { FileArrowDown } from '@/components/ui/Icons'

interface ReportTrip {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
  notes: string | null
}

interface ReportsClientProps {
  hasTrips: boolean
  isPro: boolean
  trips: ReportTrip[]
  profile: { firstName: string; lastName: string | null; visaRoute: string; visaStartDate: string | null }
}

type Period = 'full' | 'last12' | 'calendar' | 'custom'

const PRESETS: { id: Period; label: string }[] = [
  { id: 'full', label: 'Full qualifying period' },
  { id: 'last12', label: 'Last 12 months' },
  { id: 'calendar', label: 'Calendar year' },
  { id: 'custom', label: 'Custom range' },
]

function iso(d: Date): string {
  return d.toISOString().split('T')[0]
}
function daysBetween(a: string, b: string): number {
  return Math.max(0, Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86_400_000))
}

export function ReportsClient({ hasTrips, isPro, trips, profile }: ReportsClientProps) {
  const [showPaywall, setShowPaywall] = useState(false)
  const [generating, setGenerating] = useState<'main' | 'rolling' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('full')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState(iso(new Date()))

  const today = iso(new Date())
  const generatedOn = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    track('reports_viewed')
  }, [])

  const tripInputs: TripInput[] = useMemo(
    () => trips.map((t) => ({ id: t.id, destination: t.destination, departure_date: t.departure_date, return_date: t.return_date })),
    [trips]
  )
  const completed = useMemo(() => trips.filter((t): t is ReportTrip & { return_date: string } => t.return_date !== null), [trips])

  // Resolve the selected period to a start/end + report type.
  const earliest = completed.length ? completed.map((t) => t.departure_date).sort()[0] : null
  const resolved = useMemo(() => {
    if (period === 'full') {
      return { label: 'Full qualifying period', start: profile.visaStartDate ?? earliest, end: today, type: 'ilr' as const }
    }
    if (period === 'last12') {
      const d = new Date(); d.setUTCFullYear(d.getUTCFullYear() - 1)
      return { label: 'Last 12 months', start: iso(d), end: today, type: 'custom' as const }
    }
    if (period === 'calendar') {
      return { label: 'Calendar year', start: `${new Date().getUTCFullYear()}-01-01`, end: today, type: 'custom' as const }
    }
    return { label: 'Custom range', start: customStart || null, end: customEnd || today, type: 'custom' as const }
  }, [period, profile.visaStartDate, earliest, today, customStart, customEnd])

  // Preview rows: completed trips in the period (full = all completed).
  const rows: PreviewRow[] = useMemo(() => {
    const inRange = (t: ReportTrip & { return_date: string }) => {
      if (period === 'full') return true
      if (!resolved.start) return false
      return t.departure_date <= resolved.end && t.return_date >= resolved.start
    }
    return completed
      .filter(inRange)
      .sort((a, b) => a.departure_date.localeCompare(b.departure_date))
      .map((t) => ({
        id: t.id,
        destination: t.destination,
        departure_date: t.departure_date,
        return_date: t.return_date,
        notes: t.notes,
        isCrown: isCrownDependency(t.destination),
        days: calculateTripAbsenceDays({ destination: t.destination, departure_date: t.departure_date, return_date: t.return_date }),
      }))
  }, [completed, period, resolved.start, resolved.end])

  const totalDays = rows.reduce((sum, r) => sum + r.days, 0)
  const peak = useMemo(
    () => (profile.visaStartDate && completed.length ? getPeakRollingWindow(tripInputs, profile.visaStartDate, new Date()) : null),
    [tripInputs, profile.visaStartDate, completed.length]
  )
  const peakDays = peak?.days ?? 0
  const periodDays = resolved.start ? daysBetween(resolved.start, resolved.end) : 0
  const status = getRiskStatus(peakDays)

  function download(which: 'main' | 'rolling') {
    if (!isPro) { setShowPaywall(true); return }

    const type = which === 'rolling' ? 'rolling' : resolved.type
    if (type === 'custom') {
      if (!resolved.start) { setError('Select a start and end date for a custom range.'); return }
      if (resolved.start > resolved.end) { setError('Start date must be before end date.'); return }
    }
    setError(null)
    setGenerating(which)
    try {
      const params = new URLSearchParams({ type })
      if (type === 'custom' && resolved.start) { params.set('start', resolved.start); params.set('end', resolved.end) }
      const a = document.createElement('a')
      a.href = `/api/reports/pdf?${params}`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      track('pdf_generated', { report_type: type })
    } finally {
      setGenerating(null)
    }
  }

  const statusTone =
    status === 'SAFE' ? 'var(--color-green)' : status === 'WARNING' ? 'var(--color-status-amber)' : 'var(--color-status-red)'

  const previewLabel = (
    <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.1em] uppercase text-[var(--color-text-faint)]">
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" /><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" /></svg>
      Live preview · A4
    </span>
  )

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-1">
        ILR evidence pack
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-2xl">
        A Home Office–aligned absence record you can hand in with your application. Choose a period and export it as a PDF.
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] text-sm rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-x-8 lg:gap-y-2.5 items-start max-w-6xl">
        {/* Header row (desktop) — empty left cell aligns the cards below */}
        <div className="hidden lg:block" aria-hidden="true" />
        <div className="hidden lg:block">{previewLabel}</div>

        {/* Left panel */}
        <div className="lg:sticky lg:top-6 flex flex-col gap-4">
          {/* Period selector */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] uppercase text-[var(--color-text-faint)] mb-3">Reporting period</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  aria-pressed={period === p.id}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer border"
                  style={
                    period === p.id
                      ? { background: 'var(--color-green-pale)', borderColor: 'var(--color-green)', color: 'var(--color-green)' }
                      : { background: 'var(--color-surface-warm)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-[var(--color-text-muted)] mb-1 font-medium">From</label>
                  <input type="date" value={customStart} max={customEnd || today} onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm font-[family-name:var(--font-mono)] border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-warm)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30" />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-[var(--color-text-muted)] mb-1 font-medium">To</label>
                  <input type="date" value={customEnd} min={customStart} max={today} onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm font-[family-name:var(--font-mono)] border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-warm)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30" />
                </div>
              </div>
            )}

            {/* Compliance chip */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
              <span className="w-2 h-2 rounded-full" style={{ background: statusTone }} />
              <span className="text-sm font-medium" style={{ color: statusTone }}>
                Peak window {peakDays}/180 · {status === 'SAFE' ? 'Compliant' : status === 'WARNING' ? 'Approaching limit' : status === 'DANGER' ? 'At risk' : 'Breach'}
              </span>
            </div>
          </div>

          {/* Export */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <button
              type="button"
              onClick={() => download('main')}
              disabled={generating !== null || !hasTrips}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={isPro ? { background: 'var(--gradient-green)', color: '#fff' } : { background: 'var(--color-green-pale)', color: 'var(--color-green)' }}
            >
              {generating === 'main' ? <Spinner /> : <FileArrowDown className="w-4 h-4" weight="bold" />}
              {isPro ? 'Export PDF' : 'Upgrade to export'}
            </button>
            <button
              type="button"
              onClick={() => download('rolling')}
              disabled={generating !== null || !hasTrips}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tinted)] transition-colors disabled:opacity-50"
            >
              {generating === 'rolling' ? <Spinner /> : null}
              Also export rolling-window history
            </button>
            {!isPro && (
              <p className="mt-3 text-[11px] text-[var(--color-text-faint)]">
                PDF export is a Pro feature.{' '}
                <button className="text-[var(--color-green-light)] underline font-medium" onClick={() => setShowPaywall(true)}>View Pro plans</button>
              </p>
            )}
          </div>
        </div>

        {/* Right: live preview */}
        <div>
          <div className="lg:hidden mb-2">{previewLabel}</div>
          {!hasTrips ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center text-sm text-[var(--color-text-muted)]" style={{ boxShadow: 'var(--shadow-card)' }}>
              No absence data to report yet. Log your trips first, then come back to generate your ILR absence pack.
            </div>
          ) : (
            <ReportPreview
              profile={profile}
              periodLabel={resolved.label}
              periodStart={period === 'full' ? null : resolved.start}
              periodEnd={resolved.end}
              rows={rows}
              totalDays={totalDays}
              peakDays={peakDays}
              periodDays={periodDays}
              generatedOn={generatedOn}
            />
          )}
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} triggerReason="pdf_export" />
    </div>
  )
}
