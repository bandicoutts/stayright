/**
 * StayRight Absence Engine
 *
 * Pure functions — no framework dependencies, fully unit-testable.
 * All calculations follow the official Home Office formula (DECISION-002):
 *   absence_days = (return_date - departure_date) - 1
 *
 * Neither departure nor return day counts as a day of absence.
 *
 * IMPORTANT: These functions are the most critical business logic in the product.
 * An incorrect calculation could cause a user to breach their visa conditions.
 * Do not modify without updating tests.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskStatus = 'SAFE' | 'WARNING' | 'DANGER' | 'BREACH'

export interface TripInput {
  id: string
  destination: string
  departure_date: string  // YYYY-MM-DD
  return_date: string | null  // null = currently abroad
}

export interface RollingWindowResult {
  days: number
  status: RiskStatus
  windowStart: Date
  windowEnd: Date
}

export interface QualifyingPeriodResult {
  percentage: number    // 0–100
  ilrDate: Date
  visaStartDate: Date
  daysElapsed: number
  totalDays: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Exact canonical names for Crown Dependencies (presence counts as UK presence).
// Matching is: full-string OR last comma-separated component — prevents false positives
// like "New Jersey" or "Jersey City" matching "jersey".
const CROWN_DEPENDENCIES_EXACT = ['jersey', 'guernsey', 'isle of man']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the destination is a Crown Dependency (0 absence days).
 *
 * Matching rules:
 * - Full-string match: "Jersey" ✅
 * - Last comma-separated component: "St Helier, Jersey" ✅
 * - Substring NOT matched: "New Jersey" ❌, "Jersey City" ❌
 */
export function isCrownDependency(destination: string): boolean {
  const lower = destination.toLowerCase().trim()
  return CROWN_DEPENDENCIES_EXACT.some((cd) => {
    if (lower === cd) return true
    const lastPart = lower.split(',').at(-1)!.trim()
    return lastPart === cd
  })
}

/**
 * Counts the calendar days strictly between two dates (exclusive of both ends).
 * Matches the Home Office formula: days = (return - departure) - 1.
 * Returns 0 for same-day or next-day returns.
 */
export function calculateTripAbsenceDays(trip: {
  destination: string
  departure_date: string
  return_date: string
}): number {
  if (isCrownDependency(trip.destination)) return 0

  const dep = parseDate(trip.departure_date)
  const ret = parseDate(trip.return_date)

  const diffDays = daysBetween(dep, ret) - 1
  return Math.max(0, diffDays)
}

/**
 * Returns the clipped absence interval for a trip within [windowStart, windowEnd],
 * or null if the trip contributes zero absence days.
 */
function tripAbsenceInterval(
  trip: TripInput,
  windowStart: Date,
  windowEnd: Date
): { start: Date; end: Date } | null {
  if (isCrownDependency(trip.destination)) return null

  const dep = parseDate(trip.departure_date)
  // Callers guarantee return_date is non-null before calling this function
  const ret = parseDate(trip.return_date as string)

  // Absence days are strictly between departure and return (exclusive both ends)
  const absStart = addDays(dep, 1)
  const absEnd = addDays(ret, -1)

  if (absEnd < absStart) return null // 0 or 1-day gap → no absence

  // Clip to the window
  const overlapStart = absStart > windowStart ? absStart : windowStart
  const overlapEnd = absEnd < windowEnd ? absEnd : windowEnd

  if (overlapEnd < overlapStart) return null

  return { start: overlapStart, end: overlapEnd }
}

/**
 * Merges an array of date intervals and counts unique days across all of them.
 * Prevents double-counting when overlapping trips enter the database (e.g. via
 * a future bulk import or admin edit) despite the UI's overlap guard.
 * This makes window summation idempotent against dirty data (DECISION-047).
 */
