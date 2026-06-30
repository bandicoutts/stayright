'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  isCrownDependency,
  calculateTripAbsenceDays,
  getCurrentRollingWindow,
  getPeakRollingWindow,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import type { TripInput } from '@/lib/calculations/absenceEngine'
import { Trash } from '@/components/ui/Icons'
import { deleteTripAction, bulkDeleteTripsAction } from '@/app/(app)/(main)/dashboard/actions'
import { PaywallModal } from './PaywallModal'
import { TripModal } from './TripModal'
import { TripsTimelineView, type TripClass } from './TripsTimelineView'
import { track } from '@/lib/posthog'
import { formatDateRange } from '@/lib/utils/dateFormatters'
import { FREE_TRIP_LIMIT } from '@/lib/subscriptionUtils'

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

interface Props {
  trips: TripRow[]
  visaStartDate?: string
  isPro: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toTripInput(t: TripRow): TripInput {
  return {
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
  }
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function extractDestination(raw: string): { flag: string | null; name: string } {
  const firstSpace = raw.indexOf(' ')
  if (firstSpace === -1) return { flag: null, name: raw }
  const firstWord = raw.slice(0, firstSpace)
  const rest = raw.slice(firstSpace + 1)
  const isProbableFlag = firstWord.length > 0 && !/[a-zA-Z]/.test(firstWord)
  return isProbableFlag ? { flag: firstWord, name: rest } : { flag: null, name: raw }
}

const TONE: Record<'SAFE' | 'WARNING' | 'DANGER' | 'BREACH', string> = {
  SAFE: 'var(--color-green-light)',
  WARNING: 'var(--color-status-amber)',
  DANGER: 'var(--color-status-red)',
  BREACH: 'var(--color-status-red)',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TripsTableClient({ trips, visaStartDate, isPro }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'timeline'>('list')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [showPaywall, setShowPaywall] = useState(() => {
    const mode = searchParams.get('modal')
    return (mode === 'plan' || mode === 'log') && !isPro && trips.length >= FREE_TRIP_LIMIT
  })

  const today = useMemo(() => new Date(), [])
  const todayStr = iso(today)

  // URL-driven modal state (unchanged)
  const rawDrawerMode = searchParams.get('modal')
  const drawerMode =
    rawDrawerMode === 'plan' || rawDrawerMode === 'log' || rawDrawerMode === 'edit'
      ? rawDrawerMode
      : null
  const returnTo = searchParams.get('returnTo') ?? '/trips'
  const atLimit = !isPro && trips.length >= FREE_TRIP_LIMIT

  useEffect(() => {
    if ((drawerMode === 'plan' || drawerMode === 'log') && atLimit) {
      router.replace(returnTo, { scroll: false })
    }
  }, [drawerMode, atLimit, router, returnTo])

  const drawerTripId = searchParams.get('tripId')
  const drawerInitialTrip = drawerTripId ? (trips.find((t) => t.id === drawerTripId) ?? undefined) : undefined
  const drawerOpen =
    drawerMode !== null && (drawerMode === 'edit' ? drawerInitialTrip !== undefined : !atLimit)

  function openDrawer(mode: 'plan' | 'log') {
    if (atLimit) {
      setShowPaywall(true)
      return
    }
    router.push(`/trips?modal=${mode}`, { scroll: false })
  }

  function openEdit(id: string) {
    router.push(`/trips?modal=edit&tripId=${id}`, { scroll: false })
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const activeTrips = trips.filter((t) => !optimisticDeletedIds.includes(t.id))

  /** planned = departs in the future; abroad = departed, no return yet; else taken. */
  function classify(t: { departure_date: string; return_date: string | null }): TripClass {
    if (t.departure_date > todayStr) return 'planned'
    if (t.return_date === null) return 'abroad'
    return 'taken'
  }

  const currentWindow = useMemo(
    () => getCurrentRollingWindow(activeTrips.map(toTripInput), today, visaStartDate),
    [activeTrips, today, visaStartDate]
  )

  const hasCompleted = activeTrips.some((t) => t.return_date !== null)
  const peak = useMemo(
    () =>
      visaStartDate && hasCompleted
        ? getPeakRollingWindow(activeTrips.map(toTripInput), visaStartDate, today)
        : null,
    [activeTrips, visaStartDate, hasCompleted, today]
  )
  const peakStartStr = peak ? iso(peak.windowStart) : null
  const peakEndStr = peak ? iso(peak.windowEnd) : null

  function inPeakWindow(t: TripRow): boolean {
    if (!peakStartStr || !peakEndStr) return false
    const end = t.return_date ?? todayStr
    return t.departure_date <= peakEndStr && end >= peakStartStr
  }

  const abroadCount = activeTrips.filter((t) => classify(t) === 'abroad').length
  const plannedCount = activeTrips.filter((t) => classify(t) === 'planned').length

  const visibleTrips = useMemo(() => {
    const filtered = activeTrips.filter((t) => {
      if (!search) return true
      return extractDestination(t.destination).name.toLowerCase().includes(search.toLowerCase())
    })
    return [...filtered].sort((a, b) => (a.departure_date < b.departure_date ? 1 : -1))
  }, [activeTrips, search])

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async function handleDeleteSingle(id: string) {
    setDeleting(true)
    setDeleteError(null)
    setOptimisticDeletedIds((prev) => [...prev, id])

    const result = await deleteTripAction(id)
    if ('error' in result) {
      setDeleteError(result.error)
      setOptimisticDeletedIds((prev) => prev.filter((oid) => oid !== id))
      setDeleting(false)
      return
    }

    track('trip_deleted')
    setDeleteTarget(null)
    setTimeout(() => {
      router.refresh()
      setDeleting(false)
      setOptimisticDeletedIds((prev) => prev.filter((oid) => oid !== id))
    }, 400)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  function toggleSelectAll() {
    const visibleIds = visibleTrips.map((t) => t.id)
    setSelectedIds((prev) => (prev.length === visibleIds.length ? [] : visibleIds))
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return
    setDeleting(true)
    setDeleteError(null)
    const ids = [...selectedIds]
    setOptimisticDeletedIds((prev) => [...prev, ...ids])
    setSelectedIds([])
    setBulkConfirm(false)

    const result = await bulkDeleteTripsAction(ids)
    if ('error' in result) {
      setDeleteError(result.error)
      setOptimisticDeletedIds((prev) => prev.filter((oid) => !ids.includes(oid)))
      setSelectedIds(ids)
      setDeleting(false)
      return
    }

    track('trips_bulk_deleted', { count: ids.length })
    setTimeout(() => {
      router.refresh()
      setDeleting(false)
      setOptimisticDeletedIds((prev) => prev.filter((oid) => !ids.includes(oid)))
    }, 400)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const windowTone = TONE[currentWindow.status]

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-manrope)] font-bold text-2xl text-[var(--color-text-primary)] tracking-tight">
            Your travel history
          </h1>
          {/* Single header stat + meta chips */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 font-[family-name:var(--font-mono)] text-[11.5px]">
            <span className="text-[var(--color-text-muted)]">
              <span className="font-semibold" style={{ color: windowTone }}>{currentWindow.days}</span>
              {' / 180d'} <span className="text-[var(--color-text-faint)]">current window</span>
            </span>
            {abroadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[var(--color-status-amber)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-amber)] animate-pulse" />
                {abroadCount} abroad
              </span>
            )}
            {plannedCount > 0 && (
              <span className="text-[var(--color-teal)]">{plannedCount} planned</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openDrawer('plan')}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
          >
            Plan a trip
          </button>
          <button
            type="button"
            onClick={() => openDrawer('log')}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer text-white"
            style={{ background: 'var(--gradient-green)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Log trip
          </button>
        </div>
      </div>

      {/* Peak window explainer */}
      {peak && peak.days > 0 && (
        <div
          className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-4 pr-4 py-3 flex items-center gap-3"
          style={{ borderLeft: '3px solid var(--color-status-amber)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text-primary)]">Your tightest 12-month window</span> reached{' '}
            <span className="font-[family-name:var(--font-mono)] font-semibold" style={{ color: TONE[peak.status] }}>{peak.days}/180</span> days
            {peakStartStr && peakEndStr && (
              <span className="text-[var(--color-text-faint)]">
                {' '}({formatDateRange(peakStartStr, peakEndStr)})
              </span>
            )}
            . Rows in that window are marked.
          </p>
        </div>
      )}

      {/* Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)]" viewBox="0 0 16 16" fill="none">
              <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM13 13l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations…"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-faint)] outline-none focus:border-[var(--color-green)] transition-colors"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)]">
            {(['list', 'timeline'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer"
                style={
                  view === v
                    ? { background: 'var(--color-surface)', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-card)' }
                    : { color: 'var(--color-text-muted)' }
                }
                aria-pressed={view === v}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Selection bar (list view) */}
        {view === 'list' && selectedIds.length > 0 && (
          <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTrips.length > 0 && selectedIds.length === visibleTrips.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-green)] cursor-pointer"
                aria-label="Select all trips"
              />
              {selectedIds.length} selected
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setBulkConfirm(true)}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--color-danger-text)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Trash className="w-3.5 h-3.5" weight="bold" />
                Delete {selectedIds.length}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {activeTrips.length === 0 && !deleting ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-green-pale)] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-[var(--color-green)] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-manrope)] font-bold text-xl text-[var(--color-text-primary)] mb-2">No trips logged yet</h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-6">Log your travel history to track your 180-day compliance window.</p>
            <button
              type="button"
              onClick={() => openDrawer('log')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: 'var(--gradient-green)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Log your first trip
            </button>
          </div>
        ) : view === 'timeline' ? (
          <TripsTimelineView
            trips={visibleTrips.map(toTripInput)}
            today={today}
            classify={classify}
            onEdit={openEdit}
          />
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {visibleTrips.map((trip) => (
              <TripListRow
                key={trip.id}
                trip={trip}
                cls={classify(trip)}
                isCrown={isCrownDependency(trip.destination)}
                inPeak={inPeakWindow(trip)}
                todayStr={todayStr}
                selected={selectedIds.includes(trip.id)}
                selectionActive={selectedIds.length > 0}
                onToggleSelect={() => toggleSelect(trip.id)}
                onEdit={() => openEdit(trip.id)}
                onDelete={() => setDeleteTarget(trip.id)}
              />
            ))}
            {visibleTrips.length === 0 && search && (
              <li className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">No trips match &ldquo;{search}&rdquo;</li>
            )}
          </ul>
        )}

        {/* Footer */}
        {activeTrips.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-faint)]">
              {visibleTrips.length} of {activeTrips.length} trip{activeTrips.length !== 1 ? 's' : ''}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-faint)]">
              Current window: {currentWindow.days}/180
            </span>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-trip-title">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6 w-full max-w-sm">
            <h2 id="delete-trip-title" className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[var(--color-text-primary)] mb-2">Delete this trip?</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">This will recalculate your absence record.</p>
            {deleteError && <p className="mb-4 text-sm text-[var(--color-danger-text)]">{deleteError}</p>}
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

      {/* Bulk delete confirmation */}
      {bulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bulk-delete-title">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6 w-full max-w-sm">
            <h2 id="bulk-delete-title" className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[var(--color-text-primary)] mb-2">
              Delete {selectedIds.length} trip{selectedIds.length !== 1 ? 's' : ''}?
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">This will recalculate your absence record.</p>
            {deleteError && <p className="mb-4 text-sm text-[var(--color-danger-text)]">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBulkConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-tinted)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[var(--color-danger-text)] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} triggerReason="trip_limit" />

      <TripModal
        open={drawerOpen}
        mode={drawerMode ?? 'log'}
        onClose={() => router.push(returnTo, { scroll: false })}
        existingTrips={activeTrips.map(toTripInput)}
        visaStartDate={visaStartDate}
        isPro={isPro}
        tripCount={trips.length}
        initialTrip={drawerInitialTrip}
        redirectTo={returnTo}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// List row
