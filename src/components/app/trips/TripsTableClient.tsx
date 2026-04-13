'use client'

import { Fragment, useState, useEffect, useMemo } from 'react'
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
import { formatDate } from '@/lib/utils/dateFormatters'
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

type SortKey = 'destination' | 'departure_date' | 'return_date' | 'days'
type SortDir = 'asc' | 'desc'

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

function getAbsenceDays(trip: TripRow): number | null {
  if (!trip.return_date) return null
  if (isCrownDependency(trip.destination)) return 0
  return calculateTripAbsenceDays({
    destination: trip.destination,
    departure_date: trip.departure_date,
    return_date: trip.return_date,
  })
}

function getWindowAtDeparture(trip: TripRow, allTrips: TripRow[], visaStartDate?: string): number {
  const tripsAtThatTime = allTrips
    .filter((t) => t.id !== trip.id && t.departure_date <= trip.departure_date)
    .map(toTripInput)
  const snapshotDate = new Date(trip.departure_date + 'T00:00:00Z')
  return getCurrentRollingWindow(tripsAtThatTime, snapshotDate, visaStartDate).days
}

function extractDestination(raw: string): { flag: string | null; name: string } {
  const firstSpace = raw.indexOf(' ')
  if (firstSpace === -1) return { flag: null, name: raw }
  const firstWord = raw.slice(0, firstSpace)
  const rest = raw.slice(firstSpace + 1)
  const isProbableFlag = firstWord.length > 0 && !/[a-zA-Z]/.test(firstWord)
  return isProbableFlag ? { flag: firstWord, name: rest } : { flag: null, name: raw }
}

