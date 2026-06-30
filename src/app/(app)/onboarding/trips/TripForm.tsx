'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash } from '@/components/ui/Icons'
import { saveTripAction, deleteTripAction, completeOnboardingAction } from '../actions'
import { useDebounce } from '@/hooks/useDebounce'
import { track } from '@/lib/posthog'
import { hasOverlappingTrip } from '@/lib/calculations/absenceEngine'
import { DestinationAutocomplete } from '@/components/app/trips/DestinationAutocomplete'
import { DateRangePicker } from '@/components/app/trips/DateRangePicker'
import { formatDate } from '@/lib/utils/dateFormatters'

type TripRow = {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
}

interface Props {
  initialTrips: TripRow[]
  visaStartDate: string
}

export function TripForm({ initialTrips, visaStartDate }: Props) {
  const [trips, setTrips] = useState<TripRow[]>(initialTrips)
  const [showForm, setShowForm] = useState(initialTrips.length === 0)

  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  // Onboarding always requires a return date — returnDateKnown is always true
  // and "Log return later" is hidden in DateRangePicker via hideReturnLater.
  const [returnDateKnown] = useState(true)

  const [addingTrip, setAddingTrip] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quotaReached, setQuotaReached] = useState(false)

  const debouncedDeparture = useDebounce(departureDate, 400)
  const debouncedReturn = useDebounce(returnDate, 400)

  // Live overlap detection against already-added trips
  const overlapWarning = useMemo(() => {
    if (!debouncedDeparture || !debouncedReturn) return false
    return hasOverlappingTrip(
      trips.map((t) => ({
        id: t.id,
        destination: t.destination,
        departure_date: t.departure_date,
        return_date: t.return_date,
      })),
      debouncedDeparture,
      debouncedReturn
    )
  }, [trips, debouncedDeparture, debouncedReturn])

  const isPreVisa = !!departureDate && departureDate < visaStartDate

  async function handleAddTrip(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!destination.trim()) {
      setError('Please enter a destination.')
      return
    }
    if (!departureDate || !returnDate) {
      setError('Please enter both departure and return dates.')
      return
    }
    if (returnDate <= departureDate) {
      setError('Return date must be after departure date.')
      return
    }
    if (overlapWarning) {
      setError('These dates overlap with a trip you have already added. Check the dates and try again.')
      return
    }

    setAddingTrip(true)
    const result = await saveTripAction({
      destination: destination.trim(),
      departure_date: departureDate,
      return_date: returnDate,
    })

    if ('error' in result) {
      if (result.quota) {
        setQuotaReached(true)
        setShowForm(false)
      } else {
        setError(result.error)
      }
      setAddingTrip(false)
      return
    }

    // Append the saved trip (with its server-generated ID) to local state
    setTrips((prev) => [result.trip, ...prev])
    setDestination('')
    setDepartureDate('')
    setReturnDate('')
    setShowForm(false)
    setAddingTrip(false)
  }

  async function handleDeleteTrip(id: string) {
    setError(null)
    // Optimistic update
    setTrips((prev) => prev.filter((t) => t.id !== id))
    const result = await deleteTripAction(id)
    if ('error' in result) {
      setError(result.error)
    }
  }

  async function handleComplete() {
    setCompleting(true)
    if (trips.length > 0) {
      track('onboarding_trips_added', { count: trips.length })
    }
    await completeOnboardingAction()
  }

  return (
    <div className="w-full max-w-lg">
      {/* Progress dots — all filled on step 3 */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="h-2 w-8 rounded-full bg-[var(--color-green)]" />
        <div className="h-2 w-8 rounded-full bg-[var(--color-green)]" />
        <div className="h-2 w-8 rounded-full bg-[var(--color-green)]" />
      </div>

      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[var(--color-text-faint)] mb-2">
          Step 2 of 2
        </p>
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl tracking-tight text-[var(--color-text-primary)] mb-1">
          Add your travel history
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Add trips you&apos;ve taken outside the UK. You can always add more
          later — this just helps you start with an accurate picture.
        </p>

        {quotaReached && (
          <div className="mb-4 px-4 py-4 bg-[var(--color-green-pale)] border border-[var(--color-green)]/20 rounded-xl flex items-start gap-3">
            <span className="text-lg shrink-0" aria-hidden="true">🎉</span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                You&apos;ve added {trips.length} trips — great start!
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                Add unlimited trips with Pro, or continue to your dashboard now.
              </p>
            </div>
          </div>
        )}

        {error && !quotaReached && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)]">
            {error}
          </div>
        )}

        {/* Saved trips list */}
        {trips.length > 0 && (
          <div className="mb-5">
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[var(--color-text-faint)] mb-2">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} added
            </p>
            <div className="space-y-2">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between bg-[var(--color-surface-warm)] border border-[var(--color-border)] rounded-xl px-4 py-3 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {trip.destination}
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                      {formatDate(trip.departure_date)} →{' '}
                      {trip.return_date ? formatDate(trip.return_date) : 'ongoing'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] transition-colors shrink-0 cursor-pointer"
                    aria-label={`Remove ${trip.destination}`}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add trip form — hidden once quota is reached */}
        {!quotaReached && showForm ? (
          <form onSubmit={handleAddTrip} className="space-y-4 mb-5">
            {/* Destination with autocomplete */}
            <div>
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
              >
                Destination
              </label>
              <DestinationAutocomplete
                id="destination"
                value={destination}
                onChange={setDestination}
              />
            </div>

            {/* Date range calendar */}
            <DateRangePicker
              departureDate={departureDate}
              returnDate={returnDate}
              returnDateKnown={returnDateKnown}
              onDepartureChange={setDepartureDate}
              onReturnChange={setReturnDate}
              onReturnDateKnownChange={() => {
                // Return date is always required during onboarding
              }}
              hideReturnLater
            />

            {/* Overlap warning */}
            {overlapWarning && (
              <div className="px-4 py-3 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl flex items-start gap-3">
                <span className="shrink-0 text-base leading-5">⚠️</span>
                <p className="text-sm text-[var(--color-warning-text)]">
                  These dates overlap with a trip you&apos;ve already added.
                  Check the dates and try again.
                </p>
              </div>
            )}

            {/* Pre-visa trip note */}
            {isPreVisa && !overlapWarning && (
              <p className="text-xs text-[var(--color-warning-text)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl px-3 py-2">
                This trip predates your visa start date. It will be stored but
                won&apos;t count toward your 180-day window.
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addingTrip}
                className="flex-1 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
              >
                {addingTrip ? 'Saving…' : 'Add trip'}
              </button>
              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setError(null)
                  }}
                  className="px-4 py-3 text-sm text-[var(--color-text-muted)] border border-[var(--color-border-strong)] rounded-xl hover:bg-[var(--color-surface-warm)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : !quotaReached ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-[var(--color-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-colors cursor-pointer mb-5"
          >
            <Plus className="w-4 h-4" />
            Add {trips.length > 0 ? 'another trip' : 'a trip'}
          </button>
        ) : null}

        {/* Complete button */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing || addingTrip}
          className="w-full text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
        >
          {completing
            ? 'Setting up your dashboard…'
            : trips.length > 0
            ? 'Go to dashboard →'
            : 'Skip and go to dashboard →'}
        </button>

        <div className="mt-4 text-center">
          <Link
            href="/onboarding/visa"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
    </div>
  )
}
