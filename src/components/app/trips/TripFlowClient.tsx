'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  isCrownDependency,
  calculateWhatIf,
  calculateTripAbsenceDays,
  getRiskStatus,
  hasOverlappingTrip,
} from '@/lib/calculations/absenceEngine'
import type { TripInput, RollingWindowResult } from '@/lib/calculations/absenceEngine'
import { addTripAction, updateTripAction } from '@/app/(app)/(main)/dashboard/actions'
import { DestinationAutocomplete } from './DestinationAutocomplete'
import { DateRangePicker } from './DateRangePicker'
import { track } from '@/lib/posthog'
import { RISK_CONFIG } from '@/lib/riskConfig'
import { formatDateRange } from '@/lib/utils/dateFormatters'
import { useDebounce } from '@/hooks/useDebounce'
import { Spinner } from '@/components/ui/Spinner'
import { Check } from '@/components/ui/Icons'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InitialTrip {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
  notes: string | null
}

interface TripFlowClientProps {
  mode: 'plan' | 'log' | 'edit'
  existingTrips: TripInput[]
  visaStartDate?: string
  isPro: boolean
  tripCount: number
  initialTrip?: InitialTrip
  /** Where to navigate after a successful save or "Just checking". Defaults to '/dashboard'. */
  redirectTo?: string
  /** Called once after a successful save so the host modal can drop its "discard?" guard. */
  onSaved?: () => void
}

// ---------------------------------------------------------------------------
// Live calculation panel
// ---------------------------------------------------------------------------