// ---------------------------------------------------------------------------
// Sort icon
// ---------------------------------------------------------------------------

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) {
    return <span className="ml-1 opacity-30 text-[10px]">↕</span>
  }
  return <span className="ml-1 text-[var(--color-green-light)] text-[10px]">{dir === 'asc' ? '↑' : '↓'}</span>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TripsTableClient({ trips, visaStartDate, isPro }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('departure_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(() => {
    const mode = searchParams.get('modal')
    return (mode === 'plan' || mode === 'log') && !isPro && trips.length >= FREE_TRIP_LIMIT
  })
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<string[]>([])

  // URL-driven modal state (same pattern as TripsClient)
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
  const drawerInitialTrip = drawerTripId
    ? (trips.find((t) => t.id === drawerTripId) ?? undefined)
    : undefined
  const drawerOpen =
    drawerMode !== null &&
    (drawerMode === 'edit' ? drawerInitialTrip !== undefined : !atLimit)

  function openDrawer(mode: 'plan' | 'log') {
    if (atLimit) {
      setShowPaywall(true)
      return
    }
    router.push(`/trips?modal=${mode}`, { scroll: false })
  }

  // ---------------------------------------------------------------------------
  // Sort + filter
  // ---------------------------------------------------------------------------

  const visibleTrips = useMemo(() => {
    const filtered = trips.filter((t) => {
      if (!search) return true
      const { name } = extractDestination(t.destination)
      return name.toLowerCase().includes(search.toLowerCase())
    })

    return [...filtered].sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      if (sortKey === 'destination') {
        aVal = extractDestination(a.destination).name.toLowerCase()
        bVal = extractDestination(b.destination).name.toLowerCase()
      } else if (sortKey === 'departure_date') {
        aVal = a.departure_date
        bVal = b.departure_date
      } else if (sortKey === 'return_date') {
        aVal = a.return_date ?? '9999-12-31'
        bVal = b.return_date ?? '9999-12-31'
      } else if (sortKey === 'days') {
        aVal = getAbsenceDays(a) ?? -1
        bVal = getAbsenceDays(b) ?? -1
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [trips, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  // ---------------------------------------------------------------------------
  // Delete handlers
  // ---------------------------------------------------------------------------

  async function handleDeleteSingle(id: string) {
    setDeleting(true)
    setDeleteError(null)
    setOptimisticDeletedIds((prev) => [...prev, id])
    if (expandedId === id) setExpandedId(null)

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

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} trip${selectedIds.length > 1 ? 's' : ''}?`)) return

    setDeleting(true)
    setDeleteError(null)
    setOptimisticDeletedIds((prev) => [...prev, ...selectedIds])
    const currentSelected = [...selectedIds]
    setSelectedIds([])

    const result = await bulkDeleteTripsAction(currentSelected)
    if ('error' in result) {
      setDeleteError(result.error)
      setOptimisticDeletedIds((prev) => prev.filter((oid) => !currentSelected.includes(oid)))
      setSelectedIds(currentSelected)
      setDeleting(false)
      return
    }

    track('trips_bulk_deleted', { count: currentSelected.length })
    setTimeout(() => {
      router.refresh()
      setDeleting(false)
      setOptimisticDeletedIds((prev) => prev.filter((oid) => !currentSelected.includes(oid)))
    }, 400)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  function toggleSelectAll() {
    const visibleIds = visibleTrips
      .filter((t) => !optimisticDeletedIds.includes(t.id))
      .map((t) => t.id)
    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(visibleIds)
    }
  }

  // ---------------------------------------------------------------------------
  // Summary stats + pre-computed window snapshots
  // ---------------------------------------------------------------------------

  // Pre-compute rolling window at departure for every trip once (avoids O(n²) in render).
  const tripWindowMap = useMemo(
    () => new Map(trips.map((t) => [t.id, getWindowAtDeparture(t, trips, visaStartDate)])),
    [trips, visaStartDate]
  )

  const totalDays = useMemo(
    () => trips.reduce((sum, t) => sum + (getAbsenceDays(t) ?? 0), 0),
    [trips]
  )
  const activeTrips = trips.filter((t) => !optimisticDeletedIds.includes(t.id))

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const thClass =
    'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.8px] text-[var(--color-text-faint)] border-b border-[var(--color-nav-border)] bg-[var(--color-surface-sunken)] whitespace-nowrap cursor-pointer select-none hover:text-[var(--color-text-muted)] transition-colors'

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-manrope)] font-bold text-2xl text-[var(--color-text-primary)] tracking-tight">
              Trip Log
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Your complete absence record.</p>
          </div>
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-danger-text)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Trash className="w-4 h-4" weight="bold" />
                Delete {selectedIds.length}
              </button>
            )}
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
        {/* Mobile buttons — below heading, full width */}
        <div className="flex sm:hidden items-center gap-2.5 mt-4">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-danger-text)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Trash className="w-4 h-4" weight="bold" />
              Delete {selectedIds.length}
            </button>
          )}
          <button
            type="button"
            onClick={() => openDrawer('plan')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
          >
            Plan a trip
          </button>
          <button
            type="button"
            onClick={() => openDrawer('log')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer text-white"
            style={{ background: 'var(--gradient-green)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Log trip
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-nav-border)] shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[var(--color-nav-border)]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)]" viewBox="0 0 16 16" fill="none">
              <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM13 13l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations…"
              className="w-full sm:w-52 pl-8 pr-3 py-2 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-nav-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-faint)] outline-none focus:border-[var(--color-green)] transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        {activeTrips.length === 0 && !deleting ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-green-pale)] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-[var(--color-green)] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-manrope)] font-bold text-xl text-[var(--color-text-primary)] mb-2">
              No trips logged yet
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-6">
              Log your travel history to track your 180-day compliance window.
            </p>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {/* Select-all checkbox */}
                  <th className={`${thClass} w-10 cursor-default`} onClick={toggleSelectAll}>
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length ===
                          visibleTrips.filter((t) => !optimisticDeletedIds.includes(t.id)).length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-green)] cursor-pointer"
                      aria-label="Select all trips"
                    />
                  </th>
                  <th className={thClass} onClick={() => handleSort('destination')}>
                    Destination <SortIcon col="destination" sortKey={sortKey} dir={sortDir} />
                  </th>
                  <th className={`${thClass} hidden md:table-cell`} onClick={() => handleSort('departure_date')}>
                    Departure <SortIcon col="departure_date" sortKey={sortKey} dir={sortDir} />
                  </th>
                  <th className={`${thClass} hidden md:table-cell`} onClick={() => handleSort('return_date')}>
                    Return <SortIcon col="return_date" sortKey={sortKey} dir={sortDir} />
                  </th>
                  <th className={thClass} onClick={() => handleSort('days')}>
                    Days <SortIcon col="days" sortKey={sortKey} dir={sortDir} />
                  </th>
                  <th className={`${thClass} hidden lg:table-cell`}>
                    Window at departure
                  </th>
                  <th className={`${thClass} w-20 cursor-default`} />
                </tr>
              </thead>
              <tbody>
                {visibleTrips.map((trip) => {
                  if (optimisticDeletedIds.includes(trip.id)) return null

                  const { flag, name } = extractDestination(trip.destination)
                  const absenceDays = getAbsenceDays(trip)
                  const isCrownDep = isCrownDependency(trip.destination)
                  const windowDays = tripWindowMap.get(trip.id) ?? 0
                  const windowStatus = getRiskStatus(windowDays)
                  const windowCfg = RISK_CONFIG[windowStatus]
                  const isExpanded = expandedId === trip.id
                  const isChecked = selectedIds.includes(trip.id)

                  // Day count colour
                  const dayStatus = absenceDays !== null && !isCrownDep ? getRiskStatus(absenceDays) : null
                  const dayCfg = dayStatus ? RISK_CONFIG[dayStatus] : null

                  const rowClass = `group border-b border-[var(--color-nav-border)] last:border-b-0 transition-colors ${
                    isExpanded
                      ? 'bg-[var(--color-surface-sunken)]'
                      : 'hover:bg-[var(--color-surface-raised)]'
                  }`

                  return (
                    <Fragment key={trip.id}>
                      <tr className={rowClass}>
                        {/* Checkbox */}
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(trip.id)}
                            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-green)] cursor-pointer"
                            aria-label={`Select trip to ${name}`}
                          />
                        </td>

                        {/* Destination */}
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : trip.id)}
                            className="flex items-center gap-2.5 text-left cursor-pointer group/dest"
                          >
                            {flag && <span className="text-xl w-6 text-center" aria-hidden="true">{flag}</span>}
                            <span className="font-semibold text-sm text-[var(--color-text-primary)] group-hover/dest:text-[var(--color-green-light)] transition-colors">
                              {name}
                            </span>
                            {trip.return_date === null && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning-text)] animate-pulse" />
                                Abroad
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Departure */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                            {formatDate(trip.departure_date)}
                          </span>
                        </td>

                        {/* Return */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                            {trip.return_date ? formatDate(trip.return_date) : '—'}
                          </span>
                        </td>

                        {/* Days */}
                        <td className="px-4 py-3.5">
                          {isCrownDep ? (
                            <span className="font-[family-name:var(--font-mono)] text-xs px-2.5 py-1 rounded-full font-semibold bg-[var(--color-safe-bg)] text-[var(--color-safe-text)]">
                              0d
                            </span>
                          ) : absenceDays !== null && dayCfg ? (
                            <span className={`font-[family-name:var(--font-mono)] text-xs px-2.5 py-1 rounded-full font-semibold ${dayCfg.bg} ${dayCfg.text}`}>
                              {absenceDays}d
                            </span>
                          ) : trip.return_date === null ? (
                            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-faint)]">ongoing</span>
                          ) : (
                            <span className="text-xs text-[var(--color-text-faint)]">—</span>
                          )}
                        </td>

                        {/* Window at departure */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                              {windowDays}/180
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${windowCfg.chip}`}>
                              {windowCfg.label}
                            </span>
                          </div>
                        </td>

                        {/* Row actions (hover-reveal) */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => router.push(`/trips?modal=edit&tripId=${trip.id}`, { scroll: false })}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer text-sm"
                              aria-label={`Edit trip to ${name}`}
                              title="Edit"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                                <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(trip.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer"
                              aria-label={`Delete trip to ${name}`}
                              title="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr className="bg-[var(--color-surface-sunken)]">
                          <td />
                          <td colSpan={6} className="px-4 pb-4 pt-1">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-faint)] mb-1">Departed UK</p>
                                <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-primary)]">{formatDate(trip.departure_date)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-faint)] mb-1">Returned</p>
                                <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-primary)]">
                                  {trip.return_date ? formatDate(trip.return_date) : 'Currently abroad'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-faint)] mb-1">Duration</p>
                                <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-primary)]">
                                  {isCrownDep ? '0 days (Crown Dep.)' : absenceDays !== null ? `${absenceDays} days` : 'Ongoing'}
                                </p>
                              </div>
                              {trip.notes && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-faint)] mb-1">Notes</p>
                                  <p className="text-sm text-[var(--color-text-muted)] italic">{trip.notes}</p>
                                </div>
                              )}
                            </div>

                            <div className="px-3 py-2 bg-[var(--color-bg-tinted)] rounded-lg mb-3">
                              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{DISCLAIMER}</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => router.push(`/trips?modal=edit&tripId=${trip.id}`, { scroll: false })}
                                className="flex items-center gap-1.5 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-sm font-medium hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                                  <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(trip.id)}
                                className="flex items-center gap-1.5 border border-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] rounded-xl px-3 py-2 text-sm font-medium hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer"
                              >
                                <Trash className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}

                {visibleTrips.length === 0 && search && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                      No trips match &ldquo;{search}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {activeTrips.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--color-nav-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-faint)]">
              Showing {visibleTrips.filter((t) => !optimisticDeletedIds.includes(t.id)).length} of {activeTrips.length} trip{activeTrips.length !== 1 ? 's' : ''}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-faint)]">
              Total days abroad: {totalDays}
            </span>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-trip-title"
        >
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6 w-full max-w-sm">
            <h2 id="delete-trip-title" className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[var(--color-text-primary)] mb-2">
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

      {/* Trip modal */}
      <TripModal
        open={drawerOpen}
        mode={drawerMode ?? 'log'}
        onClose={() => router.push(returnTo, { scroll: false })}
        existingTrips={trips.filter(t => !optimisticDeletedIds.includes(t.id)).map(toTripInput)}
        visaStartDate={visaStartDate}
        isPro={isPro}
        tripCount={trips.length}
        initialTrip={drawerInitialTrip}
        redirectTo={returnTo}
      />
    </div>
  )
}

const DISCLAIMER =
  'Time in Crown Dependencies (Jersey, Guernsey, Isle of Man) does not count as absence. Time in British Overseas Territories (Gibraltar, Bermuda etc.) does count as absence. If you are unsure, consult an immigration adviser.'
