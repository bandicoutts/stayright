'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { saveTripAction, deleteTripAction, completeOnboardingAction } from '../actions'
import { track } from '@/lib/posthog'

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

  const [addingTrip, setAddingTrip] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

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
    if (departureDate >= returnDate) {
      setError('Return date must be after departure date.')
      return
    }

    setAddingTrip(true)
    const result = await saveTripAction({
      destination: destination.trim(),
      departure_date: departureDate,
      return_date: returnDate,
    })

    if ('error' in result) {
      setError(result.error)
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
      // Re-fetch would be needed to restore — for now show the error
    }
  }

  async function handleComplete() {
    setCompleting(true)
    track('onboarding_completed')
    await completeOnboardingAction()
  }

  const isPreVisa = departureDate && departureDate < visaStartDate

  return (
    <div className="w-full max-w-lg">
      {/* Progress dots — all filled on step 3 */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="h-2 w-8 rounded-full bg-[#006948]" />
        <div className="h-2 w-8 rounded-full bg-[#006948]" />
        <div className="h-2 w-8 rounded-full bg-[#006948]" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8">
        <p className="text-xs font-semibold text-[#3D4A42] uppercase tracking-widest mb-1">
          Step 2 of 2
        </p>
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-1">
          Add your travel history
        </h1>
        <p className="text-sm text-[#3D4A42] mb-6">
          Add trips you&apos;ve taken outside the UK. You can always add more
          later — this just helps you start with an accurate picture.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#BA1A1A]">
            {error}
          </div>
        )}

        {/* Saved trips list */}
        {trips.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-[#3D4A42] uppercase tracking-wider mb-2">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} added
            </p>
            <div className="space-y-2">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between bg-[#F8F9FA] rounded-xl px-4 py-3 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#191C1D] truncate">
                      {trip.destination}
                    </p>
                    <p className="text-xs text-[#3D4A42]">
                      {formatDate(trip.departure_date)} →{' '}
                      {trip.return_date
                        ? formatDate(trip.return_date)
                        : 'ongoing'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-[#3D4A42] hover:text-[#BA1A1A] transition-colors shrink-0 cursor-pointer"
                    aria-label={`Remove ${trip.destination}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add trip form */}
        {showForm ? (
          <form onSubmit={handleAddTrip} className="space-y-4 mb-5">
            <div>
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-[#191C1D] mb-1.5"
              >
                Destination
              </label>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Portugal, USA, Multi-destination"
                className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] placeholder:text-[#3D4A42]/40 focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="departure_date"
                  className="block text-sm font-medium text-[#191C1D] mb-1.5"
                >
                  Departed UK
                </label>
                <input
                  id="departure_date"
                  type="date"
                  value={departureDate}
                  max={today}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label
                  htmlFor="return_date"
                  className="block text-sm font-medium text-[#191C1D] mb-1.5"
                >
                  Returned to UK
                </label>
                <input
                  id="return_date"
                  type="date"
                  value={returnDate}
                  max={today}
                  min={departureDate || undefined}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Pre-visa trip warning */}
            {isPreVisa && (
              <p className="text-xs text-[#D97706] bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                This trip predates your visa start date. It will be stored but
                won&apos;t count toward your 180-day window.
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addingTrip}
                className="flex-1 bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
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
                  className="px-4 py-3 text-sm text-[#3D4A42] border border-[#191C1D]/15 rounded-xl hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-[#191C1D]/20 rounded-xl px-4 py-3 text-sm text-[#3D4A42] hover:border-[#006948] hover:text-[#006948] transition-colors cursor-pointer mb-5"
          >
            <Plus className="w-4 h-4" />
            Add {trips.length > 0 ? 'another trip' : 'a trip'}
          </button>
        )}

        {/* Complete button */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing || addingTrip}
          className="w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
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
            className="text-sm text-[#3D4A42] hover:text-[#006948] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
    </div>
  )
}