function countDedupedDays(intervals: Array<{ start: Date; end: Date }>): number {
  if (intervals.length === 0) return 0
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime())
  const merged: Array<{ start: Date; end: Date }> = [{ ...sorted[0] }]
  for (const r of sorted.slice(1)) {
    const last = merged[merged.length - 1]
    if (r.start <= last.end) {
      if (r.end > last.end) last.end = r.end
    } else {
      merged.push({ ...r })
    }
  }
  return merged.reduce((sum, r) => sum + daysBetween(r.start, r.end) + 1, 0)
}

// ---------------------------------------------------------------------------
// Core calculations
// ---------------------------------------------------------------------------

/**
 * Returns the total absence days in the rolling 12-month window ending on `today`.
 *
 * Trips before visaStartDate are excluded (stored but not counted — PRD 4c).
 * Ongoing trips (return_date = null) are counted using `today` as a provisional
 * return date — the user is currently abroad, so their absence is real and must
 * be shown on the dashboard (DECISION-002).
 */
export function getCurrentRollingWindow(
  trips: TripInput[],
  today: Date = new Date(),
  visaStartDate?: string
): RollingWindowResult {
  const windowEnd = stripTime(today)
  const windowStart = new Date(windowEnd)
  windowStart.setFullYear(windowStart.getFullYear() - 1)

  // For ongoing trips, substitute windowEnd (today) as provisional return so
  // the days already spent abroad are counted in the current rolling window.
  const provisionalReturn = formatDate(windowEnd)

  const intervals = trips
    .filter((trip) => !(visaStartDate && trip.departure_date < visaStartDate))
    .map((trip) => {
      const effectiveTrip = trip.return_date ? trip : { ...trip, return_date: provisionalReturn }
      return tripAbsenceInterval(effectiveTrip, windowStart, windowEnd)
    })
    .filter((i): i is { start: Date; end: Date } => i !== null)

  const days = countDedupedDays(intervals)

  return {
    days,
    status: getRiskStatus(days),
    windowStart,
    windowEnd,
  }
}

/**
 * Finds the peak 12-month rolling window across the entire qualifying period.
 * Checks every day from visaStartDate to today as a potential window end date.
 */
export function getPeakRollingWindow(
  trips: TripInput[],
  visaStartDate: string,
  today: Date = new Date()
): RollingWindowResult {
  const start = parseDate(visaStartDate)
  const end = stripTime(today)

  let peakDays = 0
  let peakWindowStart = start
  let peakWindowEnd = end

  // Step through each day from visa start to today as the window end
  const cursor = new Date(start)
  while (cursor <= end) {
    const windowStart = new Date(cursor)
    windowStart.setFullYear(windowStart.getFullYear() - 1)

    const intervals = trips
      .filter((trip) => trip.return_date && trip.departure_date >= visaStartDate)
      .map((trip) => tripAbsenceInterval(trip, windowStart, cursor))
      .filter((i): i is { start: Date; end: Date } => i !== null)

    const days = countDedupedDays(intervals)

    if (days > peakDays) {
      peakDays = days
      peakWindowStart = new Date(windowStart)
      peakWindowEnd = new Date(cursor)
    }

    cursor.setDate(cursor.getDate() + 1)
  }

  return {
    days: peakDays,
    status: getRiskStatus(peakDays),
    windowStart: peakWindowStart,
    windowEnd: peakWindowEnd,
  }
}

export interface RollingWindowSeriesPoint {
  date: Date
  days: number
}

/**
 * Returns a time series of the rolling 12-month window day-count, sampled from
 * visaStartDate to today. Powers the dashboard PeakTrajectoryChart.
 *
 * Like getPeakRollingWindow, only completed trips on/after the visa start are
 * counted (the historical trajectory is a record of what actually happened).
 * Sampling is capped at ~maxPoints to keep the SVG path light; the final point
 * always lands on `today`.
 */
