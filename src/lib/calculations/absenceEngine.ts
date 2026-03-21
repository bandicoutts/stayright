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

const CROWN_DEPENDENCIES = ['jersey', 'guernsey', 'isle of man']
const MAX_ABSENCE_DAYS = 180

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the destination is a Crown Dependency (0 absence days). */
export function isCrownDependency(destination: string): boolean {
  const lower = destination.toLowerCase()
  return CROWN_DEPENDENCIES.some((cd) => lower.includes(cd))
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
 * Ongoing trips (return_date = null) are excluded from the count.
 */
export function getCurrentRollingWindow(
  trips: TripInput[],
  today: Date = new Date(),
  visaStartDate?: string
): RollingWindowResult {
  const windowEnd = stripTime(today)
  const windowStart = new Date(windowEnd)
  windowStart.setFullYear(windowStart.getFullYear() - 1)

  let days = 0
  for (const trip of trips) {
    if (!trip.return_date) continue
    if (visaStartDate && trip.departure_date < visaStartDate) continue
    days += tripDaysInWindow(trip, windowStart, windowEnd)
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