// ---------------------------------------------------------------------------

function TripListRow({
  trip,
  cls,
  isCrown,
  inPeak,
  todayStr,
  selected,
  selectionActive,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  trip: TripRow
  cls: TripClass
  isCrown: boolean
  inPeak: boolean
  todayStr: string
  selected: boolean
  selectionActive: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { flag, name } = extractDestination(trip.destination)

  // Day count + sub-label
  let days: number | null = null
  let sub = ''
  if (isCrown) {
    days = 0
    sub = "doesn't count"
  } else if (cls === 'abroad') {
    days = calculateTripAbsenceDays({ destination: trip.destination, departure_date: trip.departure_date, return_date: todayStr })
    sub = 'so far'
  } else if (cls === 'planned') {
    days = trip.return_date ? calculateTripAbsenceDays({ destination: trip.destination, departure_date: trip.departure_date, return_date: trip.return_date }) : null
    sub = 'planned'
  } else {
    days = calculateTripAbsenceDays({ destination: trip.destination, departure_date: trip.departure_date, return_date: trip.return_date! })
    sub = 'abroad'
  }

  const dayColor = isCrown
    ? 'var(--color-text-faint)'
    : cls === 'planned'
      ? 'var(--color-teal)'
      : days !== null
        ? TONE[getRiskStatus(days)]
        : 'var(--color-text-faint)'

  return (
    <li
      className="group flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-raised)] transition-colors"
      style={inPeak ? { borderLeft: '3px solid var(--color-status-amber)' } : undefined}
    >
      {/* Select checkbox — revealed on hover, persistent once selecting */}
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        aria-label={`Select trip to ${name}`}
        className={`w-4 h-4 shrink-0 rounded border-[var(--color-border)] accent-[var(--color-green)] cursor-pointer transition-opacity ${
          selected || selectionActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
      />

      {/* Flag tile */}
      <div
        className="w-10 h-10 shrink-0 rounded-xl border border-[var(--color-border)] flex items-center justify-center text-xl"
        style={{ background: 'var(--color-surface-sunken)' }}
        aria-hidden="true"
      >
        {flag ?? '🌍'}
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[15px] text-[var(--color-text-primary)] truncate">{name}</span>
          {cls === 'abroad' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-dashed" style={{ borderColor: 'var(--color-status-amber)', color: 'var(--color-status-amber)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-amber)] animate-pulse" />
              Abroad now
            </span>
          )}
          {cls === 'planned' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-dashed" style={{ borderColor: 'var(--color-teal)', color: 'var(--color-teal)' }}>
              Planned
            </span>
          )}
          {isCrown && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-sunken)]"
              title="Time in Crown Dependencies (Jersey, Guernsey, Isle of Man) doesn't count toward the 180-day limit."
            >
              Crown Dependency
            </span>
          )}
        </div>
        <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1.5">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="none">
            <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {formatDateRange(trip.departure_date, trip.return_date)}
        </p>
      </div>

      {/* Day count */}
      <div className="text-right shrink-0">
        <p className="font-[family-name:var(--font-mono)] text-[16px] font-semibold leading-none" style={{ color: dayColor }}>
          {days !== null ? `${days}d` : '—'}
        </p>
        <p className="text-[10.5px] text-[var(--color-text-faint)] mt-1">{sub}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
          aria-label={`Edit trip to ${name}`}
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer"
          aria-label={`Delete trip to ${name}`}
          title="Delete"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  )
}