export function getRollingWindowSeries(
  trips: TripInput[],
  visaStartDate: string,
  today: Date = new Date(),
  maxPoints = 80
): RollingWindowSeriesPoint[] {
  const start = parseDate(visaStartDate)
  const end = stripTime(today)
  if (end < start) return []

  const totalDays = Math.max(1, daysBetween(start, end))
  const step = Math.max(1, Math.ceil(totalDays / Math.max(1, maxPoints)))

  const completed = trips.filter(
    (trip) => trip.return_date && trip.departure_date >= visaStartDate
  )

  const pointAt = (windowEnd: Date): RollingWindowSeriesPoint => {
    const windowStart = new Date(windowEnd)
    windowStart.setFullYear(windowStart.getFullYear() - 1)
    const intervals = completed
      .map((trip) => tripAbsenceInterval(trip, windowStart, windowEnd))
      .filter((i): i is { start: Date; end: Date } => i !== null)
    return { date: new Date(windowEnd), days: countDedupedDays(intervals) }
  }

  const points: RollingWindowSeriesPoint[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    points.push(pointAt(new Date(cursor)))
    cursor.setDate(cursor.getDate() + step)
  }

  // Always include today as the final sample.
  if (points.length === 0 || points[points.length - 1].date.getTime() !== end.getTime()) {
    points.push(pointAt(end))
  }

  return points
}

/**
 * Returns the risk status for a given number of absence days.
 * Thresholds per PRD Section 4c and MEMORY.md.
 */
export function getRiskStatus(days: number): RiskStatus {
  if (days <= 120) return 'SAFE'
  if (days <= 150) return 'WARNING'
  if (days <= 180) return 'DANGER'
  return 'BREACH'
}

/**
 * Calculates qualifying period progress toward ILR.
 * Qualifying period = visa start date + 5 years.
 */
export function getQualifyingPeriod(
  visaStartDate: string,
  today: Date = new Date()
): QualifyingPeriodResult {
  const start = parseDate(visaStartDate)
  const ilrDate = new Date(start)
  ilrDate.setFullYear(ilrDate.getFullYear() + 5)

  const totalDays = daysBetween(start, ilrDate)
  const elapsed = stripTime(today)
  const daysElapsed = Math.max(0, Math.min(daysBetween(start, elapsed), totalDays))
  const percentage = Math.round((daysElapsed / totalDays) * 100)

  return {
    percentage: Math.min(percentage, 100),
    ilrDate,
    visaStartDate: start,
    daysElapsed,
    totalDays,
  }
}

/**
 * Returns true if the given departure/return range overlaps with any trip in
 * the list.  Two ranges overlap when they share at least one interior day —
 * strictly: dep_A < ret_B AND dep_B < ret_A.
 *
 * Using strict inequality means back-to-back trips where one's return date
 * equals the next trip's departure date are allowed (the user arrived home
 * and left again on the same calendar day).
 *
 * Pass excludeId to skip one trip (edit mode: exclude the trip being updated).
 * A null returnDate means the trip is ongoing — treated as far future.
 */
export function hasOverlappingTrip(
  trips: TripInput[],
  departureDate: string,
  returnDate: string | null,
  excludeId?: string
): boolean {
  const FAR_FUTURE = '9999-12-31'
  const newEnd = returnDate ?? FAR_FUTURE

  return trips.some((t) => {
    if (excludeId && t.id === excludeId) return false
    const existingEnd = t.return_date ?? FAR_FUTURE
    return departureDate < existingEnd && t.departure_date < newEnd
  })
}

/**
 * Calculates what-if: how many absence days would the user have in their
 * current rolling window if they added a hypothetical trip?
 */
export function calculateWhatIf(
  existingTrips: TripInput[],
  hypotheticalTrip: { destination: string; departure_date: string; return_date: string },
  today: Date = new Date(),
  visaStartDate?: string
): RollingWindowResult {
  const fakeTrip: TripInput = {
    id: '__whatif__',
    ...hypotheticalTrip,
  }
  return getCurrentRollingWindow(
    [...existingTrips, fakeTrip],
    today,
    visaStartDate
  )
}

// ---------------------------------------------------------------------------
// Date utilities (no external dependencies)
// ---------------------------------------------------------------------------

function parseDate(dateStr: string): Date {
  // YYYY-MM-DD — parse as UTC midnight to avoid timezone shifts
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function stripTime(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

/** Formats a UTC-midnight Date as YYYY-MM-DD. */
function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
