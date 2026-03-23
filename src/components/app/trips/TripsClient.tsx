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
import { deleteTripAction } from '@/app/(app)/(main)/dashboard/actions'
import { PaywallModal } from './PaywallModal'
import { TripModal } from './TripModal'
import { track } from '@/lib/posthog'
import { RISK_CONFIG } from '@/lib/riskConfig'
import { formatDate, formatDateRange } from '@/lib/utils/dateFormatters'

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
// Helpers
// ---------------------------------------------------------------------------

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
  const [optimisticDeleteId, setOptimisticDeleteId] = useState<string | null>(null)

  const selectedTrip = trips.find((t) => t.id === selectedId) ?? null

  // ---------------------------------------------------------------------------
  // Modal state — driven by ?modal=plan|log|edit&tripId=xxx URL params
  // ---------------------------------------------------------------------------
  const rawDrawerMode = searchParams.get('modal')
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
    router.push(`?modal=${mode}`)
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
    setOptimisticDeleteId(id)
    if (selectedId === id) setSelectedId(null)
    
    // Allow exit animation to play before reflow
    setTimeout(() => {
      router.refresh()
      setDeleting(false)
      setOptimisticDeleteId(null)
    }, 300)
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-manrope)] font-bold text-[1.15rem] tracking-[-0.01em] text-[#191C1D]">
            Trip Log
          </h2>
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
            <div className="bg-white rounded-[1.5rem] shadow-[0px_8px_32px_rgba(0,33,20,0.04)] ring-1 ring-[#191C1D]/5 p-16 md:p-24 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-[1.25rem] bg-[#006948]/5 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#004f35] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-manrope)] font-bold text-2xl text-[#191C1D] mb-3 leading-tight tracking-tight">
                No trips tracked yet.
              </h3>
              <p className="text-[15px] text-[#3D4A42] max-w-sm mx-auto mb-8 leading-relaxed font-[family-name:var(--font-inter)]">
                Begin adding your travel history to see your rolling 180-day compliance window instantly calculate.
              </p>
              <button
                type="button"
                onClick={handleAddTrip}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#004F35] to-[#006948] hover:opacity-90 transition-opacity shadow-[0px_8px_24px_rgba(0,105,72,0.2)] hover:-translate-y-[1px] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add your first trip
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[1.5rem] p-4 sm:p-6 shadow-[0px_8px_32px_rgba(0,33,20,0.04)] ring-1 ring-[#191C1D]/5">
              <div className="flex flex-col gap-3">
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
                  const isOptimisticDeleted = optimisticDeleteId === trip.id
                  const isCrownDep = isCrownDependency(trip.destination)

                  // Attempt flag separation
                  const firstSpace = trip.destination.indexOf(' ')
                  const firstWord = firstSpace !== -1 ? trip.destination.slice(0, firstSpace) : trip.destination
                  const restWord = firstSpace !== -1 ? trip.destination.slice(firstSpace + 1) : ''
                  const isProbableFlag = firstWord.length > 0 && !/[a-zA-Z]/.test(firstWord)
                  const flag = isProbableFlag ? firstWord : null
                  const destText = isProbableFlag ? restWord : trip.destination

                  return (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => setSelectedId(isSelected ? null : trip.id)}
                      className={`w-full text-left p-4 sm:px-5 sm:py-4 rounded-xl flex items-center justify-between gap-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                        isSelected ? 'bg-[#9ff4ca]/30 ring-1 ring-[#006948]/20 shadow-sm' : 'bg-[#F8F9FA] hover:bg-white hover:shadow-md ring-1 ring-transparent hover:ring-[#191C1D]/5'
                      } ${
                        isOptimisticDeleted 
                          ? 'opacity-0 translate-x-[10%]' 
                          : 'animate-in fade-in slide-in-from-bottom-2 fill-mode-both'
                      }`}
                      style={!isOptimisticDeleted ? { animationDelay: `${i * 40}ms` } : undefined}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {flag && <span className="text-[1.35rem] leading-none" aria-hidden="true">{flag}</span>}
                        <div className="flex flex-col min-w-0">
                          <p className="text-[15px] font-semibold text-[#191C1D] truncate">{destText}</p>
                          <p className="text-xs text-[#3D4A42] mt-0.5">
                            {formatDateRange(trip.departure_date, trip.return_date)}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        {trip.return_date === null ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.05em] uppercase bg-[#ffdcbb] text-[#2c1600]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
                            Abroad
                          </span>
                        ) : isCrownDep ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.05em] uppercase bg-[#9ff4ca] text-[#002114]">
                            0 days
                          </span>
                        ) : cfg ? (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.05em] uppercase transition-colors ${cfg.bg} ${cfg.text}`}>
                            {absenceDays}d &middot; {cfg.label}
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
            </div>
          )}
        </div>

        {/* Side panel */}
        {selectedTrip && (
          <SidePanel
            trip={selectedTrip}
            contribution={getPanelContribution(selectedTrip)}
            visaStartDate={visaStartDate}
            onEdit={() => router.push(`?modal=edit&tripId=${selectedTrip.id}`)}
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

      {/* Trip modal — plan / log / edit modes */}
      <TripModal
        open={drawerOpen}
        mode={drawerMode ?? 'log'}
        onClose={() => router.push('/dashboard')}
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
  const cfg = status ? RISK_CONFIG[status] : null

  // Attempt flag separation
  const firstSpace = trip.destination.indexOf(' ')
  const firstWord = firstSpace !== -1 ? trip.destination.slice(0, firstSpace) : trip.destination
  const restWord = firstSpace !== -1 ? trip.destination.slice(firstSpace + 1) : ''
  const isProbableFlag = firstWord.length > 0 && !/[a-zA-Z]/.test(firstWord)
  const flag = isProbableFlag ? firstWord : null
  const destText = isProbableFlag ? restWord : trip.destination

  return (
    <div className="w-full md:w-80 shrink-0">
      <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-5">
        {/* Panel header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-[family-name:var(--font-manrope)] font-bold text-[1.15rem] tracking-[-0.01em] text-[#191C1D] leading-snug pr-2 flex items-center gap-2.5">
            {flag && <span className="text-[1.5rem] leading-none" aria-hidden="true">{flag}</span>}
            <span>{destText}</span>
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
            <span className="font-medium text-[#191C1D]">{formatDate(trip.departure_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3D4A42]">Returned to UK</span>
            <span className="font-medium text-[#191C1D]">
              {trip.return_date ? formatDate(trip.return_date) : 'Currently abroad'}
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
                  <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${cfg.bg} ${cfg.text}`}>
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
