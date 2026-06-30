'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { calculateWhatIf, type RiskStatus, type TripInput } from '@/lib/calculations/absenceEngine'
import { addTripAction } from '@/app/(app)/(main)/dashboard/actions'
import { DestinationAutocomplete } from '@/components/app/trips/DestinationAutocomplete'
import { Spinner } from '@/components/ui/Spinner'
import { Check } from '@/components/ui/Icons'

const LIMIT = 180

const TONE: Record<RiskStatus, string> = {
  SAFE: 'var(--color-green-light)',
  WARNING: 'var(--color-status-amber)',
  DANGER: 'var(--color-status-red)',
  BREACH: 'var(--color-status-red)',
}

interface Props {
  existingTrips: TripInput[]
  visaStartDate?: string
  currentDays: number
}

/**
 * Inline what-if simulator (reskin Phase 2). Reuses the engine's
 * calculateWhatIf (DECISION-022: window projected to the trip's return date)
 * and can persist the result as a planned trip via the existing addTripAction.
 */
export function PlanTripSimulator({ existingTrips, visaStartDate, currentDays }: Props) {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [departure, setDeparture] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const datesValid = departure !== '' && returnDate !== '' && returnDate >= departure
  const hasDestination = destination.trim().length > 0
  // Saving requires a real destination so Crown-Dependency status is correct.
  const canSave = datesValid && hasDestination

  const projection = useMemo(() => {
    if (!datesValid) return null
    // Project to the return date so a future trip's days are included (DECISION-022).
    return calculateWhatIf(
      existingTrips,
      { destination: destination.trim() || 'Trip', departure_date: departure, return_date: returnDate },
      new Date(returnDate),
      visaStartDate
    )
  }, [datesValid, existingTrips, destination, departure, returnDate, visaStartDate])

  const delta = projection ? projection.days - currentDays : 0
  const tone = projection ? TONE[projection.status] : 'var(--color-text-primary)'

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    const result = await addTripAction({
      destination: destination.trim() || 'Planned trip',
      departure_date: departure,
      return_date: returnDate,
    })
    setSaving(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setSaved(true)
    setDestination('')
    setDeparture('')
    setReturnDate('')
    router.refresh()
    setTimeout(() => setSaved(false), 2500)
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-warm)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)]'

  return (
    <div
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-[family-name:var(--font-heading)] font-bold text-base tracking-tight text-[var(--color-text-primary)]">
          Plan a trip
        </h2>
        <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[var(--color-text-faint)]">
          What-if
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">Try a trip before you book it.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-3">
          <label htmlFor="sim-destination" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Destination</label>
          <DestinationAutocomplete id="sim-destination" value={destination} onChange={setDestination} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Departure</label>
          <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} className={`${inputCls} font-[family-name:var(--font-mono)]`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Return</label>
          <input type="date" value={returnDate} min={departure || undefined} onChange={(e) => setReturnDate(e.target.value)} className={`${inputCls} font-[family-name:var(--font-mono)]`} />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            title={!hasDestination && datesValid ? 'Add a destination to save' : undefined}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ background: 'var(--gradient-green)' }}
          >
            {saving ? <Spinner /> : saved ? <Check className="w-4 h-4" weight="bold" /> : null}
            {saved ? 'Saved' : 'Save as planned'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-[var(--color-danger-text)]">{error}</p>
      )}

      {projection && (
        <div
          className="mt-4 flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-warm)' }}
        >
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[var(--color-text-faint)]">
              Projected window
            </p>
            <p className="mt-0.5">
              <span className="font-[family-name:var(--font-mono)] font-semibold text-2xl" style={{ color: tone }}>{projection.days}</span>
              <span className="text-sm text-[var(--color-text-muted)]"> / {LIMIT} days</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: tone }}>
              {delta >= 0 ? `+${delta}` : delta} days
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {projection.days > LIMIT ? `${projection.days - LIMIT} over the limit` : `${LIMIT - projection.days} days to spare`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
