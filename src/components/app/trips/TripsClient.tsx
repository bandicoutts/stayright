'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  isCrownDependency,
  calculateTripAbsenceDays,
  getCurrentRollingWindow,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import type { TripInput } from '@/lib/calculations/absenceEngine'
import { Trash } from '@/components/ui/Icons'
import { deleteTripAction, bulkDeleteTripsAction } from '@/app/(app)/(main)/dashboard/actions'
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
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<string[]>([])

  const selectedTrip = trips.find((t) => t.id === selectedId) ?? null

  // ---------------------------------------------------------------------------
  // Modal state — driven by ?modal=plan|log|edit&tripId=xxx URL params
  // ---------------------------------------------------------------------------
  const rawDrawerMode = searchParams.get('modal')
  const drawerMode =
    rawDrawerMode === 'plan' || rawDrawerMode === 'log' || rawDrawerMode === 'edit'
      ? rawDrawerMode
      : null

  const atLimit = !isPro && trips.length >= 3

  useEffect(() => {
    if ((drawerMode === 'plan' || drawerMode === 'log') && atLimit) {
      setShowPaywall(true)
      router.replace('/dashboard')
    }
  }, [drawerMode, atLimit, router])

  const drawerTripId = searchParams.get('tripId')
  const drawerInitialTrip = drawerTripId
    ? (trips.find((t) => t.id === drawerTripId) ?? undefined)
    : undefined
  // Only open if mode is valid; edit mode also requires the trip to exist,
  // and plan/log modes require the user is not at the limit.
  const drawerOpen = drawerMode !== null && (drawerMode === 'edit' ? drawerInitialTrip !== undefined : !atLimit)

  function openDrawer(mode: 'plan' | 'log') {
    // All saved trips count toward the Free tier limit (including null return_date)
    if (atLimit) {
      setShowPaywall(true)
      return
    }
    router.push(`?modal=${mode}`)
  }

  function handleAddTrip() {
    openDrawer('log')
  }

  async function handleDeleteSingle(id: string) {
    setDeleting(true)
    setDeleteError(null)
    
    // Optimistic remove
    setOptimisticDeletedIds(prev => [...prev, id])
    if (selectedId === id) setSelectedId(null)
    
    const result = await deleteTripAction(id)
    if ('error' in result) {
      setDeleteError(result.error)
      setOptimisticDeletedIds(prev => prev.filter(oid => oid !== id))
      setDeleting(false)
      return
    }
    
    track('trip_deleted')
    setDeleteTarget(null)
    
    setTimeout(() => {
      router.refresh()
      setDeleting(false)
      setOptimisticDeletedIds(prev => prev.filter(oid => oid !== id))
    }, 400)
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} trips?`)) return
    
    setDeleting(true)
    setDeleteError(null)
    
    // Optimistic remove
    setOptimisticDeletedIds(prev => [...prev, ...selectedIds])
    const currentSelected = [...selectedIds]
    setSelectedIds([])
    
    const result = await bulkDeleteTripsAction(currentSelected)
    if ('error' in result) {
      setDeleteError(result.error)
      setOptimisticDeletedIds(prev => prev.filter(oid => !currentSelected.includes(oid)))
      setSelectedIds(currentSelected)
      setDeleting(false)
      return
    }
    
    track('trips_bulk_deleted', { count: currentSelected.length })
    
    setTimeout(() => {
      router.refresh()
      setDeleting(false)
      setOptimisticDeletedIds(prev => prev.filter(oid => !currentSelected.includes(oid)))
    }, 400)
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
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
          <h2 className="font-[family-name:var(--font-manrope)] font-bold text-[1.15rem] tracking-[-0.01em] text-[var(--color-text-primary)]">
            Trip Log
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Your complete absence record</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-danger-text)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Trash className="w-4 h-4" weight="bold" />
              Delete {selectedIds.length} selected
            </button>
          )}
          <button
            type="button"
            onClick={handleAddTrip}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer text-white"
            style={{ background: 'var(--gradient-green)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add trip
          </button>
        </div>
      </div>

      {/* Main layout: list + side panel */}
      {/* Trip list */}
      <div className="w-full">
        <div className="space-y-4">
          {trips.length === 0 ? (
            <div className="bg-[var(--color-surface)] rounded-[1.5rem] shadow-sm ring-1 ring-[var(--color-border)] p-16 md:p-24 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-[1.25rem] bg-[var(--color-green-pale)] flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[var(--color-green)] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-manrope)] font-bold text-2xl text-[var(--color-text-primary)] mb-3 leading-tight tracking-tight">
                No trips tracked yet.
              </h3>
              <p className="text-[15px] text-[var(--color-text-muted)] max-w-sm mx-auto mb-8 leading-relaxed font-[family-name:var(--font-inter)]">
                Begin adding your travel history to see your rolling 180-day compliance window instantly calculate.
              </p>
              <button
                type="button"
                onClick={handleAddTrip}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity hover:-translate-y-[1px] cursor-pointer"
                style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add your first trip
              </button>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] rounded-[1.5rem] p-4 sm:p-6 shadow-sm ring-1 ring-[var(--color-border)]">
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
                  const isChecked = selectedIds.includes(trip.id)
                  const isOptimisticDeleted = optimisticDeletedIds.includes(trip.id)
                  const isCrownDep = isCrownDependency(trip.destination)

                  // Attempt flag separation
                  const firstSpace = trip.destination.indexOf(' ')
                  const firstWord = firstSpace !== -1 ? trip.destination.slice(0, firstSpace) : trip.destination
                  const restWord = firstSpace !== -1 ? trip.destination.slice(firstSpace + 1) : ''
                  const isProbableFlag = firstWord.length > 0 && !/[a-zA-Z]/.test(firstWord)
                  const flag = isProbableFlag ? firstWord : null
                  const destText = isProbableFlag ? restWord : trip.destination

                  const contribution = getPanelContribution(trip)
                  const panelStatus = trip.return_date && !isCrownDep
                    ? getRiskStatus(contribution.absenceDays)
                    : isCrownDep ? 'SAFE' as const : null
                  const panelCfg = panelStatus ? RISK_CONFIG[panelStatus] : null

                  return (
                    <div
                      key={trip.id}
                      className={`group w-full p-3 sm:px-4 sm:py-3 rounded-xl flex flex-col gap-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isSelected ? 'bg-[var(--color-green-pale)]/50 ring-1 ring-[var(--color-green)]/30 shadow-sm' : 'bg-[var(--color-bg-tinted)] hover:bg-[var(--color-surface)] hover:shadow-md ring-1 ring-transparent hover:ring-[var(--color-border)]'
                      } ${
                        isOptimisticDeleted 
                          ? 'opacity-0 scale-95 pointer-events-none' 
                          : 'animate-in fade-in slide-in-from-bottom-2 fill-mode-both'
                      }`}
                      style={!isOptimisticDeleted ? { animationDelay: `${i * 40}ms` } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div className="flex items-center">
                          <input
                            id={`select-trip-${trip.id}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(trip.id)}
                            className="w-5 h-5 rounded-md border-var(--color-border-strong) bg-var(--color-surface) text-[var(--color-green)] focus:ring-[var(--color-green)]/30 cursor-pointer"
                            aria-label={`Select trip to ${destText}`}
                          />
                        </div>

                        {/* Main click area (Selection) */}
                        <button
                          type="button"
                          onClick={() => setSelectedId(isSelected ? null : trip.id)}
                          className="flex-1 flex items-center gap-4 min-w-0 text-left cursor-pointer"
                          aria-expanded={isSelected}
                          aria-controls="trip-details-panel"
                        >
                          {flag && <span className="text-[1.35rem] leading-none" aria-hidden="true">{flag}</span>}
                          <div className="flex flex-col min-w-0">
                            <p className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">{destText}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                              {formatDateRange(trip.departure_date, trip.return_date)}
                            </p>
                          </div>
                        </button>

                        <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                          {trip.return_date === null ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning-text)] animate-pulse"></span>
                              Abroad
                            </span>
                          ) : isCrownDep ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase bg-[var(--color-safe-bg)] text-[var(--color-safe-text)]">
                              0 days
                            </span>
                          ) : cfg ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase transition-colors ${cfg.bg} ${cfg.text}`}>
                              {absenceDays}d &middot; {cfg.label}
                            </span>
                          ) : null}

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(trip.id)}
                              className="p-1.5 text-[var(--color-text-faint)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors cursor-pointer"
                              aria-label={`Delete trip to ${destText}`}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedId(isSelected ? null : trip.id)}
                              className={`p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-transform cursor-pointer [transition-duration:400ms] ${isSelected ? 'rotate-180' : ''}`}
                              aria-label={isSelected ? 'Hide details' : 'Show details'}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isSelected && (
                        <div className="w-full pt-3 border-t border-[var(--color-border)] animate-in fade-in slide-in-from-top-2 duration-300">
                          {/* Dates */}
                          <div className="space-y-1.5 mb-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[var(--color-text-muted)]">Departed UK</span>
                              <span className="font-medium text-[var(--color-text-primary)]">{formatDate(trip.departure_date)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--color-text-muted)]">Returned to UK</span>
                              <span className="font-medium text-[var(--color-text-primary)]">
                                {trip.return_date ? formatDate(trip.return_date) : 'Currently abroad'}
                              </span>
                            </div>
                          </div>

                          {/* Absence */}
                          <div className="flex items-center justify-between py-3 border-t border-b border-[var(--color-border)] mb-4">
                            <span className="text-sm text-[var(--color-text-muted)]">Absence days</span>
                            <div className="flex items-center gap-2">
                              {isCrownDep ? (
                                <>
                                  <span className="text-sm font-semibold text-[var(--color-green)]">0 days</span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-[var(--color-green-pale)] text-[var(--color-green)]">
                                    Crown Dep.
                                  </span>
                                </>
                              ) : trip.return_date ? (
                                <>
                                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{contribution.absenceDays} days</span>
                                  {panelCfg && (
                                    <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${panelCfg.bg} ${panelCfg.text}`}>
                                      {panelCfg.label}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm font-medium text-[var(--color-warning-text)]">Ongoing</span>
                              )}
                            </div>
                          </div>

                          {/* Rolling window at time of trip */}
                          {trip.return_date && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                Rolling window at departure
                              </p>
                              <p className="text-sm text-[var(--color-text-primary)]">
                                {contribution.windowDays} / 180 days used
                              </p>
                            </div>
                          )}

                          {/* Notes */}
                          {trip.notes && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Notes</p>
                              <p className="text-sm text-[var(--color-text-primary)]">{trip.notes}</p>
                            </div>
                          )}

                          {/* Disclaimer — always visible, no exceptions */}
                          <div className="mb-4 px-3 py-2.5 bg-[var(--color-bg-tinted)] rounded-xl">
                            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{DISCLAIMER}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => router.push(`?modal=edit&tripId=${trip.id}`)}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                                <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(trip.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                                <path d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6 w-full max-w-sm">
            <h2 id="delete-dialog-title" className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[var(--color-text-primary)] mb-2">
              Delete this trip?
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">
              This will recalculate your absence record.
            </p>
            {deleteError && (
              <p className="mb-4 text-sm text-[var(--color-danger-text)]">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-tinted)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSingle(deleteTarget)}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[var(--color-danger-text)] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
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

const DISCLAIMER = 'Time in Crown Dependencies (Jersey, Guernsey, Isle of Man) does not count as absence. Time in British Overseas Territories (Gibraltar, Bermuda etc.) does count as absence. If you are unsure, consult an immigration adviser.'
