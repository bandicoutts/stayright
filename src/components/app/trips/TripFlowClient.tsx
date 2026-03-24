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
import { formatDate, formatDateRange } from '@/lib/utils/dateFormatters'
import { useDebounce } from '@/hooks/useDebounce'

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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < current ? 'w-8 bg-[var(--color-green)]' : i === current - 1 ? 'w-8 bg-[var(--color-green)]' : 'w-8 bg-[var(--color-border)]'
          }`}
        />
      ))}
    </div>
  )
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
    <div aria-live="polite" className="mt-4 p-4 bg-[var(--color-bg-tinted)] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">This trip</span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{tripDays} {tripDays === 1 ? 'day' : 'days'}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">Days remaining after</span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{remaining} days</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
          <span>{result.days} / 180 days used</span>
          <span>Rolling window to {windowEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
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
          <span className="text-xs text-[var(--color-warning-text)]">Approaching the limit — plan carefully</span>
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
// Main component
// ---------------------------------------------------------------------------

export function TripFlowClient({
  mode,
  existingTrips,
  visaStartDate,
  isPro: _isPro,
  tripCount,
  initialTrip,
  redirectTo = '/dashboard',
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

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Form values — pre-fill for edit mode
  const [destination, setDestination] = useState(initialTrip?.destination ?? '')
  const [departureDate, setDepartureDate] = useState(initialTrip?.departure_date ?? '')
  const [returnDate, setReturnDate] = useState(initialTrip?.return_date ?? '')
  const [returnDateKnown, setReturnDateKnown] = useState(
    mode === 'edit' ? initialTrip?.return_date !== null : true
  )
  const [notes, setNotes] = useState(initialTrip?.notes ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCrownDep = destination.trim().length > 0 && isCrownDependency(destination)

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
  // Live calculation (Step 2)
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

  // Risk status for confirm step summary
  const confirmRisk = useMemo(() => {
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

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleStep1Next() {
    if (!destination.trim()) {
      setError('Please enter a destination.')
      return
    }
    setError(null)
    setStep(2)
  }

  function handleStep2Next() {
    if (!departureDate) {
      setError('Please enter a departure date.')
      return
    }
    if (returnDateKnown) {
      if (!returnDate) {
        setError("Please enter a return date, or choose \"I'll log my return later\".")
        return
      }
      if (returnDate <= departureDate) {
        setError('Departure date must be before the return date.')
        return
      }
    }
    // Block if the new dates collide with an existing trip
    if (overlapWarning) {
      setError('These dates overlap with an existing trip. Please check your trip history.')
      return
    }
    setError(null)
    setStep(3)
  }

  async function handleSave() {
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

    // Bust the client-side router cache so the dashboard quota ring
    // reflects the new trip immediately when navigated to.
    // revalidatePath (in the server action) handles the server cache;
    // router.refresh() handles the client prefetch cache.
    router.refresh()
    router.push(redirectTo)
  }

  function handleJustChecking() {
    track('trip_plan_just_checking')
    router.push(redirectTo)
  }

  // ---------------------------------------------------------------------------
  // Step labels
  // ---------------------------------------------------------------------------

  const pageTitle =
    mode === 'plan' ? 'Plan a trip' :
    mode === 'log'  ? 'Log a trip' :
                     'Edit trip'

  const pageSubtitle =
    mode === 'plan' ? 'See the impact on your 180-day window before you book.' :
    mode === 'log'  ? "Add a trip you've already taken." :
                     'Update the details for this trip.'

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[var(--color-text-primary)]">
          {pageTitle}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{pageSubtitle}</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
        <StepDots current={step} total={3} />

        {/* ── Step 1: Destination ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-faint)] uppercase tracking-widest mb-1">
              Step 1 of 3
            </p>
            <h2 className="font-[family-name:var(--font-manrope)] font-extrabold text-xl text-[var(--color-text-primary)] mb-5">
              Where are you going?
            </h2>

            {error && (
              <div className="mb-4 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="destination" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Destination
              </label>
              <DestinationAutocomplete
                id="destination"
                value={destination}
                onChange={setDestination}
                autoFocus
              />
            </div>

            {/* Crown Dependency panel */}
            {isCrownDep && (
              <div className="mb-4 px-4 py-3 bg-[var(--color-green-pale)]/50 border border-[var(--color-green)]/20 rounded-xl flex items-start gap-3">
                <span className="text-[var(--color-green)] text-sm font-semibold shrink-0">✓</span>
                <p className="text-sm text-[var(--color-text-primary)]">
                  <span className="font-semibold">Crown Dependencies count as UK presence.</span>{' '}
                  This trip will not affect your absence record.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: 'var(--gradient-green)' }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: Dates ───────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-faint)] uppercase tracking-widest mb-1">
              Step 2 of 3
            </p>
            <h2 className="font-[family-name:var(--font-manrope)] font-extrabold text-xl text-[var(--color-text-primary)] mb-1">
              When are you travelling?
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">
              <span className="font-medium text-[var(--color-text-primary)]">{destination}</span>
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
                {error}
              </div>
            )}

            {/* Date range calendar */}
            <div className="mb-4">
              <DateRangePicker
                departureDate={departureDate}
                returnDate={returnDate}
                returnDateKnown={returnDateKnown}
                onDepartureChange={setDepartureDate}
                onReturnChange={setReturnDate}
                onReturnDateKnownChange={setReturnDateKnown}
              />
            </div>

            {/* Live calculation panel */}
            {isCrownDep && departureDate && (
              <div className="mb-4 px-4 py-3 bg-[var(--color-green-pale)]/50 border border-[var(--color-green)]/20 rounded-xl">
                <p className="text-sm text-[var(--color-text-primary)]">
                  <span className="font-semibold text-[var(--color-green)]">0 absence days.</span>{' '}
                  Crown Dependencies count as UK presence.
                </p>
              </div>
            )}

            {!isCrownDep && calcResult && (
              <CalcPanel
                result={calcResult.result}
                tripDays={calcResult.tripDays}
                windowEndDate={calcResult.windowEnd}
              />
            )}

            {/* Validation error for date order */}
            {returnDateKnown && returnDate && departureDate && returnDate <= departureDate && (
              <p className="mt-3 text-sm text-[var(--color-danger-text)]">
                Departure date must be before the return date.
              </p>
            )}

            {/* Overlap warning — live, shown as soon as a collision is detected */}
            {overlapWarning && !(returnDateKnown && returnDate && returnDate <= departureDate) && (
              <div className="mt-4 px-4 py-3 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl flex items-start gap-3">
                <span className="shrink-0 text-base">⚠️</span>
                <p className="text-sm text-[var(--color-warning-text)]">
                  These dates overlap with an existing trip. Adjust the dates or check
                  your trip history before continuing.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => { setStep(1); setError(null) }}
                className="px-4 py-3 text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                style={{ background: 'var(--gradient-green)' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm ─────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-faint)] uppercase tracking-widest mb-1">
              Step 3 of 3
            </p>
            <h2 className="font-[family-name:var(--font-manrope)] font-extrabold text-xl text-[var(--color-text-primary)] mb-5">
              {mode === 'plan' ? 'Review your trip' : 'Confirm and save'}
            </h2>

            {error && (
              <div className="mb-4 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
                {error}
              </div>
            )}

            {/* Trip summary card */}
            <div className="bg-[var(--color-bg-tinted)] rounded-xl p-4 mb-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{destination}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {formatDateRange(departureDate, returnDateKnown && returnDate ? returnDate : null)}
                  </p>
                </div>
                {confirmRisk && (
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${RISK_CONFIG[confirmRisk].bg} ${RISK_CONFIG[confirmRisk].text}`}>
                    {RISK_CONFIG[confirmRisk].label}
                  </span>
                )}
                {!returnDateKnown && (
                  <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
                    Currently abroad
                  </span>
                )}
              </div>

              {returnDateKnown && returnDate && !isCrownDep && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {calculateTripAbsenceDays({ destination, departure_date: departureDate, return_date: returnDate })} absence {calculateTripAbsenceDays({ destination, departure_date: departureDate, return_date: returnDate }) === 1 ? 'day' : 'days'}
                </p>
              )}
              {isCrownDep && (
                <p className="text-xs text-[var(--color-green)] font-medium">
                  Crown Dependency — 0 absence days
                </p>
              )}
            </div>

            {/* Rolling window impact */}
            {calcResult && (
              <div className="bg-[var(--color-bg-tinted)] rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-[var(--color-text-faint)] uppercase tracking-wider mb-2">
                  Rolling window impact
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Days used (after this trip)</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{calcResult.result.days} / 180</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--color-text-primary)]/8 rounded-full overflow-hidden mt-2" role="progressbar" aria-valuenow={calcResult.result.days} aria-valuemin={0} aria-valuemax={180}>
                  <div
                    className={`h-full rounded-full ${
                      calcResult.result.status === 'SAFE' ? 'bg-[var(--color-green)]' :
                      calcResult.result.status === 'WARNING' ? 'bg-[var(--color-status-amber)]' : 'bg-[var(--color-status-red)]'
                    }`}
                    style={{ width: `${Math.min(100, (calcResult.result.days / 180) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-5">
              <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Notes <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Dubai → Bangkok → London (multi-leg)"
                rows={2}
                className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 focus:border-[var(--color-green)]/50 transition-shadow resize-none bg-[var(--color-surface)]"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                style={{ background: 'var(--gradient-green)' }}
              >
                {saving
                  ? 'Saving…'
                  : mode === 'plan'
                  ? 'Save this trip'
                  : mode === 'edit'
                  ? 'Save changes'
                  : 'Save trip'}
              </button>

              {mode === 'plan' && (
                <button
                  type="button"
                  onClick={handleJustChecking}
                  disabled={saving}
                  className="w-full border border-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--color-bg-tinted)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Just checking
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setStep(2); setError(null) }}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors cursor-pointer"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
