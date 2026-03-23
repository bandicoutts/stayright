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
const MAX_ABSENCE_DAYS = 180

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
    const lastPart = lower.split(',').at(-1)?.trim() ?? ''
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
 * Returns how many absence days from a trip fall within [windowStart, windowEnd].
 * Handles trips that span window boundaries by clipping the absence range.
 */
function tripDaysInWindow(
  trip: TripInput,
  windowStart: Date,
  windowEnd: Date
): number {
  if (!trip.return_date) return 0
  if (isCrownDependency(trip.destination)) return 0

  const dep = parseDate(trip.departure_date)
  const ret = parseDate(trip.return_date)

  // Absence days are strictly between departure and return (exclusive both ends)
  const absStart = addDays(dep, 1)
  const absEnd = addDays(ret, -1)

  if (absEnd < absStart) return 0 // 0 or 1-day gap → no absence

  // Clip to the window
  const overlapStart = absStart > windowStart ? absStart : windowStart
  const overlapEnd = absEnd < windowEnd ? absEnd : windowEnd

  if (overlapEnd < overlapStart) return 0

  return daysBetween(overlapStart, overlapEnd) + 1 // inclusive of both ends
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

  let days = 0
  for (const trip of trips) {
    if (visaStartDate && trip.departure_date < visaStartDate) continue
    const effectiveTrip = trip.return_date ? trip : { ...trip, return_date: provisionalReturn }
    days += tripDaysInWindow(effectiveTrip, windowStart, windowEnd)
  }

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

    let days = 0
    for (const trip of trips) {
      if (!trip.return_date) continue
      if (trip.departure_date < visaStartDate) continue
      days += tripDaysInWindow(trip, windowStart, cursor)
    }

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
