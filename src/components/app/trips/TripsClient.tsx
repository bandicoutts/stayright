'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  isCrownDependency,
  calculateTripAbsenceDays,
  getCurrentRollingWindow,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import type { TripInput } from '@/lib/calculations/absenceEngine'
import { deleteTripAction } from '@/app/(app)/(main)/trips/actions'
import { PaywallModal } from './PaywallModal'
import { TripDrawer } from './TripDrawer'
import { track } from '@/lib/posthog'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TripRow {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
  notes: string | null
}

interface TripsClientProps {
  trips: TripRow[]
  visaStartDate?: string
  isPro: boolean
}

// ---------------------------------------------------------------------------
// Risk config (WCAG: colour + text label)
// ---------------------------------------------------------------------------

const RISK_CONFIG = {
  SAFE:    { bg: 'bg-[#006948]/10',  text: 'text-[#006948]',  label: 'Safe'    },
  WARNING: { bg: 'bg-[#D97706]/10',  text: 'text-[#D97706]',  label: 'Warning' },
  DANGER:  { bg: 'bg-[#BA1A1A]/10',  text: 'text-[#BA1A1A]',  label: 'Danger'  },
  BREACH:  { bg: 'bg-[#8E0009]/10',  text: 'text-[#8E0009]',  label: 'Breach'  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateRange(dep: string, ret: string | null): string {
  if (!ret) return 'Currently abroad'
  if (dep === ret) return '0 days'

  const d = new Date(dep + 'T00:00:00Z')
  const r = new Date(ret + 'T00:00:00Z')

  const depDay = d.getUTCDate()
  const retDay = r.getUTCDate()
  const depMonth = d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
  const retMonth = r.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
  const depYear = d.getUTCFullYear()
  const retYear = r.getUTCFullYear()

  if (depYear === retYear && depMonth === retMonth) {
    return `${depDay}–${retDay} ${retMonth} ${retYear}`
  }
  if (depYear === retYear) {
    return `${depDay} ${depMonth} – ${retDay} ${retMonth} ${retYear}`
  }
  return `${depDay} ${depMonth} ${depYear} – ${retDay} ${retMonth} ${retYear}`
}

function toTripInput(t: TripRow): TripInput {
  return { id: t.id, destination: t.destination, departure_date: t.departure_date, return_date: t.return_date }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TripsClient({ trips, visaStartDate, isPro }: TripsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const selectedTrip = trips.find((t) => t.id === selectedId) ?? null

  // ---------------------------------------------------------------------------
  // Drawer state — driven by ?drawer=plan|log|edit&tripId=xxx URL params
  // ---------------------------------------------------------------------------
  const rawDrawerMode = searchParams.get('drawer')
  const drawerMode =
    rawDrawerMode === 'plan' || rawDrawerMode === 'log' || rawDrawerMode === 'edit'
      ? rawDrawerMode
      : null
  const drawerTripId = searchParams.get('tripId')
  const drawerInitialTrip = drawerTripId
    ? (trips.find((t) => t.id === drawerTripId) ?? undefined)
    : undefined
  // Only open if mode is valid; edit mode also requires the trip to exist
  const drawerOpen = drawerMode !== null && (drawerMode !== 'edit' || drawerInitialTrip !== undefined)

  function openDrawer(mode: 'plan' | 'log') {
    // All saved trips count toward the Free tier limit (including null return_date)
    if (!isPro && trips.length >= 3) {
      setShowPaywall(true)
      return
    }
    router.push(`/trips?drawer=${mode}`)
  }

  function handleAddTrip() {
    openDrawer('log')
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteTripAction(id)
    if ('error' in result) {
      setDeleteError(result.error)
      setDeleting(false)
      return
    }
    track('trip_deleted')
    setDeleteTarget(null)
    if (selectedId === id) setSelectedId(null)
    router.refresh()
    setDeleting(false)
  }

  // Side panel rolling window contribution: rolling window as of departure date
  // so it shows the snapshot at the time of that trip
  function getPanelContribution(trip: TripRow): { absenceDays: number; windowDays: number } {
    const absenceDays = trip.return_date
      ? calculateTripAbsenceDays({
          destination: trip.destination,
          departure_date: trip.departure_date,
          return_date: trip.return_date,
        })
      : 0

    // Rolling window snapshot at departure date of this trip
    const tripsAtThatTime = trips.filter(
      (t) => t.id !== trip.id && t.departure_date <= trip.departure_date
    ).map(toTripInput)
    const snapshotDate = new Date(trip.departure_date + 'T00:00:00Z')
    const windowResult = getCurrentRollingWindow(tripsAtThatTime, snapshotDate, visaStartDate)

    return { absenceDays, windowDays: windowResult.days }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D]">
            Trips
          </h1>
          <p className="text-sm text-[#3D4A42] mt-0.5">Your complete absence record</p>
        </div>
        <button
          type="button"
          onClick={handleAddTrip}
          className="flex items-center gap-2 bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add trip
        </button>
      </div>

      {/* Main layout: list + side panel */}
      <div className="flex gap-6">
        {/* Trip list */}
        <div className={`flex-1 min-w-0 ${selectedTrip ? 'hidden md:block' : ''}`}>
          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-12 text-center">
              <p className="text-sm text-[#3D4A42]">
                Your trip history is empty. Add a trip to start tracking your absences.
              </p>
              <button
                type="button"
                onClick={handleAddTrip}
                className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Add your first trip
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm overflow-hidden">
              {trips.map((trip, i) => {
                const absenceDays = trip.return_date
                  ? calculateTripAbsenceDays({
                      destination: trip.destination,
                      departure_date: trip.departure_date,
                      return_date: trip.return_date,
                    })
                  : null
                const status = absenceDays !== null ? getRiskStatus(absenceDays) : null
                const cfg = status ? RISK_CONFIG[status] : null
                const isSelected = selectedId === trip.id
                const isCrownDep = isCrownDependency(trip.destination)

                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => setSelectedId(isSelected ? null : trip.id)}
                    className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                      i < trips.length - 1 ? 'border-b border-[#191C1D]/5' : ''
                    } ${isSelected ? 'bg-[#006948]/5' : 'hover:bg-[#F8F9FA]'}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#191C1D] truncate">{trip.destination}</p>
                      <p className="text-xs text-[#3D4A42] mt-0.5">
                        {formatDateRange(trip.departure_date, trip.return_date)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      {trip.return_date === null ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#D97706]/10 text-[#D97706]">
                          Abroad
                        </span>
                      ) : isCrownDep ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#006948]/10 text-[#006948]">
                          0 days
                        </span>
                      ) : cfg ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          {absenceDays}d · {cfg.label}
                        </span>
                      ) : null}
                      <svg className={`w-4 h-4 text-[#3D4A42] transition-transform ${isSelected ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Side panel */}
        {selectedTrip && (
          <SidePanel
            trip={selectedTrip}
            contribution={getPanelContribution(selectedTrip)}
            visaStartDate={visaStartDate}
            onEdit={() => router.push(`/trips?drawer=edit&tripId=${selectedTrip.id}`)}
            onDelete={() => setDeleteTarget(selectedTrip.id)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-[#191C1D]/8 p-6 w-full max-w-sm">
            <h2 id="delete-dialog-title" className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[#191C1D] mb-2">
              Delete this trip?
            </h2>
            <p className="text-sm text-[#3D4A42] mb-5">
              This will recalculate your absence record.
            </p>
            {deleteError && (
              <p className="mb-4 text-sm text-[#BA1A1A]">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm text-[#3D4A42] border border-[#191C1D]/15 rounded-xl hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#BA1A1A] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paywall modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        triggerReason="trip_limit"
      />

      {/* Trip drawer — plan / log / edit modes */}
      <TripDrawer
        open={drawerOpen}
        mode={drawerMode ?? 'log'}
        onClose={() => router.push('/trips')}
        existingTrips={trips.map(toTripInput)}
        visaStartDate={visaStartDate}
        isPro={isPro}
        tripCount={trips.length}
        initialTrip={drawerInitialTrip}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Side panel
// ---------------------------------------------------------------------------

const DISCLAIMER = 'Time in Crown Dependencies (Jersey, Guernsey, Isle of Man) does not count as absence. Time in British Overseas Territories (Gibraltar, Bermuda etc.) does count as absence. If you are unsure, consult an immigration adviser.'

const RISK_CONFIG_PANEL = RISK_CONFIG

function SidePanel({
  trip,
  contribution,
  visaStartDate: _visaStartDate,
  onEdit,
  onDelete,
  onClose,
}: {
  trip: TripRow
  contribution: { absenceDays: number; windowDays: number }
  visaStartDate?: string
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const isCrownDep = isCrownDependency(trip.destination)
  const status = trip.return_date && !isCrownDep
    ? getRiskStatus(contribution.absenceDays)
    : isCrownDep ? 'SAFE' as const : null
  const cfg = status ? RISK_CONFIG_PANEL[status] : null

  function fmt(d: string) {
    return new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  return (
    <div className="w-full md:w-80 shrink-0">
      <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-5">
        {/* Panel header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-[family-name:var(--font-manrope)] font-bold text-base text-[#191C1D] leading-snug pr-2">
            {trip.destination}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="shrink-0 text-[#3D4A42] hover:text-[#191C1D] transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#F8F9FA] -mt-1 -mr-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Dates */}
        <div className="space-y-1.5 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#3D4A42]">Departed UK</span>
            <span className="font-medium text-[#191C1D]">{fmt(trip.departure_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3D4A42]">Returned to UK</span>
            <span className="font-medium text-[#191C1D]">
              {trip.return_date ? fmt(trip.return_date) : 'Currently abroad'}
            </span>
          </div>
        </div>

        {/* Absence */}
        <div className="flex items-center justify-between py-3 border-t border-b border-[#191C1D]/5 mb-4">
          <span className="text-sm text-[#3D4A42]">Absence days</span>
          <div className="flex items-center gap-2">
            {isCrownDep ? (
              <>
                <span className="text-sm font-semibold text-[#006948]">0 days</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#006948]/10 text-[#006948]">
                  Crown Dep.
                </span>
              </>
            ) : trip.return_date ? (
              <>
                <span className="text-sm font-semibold text-[#191C1D]">{contribution.absenceDays} days</span>
                {cfg && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm font-medium text-[#D97706]">Ongoing</span>
            )}
          </div>
        </div>

        {/* Rolling window at time of trip */}
        {trip.return_date && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[#3D4A42] uppercase tracking-wider mb-1">
              Rolling window at departure
            </p>
            <p className="text-sm text-[#191C1D]">
              {contribution.windowDays} / 180 days used
            </p>
          </div>
        )}

        {/* Notes */}
        {trip.notes && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[#3D4A42] uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-[#191C1D]">{trip.notes}</p>
          </div>
        )}

        {/* Disclaimer — always visible, no exceptions */}
        <div className="mb-4 px-3 py-2.5 bg-[#F8F9FA] rounded-xl">
          <p className="text-xs text-[#3D4A42] leading-relaxed">{DISCLAIMER}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 border border-[#191C1D]/15 text-[#191C1D] rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-[#F8F9FA] transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 border border-[#BA1A1A]/25 text-[#BA1A1A] rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