function CalcPanel({
  result,
  tripDays,
  windowEndDate,
}: {
  result: RollingWindowResult
  tripDays: number
  windowEndDate: Date
}) {
  const cfg = RISK_CONFIG[result.status]
  const remaining = Math.max(0, 180 - result.days)
  const barPct = Math.min(100, (result.days / 180) * 100)

  return (
    <div aria-live="polite" className="p-4 bg-[var(--color-bg-tinted)] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">This trip</span>
        <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--color-text-primary)]">{tripDays} {tripDays === 1 ? 'day' : 'days'}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">Days remaining after</span>
        <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--color-text-primary)]">{remaining} days</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
          <span className="font-[family-name:var(--font-mono)]">{result.days} / 180 days used</span>
          <span>to {windowEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-text-primary)]/8 rounded-full overflow-hidden" role="progressbar" aria-valuenow={result.days} aria-valuemin={0} aria-valuemax={180}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              result.status === 'SAFE' ? 'bg-[var(--color-green)]' :
              result.status === 'WARNING' ? 'bg-[var(--color-status-amber)]' : 'bg-[var(--color-status-red)]'
            }`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      {/* Risk badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
        {result.status === 'SAFE' && (
          <span className="text-xs text-[var(--color-text-muted)]">Safe to travel</span>
        )}
        {result.status === 'WARNING' && (
          <span className="text-xs text-[var(--color-warning-text)]">Approaching the limit. Plan carefully.</span>
        )}
        {result.status === 'DANGER' && (
          <span className="text-xs text-[var(--color-danger-text)]">Very close to the 180-day limit</span>
        )}
      </div>

      {/* Breach warning */}
      {result.status === 'BREACH' && (
        <div className="p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl">
          <p className="text-xs font-semibold text-[var(--color-danger-text)]">
            This trip would push you to {result.days}/180 days in the rolling window ending{' '}
            {windowEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}. You would breach the absence limit.
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component — single-sheet form + success state (reskin Phase 8)
// ---------------------------------------------------------------------------

export function TripFlowClient({
  mode,
  existingTrips,
  visaStartDate,
  tripCount,
  initialTrip,
  redirectTo = '/dashboard',
  onSaved,
}: TripFlowClientProps) {
  const router = useRouter()

  // For edit mode, exclude the trip being edited from existingTrips so we don't
  // double-count it during the live what-if calculation
  const baseTrips = useMemo(() => {
    if (mode === 'edit' && initialTrip) {
      return existingTrips.filter((t) => t.id !== initialTrip.id)
    }
    return existingTrips
  }, [mode, initialTrip, existingTrips])

  // Form values — pre-fill for edit mode
  const [destination, setDestination] = useState(initialTrip?.destination ?? '')
  const [departureDate, setDepartureDate] = useState(initialTrip?.departure_date ?? '')
  const [returnDate, setReturnDate] = useState(initialTrip?.return_date ?? '')
  const [returnDateKnown, setReturnDateKnown] = useState(
    mode === 'edit' ? initialTrip?.return_date !== null : true
  )
  const [notes, setNotes] = useState(initialTrip?.notes ?? '')

  const [saving, setSaving] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Success state — shown after a save instead of navigating straight away
  const [saved, setSaved] = useState<{ destination: string; range: string } | null>(null)

  const isCrownDep = destination.trim().length > 0 && isCrownDependency(destination)

  // Today (UTC ISO) — used to derive whether this is a planned (future) trip
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])
  // Planned is DERIVED from the dates (D2 / DECISION-077): a future departure shows
  // as "Planned" until the day passes. There is no stored status column.
  const isPlanned = !!departureDate && departureDate > todayISO

  // Fire trip_plan_opened once when the plan mode component mounts
  useEffect(() => {
    if (mode === 'plan') {
      track('trip_plan_opened')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const debouncedDeparture = useDebounce(departureDate, 400)
  const debouncedReturn = useDebounce(returnDate, 400)

  // ---------------------------------------------------------------------------
  // Live calculation
  // ---------------------------------------------------------------------------

  const calcResult = useMemo<{ result: RollingWindowResult; tripDays: number; windowEnd: Date } | null>(() => {
    if (!debouncedDeparture || !debouncedReturn || !returnDateKnown) return null
    if (debouncedReturn <= debouncedDeparture) return null

    if (isCrownDep) {
      return {
        result: {
          days: 0,
          status: 'SAFE',
          windowStart: new Date(),
          windowEnd: new Date(debouncedReturn + 'T00:00:00Z'),
        },
        tripDays: 0,
        windowEnd: new Date(debouncedReturn + 'T00:00:00Z'),
      }
    }

    // Use return_date as `today` so future trips project the rolling window correctly
    // (DECISION-022)
    const projectedToday = new Date(debouncedReturn + 'T00:00:00Z')
    const result = calculateWhatIf(
      baseTrips,
      { destination, departure_date: debouncedDeparture, return_date: debouncedReturn },
      projectedToday,
      visaStartDate
    )

    const tripDays = calculateTripAbsenceDays({
      destination,
      departure_date: debouncedDeparture,
      return_date: debouncedReturn,
    })

    return { result, tripDays, windowEnd: result.windowEnd }
  }, [debouncedDeparture, debouncedReturn, returnDateKnown, destination, isCrownDep, baseTrips, visaStartDate])

  // Overlap detection — live check against baseTrips while the user fills in dates
  // baseTrips already excludes the trip being edited in edit mode (see above)
  const overlapWarning = useMemo(() => {
    if (!debouncedDeparture) return false
    const retDate = returnDateKnown && debouncedReturn ? debouncedReturn : null
    return hasOverlappingTrip(baseTrips, debouncedDeparture, retDate)
  }, [debouncedDeparture, debouncedReturn, returnDateKnown, baseTrips])

  // Risk status for the summary chip
  const summaryRisk = useMemo(() => {
    if (!returnDate || !returnDateKnown) return null
    if (isCrownDep) return 'SAFE' as const
    if (!departureDate || returnDate <= departureDate) return null
    const days = calculateTripAbsenceDays({
      destination,
      departure_date: departureDate,
      return_date: returnDate,
    })
    return getRiskStatus(days)
  }, [destination, departureDate, returnDate, returnDateKnown, isCrownDep])

  const tripAbsenceDays = useMemo(() => {
    if (!returnDateKnown || !returnDate || !departureDate || returnDate <= departureDate) return null
    if (isCrownDep) return 0
    return calculateTripAbsenceDays({ destination, departure_date: departureDate, return_date: returnDate })
  }, [destination, departureDate, returnDate, returnDateKnown, isCrownDep])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function validate(): string | null {
    if (!destination.trim()) return 'Please enter a destination.'
    if (!departureDate) return 'Please enter a departure date.'
    if (returnDateKnown) {
      if (!returnDate) return "Please enter a return date, or choose \"I'll log my return later\"."
      if (returnDate <= departureDate) return 'Departure date must be before the return date.'
    }
    if (overlapWarning) return 'These dates overlap with an existing trip. Please check your trip history.'
    return null
  }

  async function handleSave() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    const data = {
      destination: destination.trim(),
      departure_date: departureDate,
      return_date: returnDateKnown && returnDate ? returnDate : null,
      notes: notes.trim() || null,
    }

    let result
    if (mode === 'edit' && initialTrip) {
      result = await updateTripAction(initialTrip.id, data)
    } else {
      result = await addTripAction(data)
    }

    if ('error' in result) {
      setError(result.error)
      setSaving(false)
      return
    }

    if (mode === 'edit') {
      track('trip_edited')
    } else if (mode === 'plan') {
      // trip_plan_completed: include the calculated impact for this specific trip
      track('trip_plan_completed', {
        days: calcResult?.tripDays ?? 0,
        verdict: calcResult?.result.status ?? 'SAFE',
      })
      track('trip_logged')
    } else {
      // log mode
      track('trip_logged')
    }

    // trip_count_milestone for counts 1, 3, 10
    if (mode !== 'edit') {
      const newCount = tripCount + 1
      if (newCount === 1 || newCount === 3 || newCount === 10) {
        track('trip_count_milestone', { count: newCount })
      }
    }

    // Bust the client-side router cache so the dashboard / trips list reflect the
    // new trip immediately. revalidatePath (server action) handles the server cache;
    // router.refresh() handles the client prefetch cache.
    router.refresh()
    // Let the host modal drop its unsaved-changes guard, then show the success state.
    onSaved?.()
    setSaved({
      destination: data.destination,
      range: formatDateRange(data.departure_date, data.return_date),
    })
    setSaving(false)
  }

  function handleJustChecking() {
    setNavigating(true)
    track('trip_plan_just_checking')
    router.push(redirectTo)
  }

  function handleLogAnother() {
    setSaved(null)
    setDestination('')
    setDepartureDate('')
    setReturnDate('')
    setReturnDateKnown(true)
    setNotes('')
    setError(null)
  }

  const saveLabel =
    mode === 'plan' ? 'Save this trip' :
    mode === 'edit' ? 'Save changes' :
                      'Log trip'

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------

  if (saved) {
    const successHeading = mode === 'edit' ? 'Changes saved' : 'Trip logged'
    return (
      <div className="p-5 md:p-6">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[var(--color-green-pale)] flex items-center justify-center mb-5">
            <Check className="w-8 h-8 text-[var(--color-green)]" weight="bold" />
          </div>
          <h2 className="font-[family-name:var(--font-manrope)] font-extrabold text-xl tracking-tight text-[var(--color-text-primary)] mb-1">
            {successHeading}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-5">
            <span className="font-medium text-[var(--color-text-primary)]">{saved.destination}</span>
            {' · '}
            <span className="font-[family-name:var(--font-mono)]">{saved.range}</span>
          </p>

          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={() => router.push('/trips')}
              className="w-full text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: 'var(--gradient-green)' }}
            >
              View in Trips
            </button>
            {mode !== 'edit' && (
              <button
                type="button"
                onClick={handleLogAnother}
                className="w-full border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
              >
                Log another
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push(redirectTo)}
              className="w-full text-[var(--color-text-muted)] rounded-xl px-4 py-2.5 text-sm font-medium hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Form (single sheet)
  // ---------------------------------------------------------------------------

  return (
    <div className="p-4 md:p-5">
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5 md:p-6 space-y-5">

        {/* ── Destination ─────────────────────────────────────────────── */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Destination
          </label>
          <DestinationAutocomplete
            id="destination"
            value={destination}
            onChange={setDestination}
            autoFocus={mode !== 'edit'}
          />
          {isCrownDep && (
            <div className="mt-2 px-3 py-2 bg-[var(--color-green-pale)]/50 border border-[var(--color-green)]/20 rounded-lg flex items-start gap-2">
              <span className="text-[var(--color-green)] text-sm font-semibold shrink-0">✓</span>
              <p className="text-xs text-[var(--color-text-primary)]">
                <span className="font-semibold">Counts as 0 days.</span>{' '}
                Crown Dependencies count as UK presence.
              </p>
            </div>
          )}
        </div>

        {/* ── Dates ───────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Travel dates</span>
            {isPlanned && (
              <span className="inline-flex items-center gap-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border border-dashed border-[var(--color-teal)]/50 text-[var(--color-teal)]">
                Planned
              </span>
            )}
          </div>
          <DateRangePicker
            departureDate={departureDate}
            returnDate={returnDate}
            returnDateKnown={returnDateKnown}
            onDepartureChange={setDepartureDate}
            onReturnChange={setReturnDate}
            onReturnDateKnownChange={setReturnDateKnown}
          />

          {returnDateKnown && returnDate && departureDate && returnDate <= departureDate && (
            <p className="mt-2 text-sm text-[var(--color-danger-text)]">
              Departure date must be before the return date.
            </p>
          )}

          {overlapWarning && !(returnDateKnown && returnDate && returnDate <= departureDate) && (
            <div className="mt-3 px-4 py-3 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl flex items-start gap-3">
              <span className="shrink-0 text-base">⚠️</span>
              <p className="text-sm text-[var(--color-warning-text)]">
                These dates overlap with an existing trip. Adjust the dates or check
                your trip history before continuing.
              </p>
            </div>
          )}
        </div>

        {/* ── Live compliance impact ──────────────────────────────────── */}
        {isCrownDep && departureDate ? (
          <div className="px-4 py-4 bg-[var(--color-green-pale)]/50 border border-[var(--color-green)]/20 rounded-xl">
            <p className="text-sm text-[var(--color-text-primary)]">
              <span className="font-semibold text-[var(--color-green)]">0 absence days.</span>{' '}
              Crown Dependencies count as UK presence.
            </p>
          </div>
        ) : calcResult ? (
          <CalcPanel
            result={calcResult.result}
            tripDays={calcResult.tripDays}
            windowEndDate={calcResult.windowEnd}
          />
        ) : null}

        {/* ── Reason for travel (DECISION-025: maps to the ILR PDF) ───── */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Reason for travel <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Family visit · Dubai → Bangkok → London (multi-leg)"
            rows={2}
            className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 focus:border-[var(--color-green)]/50 transition-shadow resize-none bg-[var(--color-surface)]"
          />
          <p className="mt-1 text-xs text-[var(--color-text-faint)]">Appears as &quot;Reason for travel&quot; in your ILR export.</p>
        </div>

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && (
          <div className="px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
            {error}
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: 'var(--gradient-green)' }}
          >
            <span className="flex items-center justify-center gap-2">
              {saving && <Spinner />}
              {saving ? 'Saving…' : saveLabel}
            </span>
          </button>

          {mode === 'plan' && (
            <button
              type="button"
              onClick={handleJustChecking}
              disabled={saving || navigating}
              className="w-full border border-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--color-bg-tinted)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                {navigating && <Spinner />}
                {navigating ? 'Just a moment…' : 'Just checking'}
              </span>
            </button>
          )}
        </div>

        {/* Trip summary line — gives the single sheet a confirm-step read */}
        {(summaryRisk || tripAbsenceDays !== null) && departureDate && (
          <div className="flex items-center justify-between gap-3 pt-1 text-xs text-[var(--color-text-muted)]">
            <span className="font-[family-name:var(--font-mono)]">
              {formatDateRange(departureDate, returnDateKnown && returnDate ? returnDate : null)}
              {tripAbsenceDays !== null && ` · ${tripAbsenceDays} ${tripAbsenceDays === 1 ? 'day' : 'days'}`}
            </span>
            {summaryRisk && (
              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${RISK_CONFIG[summaryRisk].bg} ${RISK_CONFIG[summaryRisk].text}`}>
                {RISK_CONFIG[summaryRisk].label}
              </span>
            )}
            {!returnDateKnown && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
                Currently abroad
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
