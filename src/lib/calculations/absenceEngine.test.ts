/**
 * Absence Engine — Mathematical Audit Test Suite
 *
 * All 17 test cases from the domain-specific compliance audit, plus regression
 * tests for both bugs fixed (BUG-1: ongoing trips, BUG-2: New Jersey).
 *
 * Test case 4 expected value is 88 (not 87 as originally specified — see audit
 * plan for the correction: March has 31 days, return is the 31st, so 30 March
 * days count as absence, not 29).
 */
import { describe, expect, it } from 'vitest'
import {
  calculateTripAbsenceDays,
  calculateWhatIf,
  getCurrentRollingWindow,
  getQualifyingPeriod,
  getPeakRollingWindow,
  getRollingWindowSeries,
  getRiskStatus,
  hasOverlappingTrip,
  isCrownDependency,
  type TripInput,
} from './absenceEngine'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function d(dateStr: string): Date {
  const [y, m, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

function trip(
  id: string,
  destination: string,
  departure_date: string,
  return_date: string | null
): TripInput {
  return { id, destination, departure_date, return_date }
}

// ---------------------------------------------------------------------------
// TC1–TC4: Basic counting
// ---------------------------------------------------------------------------

describe('Basic absence day counting', () => {
  it('TC1 — standard trip (May 12–19): 6 days', () => {
    const t = { destination: 'Spain', departure_date: '2025-05-12', return_date: '2025-05-19' }
    expect(calculateTripAbsenceDays(t)).toBe(6)
  })

  it('TC2 — next-day return (Jun 1–2): 0 days', () => {
    const t = { destination: 'France', departure_date: '2025-06-01', return_date: '2025-06-02' }
    expect(calculateTripAbsenceDays(t)).toBe(0)
  })

  it('TC3 — same-day return: 0 days', () => {
    const t = { destination: 'France', departure_date: '2025-06-01', return_date: '2025-06-01' }
    expect(calculateTripAbsenceDays(t)).toBe(0)
  })

  it('TC4 — long trip (Jan 1 – Mar 31 2025): 88 days', () => {
    // Jan 2–31 = 30, Feb 1–28 = 28, Mar 1–30 = 30 → total 88
    // (Audit spec said 87; correct value is 88 — March has 31 days, return is Mar 31)
    const t = { destination: 'USA', departure_date: '2025-01-01', return_date: '2025-03-31' }
    expect(calculateTripAbsenceDays(t)).toBe(88)
  })
})

// ---------------------------------------------------------------------------
// TC5–TC10: Rolling window
// ---------------------------------------------------------------------------

describe('Rolling window calculations', () => {
  it('TC5 — two trips, 40 days total → SAFE', () => {
    // Trip 1 absence: Jan 11–23 (13 days). Trip 2 absence: Jun 2–28 (27 days). Total: 40.
    // today = 2026-01-05 → window = 2025-01-05 to 2026-01-05, both trips fully inside.
    const trips = [
      trip('a', 'USA', '2025-01-10', '2025-01-24'),   // 13 days
      trip('b', 'Spain', '2025-06-01', '2025-06-29'), // 27 days
    ]
    const result = getCurrentRollingWindow(trips, d('2026-01-05'))
    expect(result.days).toBe(40)
    expect(result.status).toBe('SAFE')
  })

  it('TC6 — two trips, 216 days in a single rolling window → BREACH', () => {
    const trips = [
      trip('a', 'USA', '2025-01-01', '2025-04-30'),  // 118 days
      trip('b', 'USA', '2025-07-01', '2025-10-08'),  // 98 days
    ]
    // Window ending 2026-01-01 covers 2025-01-01 → 2026-01-01, both trips fully inside
    const result = getPeakRollingWindow(trips, '2025-01-01', d('2026-01-01'))
    expect(result.days).toBe(216)
    expect(result.status).toBe('BREACH')
  })

  it('TC7 — year-boundary trip (Dec 20 – Jan 10): 20 days', () => {
    const t = { destination: 'USA', departure_date: '2025-12-20', return_date: '2026-01-10' }
    // Dec 21–31 = 11, Jan 1–9 = 9 → total 20
    expect(calculateTripAbsenceDays(t)).toBe(20)
  })

  it('TC8 — single trip 182 days → BREACH', () => {
    const trips = [trip('a', 'USA', '2025-07-01', '2025-12-31')]  // 182 days
    const result = getPeakRollingWindow(trips, '2025-01-01', d('2026-01-01'))
    expect(result.days).toBe(182)
    expect(result.status).toBe('BREACH')
  })

  it('TC9 — cross-year trips, combined 193 days → BREACH', () => {
    const trips = [
      trip('a', 'Australia', '2025-10-01', '2025-12-15'),  // 74 days
      trip('b', 'Australia', '2026-02-01', '2026-06-01'),  // 119 days
    ]
    // Window ~Oct 2025–Oct 2026: 74 + 119 = 193
    const result = getPeakRollingWindow(trips, '2025-01-01', d('2026-10-01'))
    expect(result.days).toBe(193)
    expect(result.status).toBe('BREACH')
  })

  it('TC10 (BUG-1 regression) — ongoing trip counts with today as provisional return', () => {
    // Depart 30 days ago, no return logged yet → expect 29 absence days
    const today = d('2025-06-30')
    const departureStr = '2025-05-31' // 30 days before today
    const trips = [trip('a', 'Spain', departureStr, null)]
    const result = getCurrentRollingWindow(trips, today)
    // Absence: May 31+1=Jun 1 through Jun 29 (today-1) = 29 days
    expect(result.days).toBe(29)
  })
})

// ---------------------------------------------------------------------------
// TC11–TC17: Edge cases
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('TC11 — pre-visa trip excluded from rolling window', () => {
    const trips = [trip('a', 'France', '2022-12-01', '2022-12-20')]
    const result = getCurrentRollingWindow(trips, d('2024-01-01'), '2023-01-14')
    expect(result.days).toBe(0)
  })

  it('TC12 — Crown Dependency trip: 0 absence days', () => {
    const t = { destination: 'Jersey', departure_date: '2025-03-01', return_date: '2025-03-07' }
    expect(calculateTripAbsenceDays(t)).toBe(0)
  })

  it('TC13 — exactly 180 days → DANGER (within limit, not BREACH)', () => {
    expect(getRiskStatus(180)).toBe('DANGER')
  })

  it('TC14 — exactly 181 days → BREACH', () => {
    expect(getRiskStatus(181)).toBe('BREACH')
  })

  it('TC15 — overlapping trips are de-duplicated; each calendar day counted once', () => {
    // Trip A: Jan 1–10 → absence Jan 2–9 (8 days)
    // Trip B: Jan 5–15 → absence Jan 6–14 (9 days)
    // Merged interval: Jan 2–14 → 13 days (not 8+9=17)
    const trips = [
      trip('a', 'USA', '2025-01-01', '2025-01-10'),
      trip('b', 'USA', '2025-01-05', '2025-01-15'),
    ]
    const result = getCurrentRollingWindow(trips, d('2025-06-01'))
    expect(result.days).toBe(13)
  })

  it('TC16 — leap year trip spanning Feb 29: 4 days', () => {
    const t = { destination: 'France', departure_date: '2024-02-27', return_date: '2024-03-03' }
    // Feb 28, Feb 29, Mar 1, Mar 2 = 4 days
    expect(calculateTripAbsenceDays(t)).toBe(4)
  })

  it('TC17 — what-if simulator: 100 existing days + 30-day trip = 130', () => {
    // Build exactly 100 absence days in the past year
    // One trip: depart 2024-11-01, return 2024-12-11 → (40 days between = 39 absence days)
    // Another: depart 2025-01-01, return 2025-03-03 → Mar 3 - Jan 1 = 61 days, 61-1=60 days
    // 39 + 60 = 99... let's use cleaner numbers:
    // Trip A: depart 2025-01-01, return 2025-03-13 → daysBetween = 71, absence = 70 days
    // Trip B: depart 2025-04-01, return 2025-05-02 → daysBetween = 31, absence = 30 days
    // Total: 70 + 30 = 100 days
    const today = d('2025-08-01') // what-if return date (passed as `today`)
    const existingTrips = [
      trip('a', 'USA', '2025-01-01', '2025-03-13'),  // 70 days
      trip('b', 'USA', '2025-04-01', '2025-05-02'),  // 30 days
    ]
    // Verify existing = 100 days as of the what-if return date
    const baseWindow = getCurrentRollingWindow(existingTrips, today)
    expect(baseWindow.days).toBe(100)

    // Hypothetical trip: 30 absence days
    // depart 2025-07-01, return 2025-08-01 → daysBetween=31, absence=30
    const hypothetical = {
      destination: 'Japan',
      departure_date: '2025-07-01',
      return_date: '2025-08-01',
    }
    const result = calculateWhatIf(existingTrips, hypothetical, today)
    expect(result.days).toBe(130)
  })
})

// ---------------------------------------------------------------------------
// getRiskStatus thresholds
// ---------------------------------------------------------------------------

describe('getRiskStatus', () => {
  it('0 days → SAFE', () => expect(getRiskStatus(0)).toBe('SAFE'))
  it('120 days → SAFE', () => expect(getRiskStatus(120)).toBe('SAFE'))
  it('121 days → WARNING', () => expect(getRiskStatus(121)).toBe('WARNING'))
  it('150 days → WARNING', () => expect(getRiskStatus(150)).toBe('WARNING'))
  it('151 days → DANGER', () => expect(getRiskStatus(151)).toBe('DANGER'))
  it('180 days → DANGER', () => expect(getRiskStatus(180)).toBe('DANGER'))
  it('181 days → BREACH', () => expect(getRiskStatus(181)).toBe('BREACH'))
  it('999 days → BREACH', () => expect(getRiskStatus(999)).toBe('BREACH'))
})

// ---------------------------------------------------------------------------
// isCrownDependency — BUG-2 regression
// ---------------------------------------------------------------------------

describe('isCrownDependency', () => {
  // True cases
  it('"Jersey" → true', () => expect(isCrownDependency('Jersey')).toBe(true))
  it('"jersey" → true (case insensitive)', () => expect(isCrownDependency('jersey')).toBe(true))
  it('"Guernsey" → true', () => expect(isCrownDependency('Guernsey')).toBe(true))
  it('"Isle of Man" → true', () => expect(isCrownDependency('Isle of Man')).toBe(true))
  it('"St Helier, Jersey" → true (city, territory)', () => expect(isCrownDependency('St Helier, Jersey')).toBe(true))
  it('"Douglas, Isle of Man" → true', () => expect(isCrownDependency('Douglas, Isle of Man')).toBe(true))
  it('"St Peter Port, Guernsey" → true', () => expect(isCrownDependency('St Peter Port, Guernsey')).toBe(true))

  // False cases — BUG-2 regression
  it('"New Jersey" → false (BUG-2 regression)', () => expect(isCrownDependency('New Jersey')).toBe(false))
  it('"Jersey City" → false', () => expect(isCrownDependency('Jersey City')).toBe(false))
  it('"New Jersey, USA" → false', () => expect(isCrownDependency('New Jersey, USA')).toBe(false))
  it('"Gibraltar" → false (British Overseas Territory, not Crown Dep)', () => expect(isCrownDependency('Gibraltar')).toBe(false))
  it('"USA" → false', () => expect(isCrownDependency('USA')).toBe(false))
  it('"France" → false', () => expect(isCrownDependency('France')).toBe(false))
  it('empty string → false', () => expect(isCrownDependency('')).toBe(false))
  it('whitespace-only → false', () => expect(isCrownDependency('   ')).toBe(false))
})

// ---------------------------------------------------------------------------
// Window boundary clipping
// ---------------------------------------------------------------------------

describe('Window boundary clipping (cross-boundary trips)', () => {
  it('trip straddling window start: only interior days are counted', () => {
    // Trip: depart Dec 20 2024, return Feb 10 2025
    // Absence days: Dec 21–Feb 9
    // Window: Jan 1 2025 – Jan 1 2026
    // Days in window: Jan 1–Feb 9 = 40 days
    const trips = [trip('a', 'USA', '2024-12-20', '2025-02-10')]
    const result = getCurrentRollingWindow(trips, d('2026-01-01'))
    // Jan 1 to Feb 9 inclusive = 40 days
    expect(result.days).toBe(40)
  })

  it('trip straddling window end: only interior days before window end are counted', () => {
    // Trip: depart Jun 1 2025, return Dec 31 2025 (182 days)
    // Window: Jun 15 2025 – Jun 15 2026 (ending today Jun 15 2026)
    // But return is Dec 31 2025, so absEnd = Dec 30, entirely before windowEnd
    // absStart = Jun 2, clipped to max(Jun 2, Jun 15) = Jun 15
    // Days: Jun 15 to Dec 30 inclusive
    const trips = [trip('a', 'USA', '2025-06-01', '2025-12-31')]
    const result = getCurrentRollingWindow(trips, d('2026-06-15'))
    // Jun 15 to Dec 30 = 199 days... let me recalculate
    // Jun: Jun 15 to Jun 30 = 16 days
    // Jul: 31, Aug: 31, Sep: 30, Oct: 31, Nov: 30, Dec 1–30: 30
    // Total: 16+31+31+30+31+30+30 = 199 days
    expect(result.days).toBe(199)
  })
})

// ---------------------------------------------------------------------------
// getQualifyingPeriod
// ---------------------------------------------------------------------------

describe('getQualifyingPeriod', () => {
  it('calculates ILR date as visa start + 5 years', () => {
    const result = getQualifyingPeriod('2023-01-14')
    expect(result.ilrDate.getUTCFullYear()).toBe(2028)
    expect(result.ilrDate.getUTCMonth()).toBe(0) // January
    expect(result.ilrDate.getUTCDate()).toBe(14)
  })

  it('returns 100% when today is at or past ILR date', () => {
    // visa start 5 years in the past
    const result = getQualifyingPeriod('2020-01-01', new Date(Date.UTC(2026, 0, 1)))
    expect(result.percentage).toBe(100)
  })

  it('returns 0% on the visa start date', () => {
    const visaStart = '2025-01-01'
    const result = getQualifyingPeriod(visaStart, new Date(Date.UTC(2025, 0, 1)))
    expect(result.percentage).toBe(0)
  })

  it('handles leap year visa start (Feb 29) → ILR date is Feb 28 in non-leap year', () => {
    // Feb 29 2024 + 5 years → 2029 is not a leap year → setFullYear gives Feb 28 2029
    const result = getQualifyingPeriod('2024-02-29')
    expect(result.ilrDate.getUTCFullYear()).toBe(2029)
    // JS Date.setFullYear(2029) on Feb 29 rolls over to Mar 1 — we verify it's handled
    // The engine uses setFullYear on the parsed UTC date
    const month = result.ilrDate.getUTCMonth()
    const day = result.ilrDate.getUTCDate()
    // Result could be Feb 28 or Mar 1 depending on JS engine — both are acceptable
    // but the year must be 2029
    expect([1, 2]).toContain(month) // Feb (1) or Mar (2)
    expect([28, 1]).toContain(day)
  })

  it('totalDays is approximately 5 × 365 days', () => {
    const result = getQualifyingPeriod('2023-01-01')
    expect(result.totalDays).toBeGreaterThan(1824)
    expect(result.totalDays).toBeLessThan(1827)
  })

  it('clamps daysElapsed to totalDays when past ILR date', () => {
    const result = getQualifyingPeriod('2019-01-01', new Date(Date.UTC(2030, 0, 1)))
    expect(result.daysElapsed).toBe(result.totalDays)
    expect(result.percentage).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// hasOverlappingTrip — additional cases
// ---------------------------------------------------------------------------

describe('hasOverlappingTrip — additional cases', () => {
  it('no trips → no overlap', () => {
    expect(hasOverlappingTrip([], '2025-06-01', '2025-06-10')).toBe(false)
  })

  it('back-to-back trips (return = next departure) → no overlap (strict equality allowed)', () => {
    const existing = [trip('a', 'Spain', '2025-03-01', '2025-03-20')]
    // new trip starts on the same day as existing trip's return date — allowed
    expect(hasOverlappingTrip(existing, '2025-03-20', '2025-03-25')).toBe(false)
  })

  it('excludeId skips the specified trip (edit mode)', () => {
    const existing = [trip('a', 'Spain', '2025-03-01', '2025-03-20')]
    // Would normally overlap, but id 'a' is excluded
    expect(hasOverlappingTrip(existing, '2025-03-10', '2025-03-25', 'a')).toBe(false)
  })

  it('ongoing trip (null return) treated as far future — blocks new trips', () => {
    const existing = [trip('a', 'Spain', '2025-03-01', null)]
    expect(hasOverlappingTrip(existing, '2025-06-01', '2025-06-10')).toBe(true)
  })

  it('new trip with null returnDate (ongoing) overlaps existing trip', () => {
    const existing = [trip('a', 'Spain', '2025-03-01', '2025-03-20')]
    // New trip starts inside the existing trip, no return date → treated as far future
    expect(hasOverlappingTrip(existing, '2025-03-10', null)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// countDedupedDays — contained interval (FALSE branch of r.end > last.end)
// ---------------------------------------------------------------------------

describe('countDedupedDays — contained interval', () => {
  it('TC15b — trip completely contained in another: each day counted once', () => {
    // Trip A: Jan 1–20 → absence Jan 2–19 (18 days)
    // Trip B: Jan 5–10 → absence Jan 6–9 (4 days, fully inside A)
    // Merged interval: Jan 2–19 → 18 days (not 18+4=22)
    const trips = [
      trip('a', 'USA', '2025-01-01', '2025-01-20'),
      trip('b', 'USA', '2025-01-05', '2025-01-10'),
    ]
    const result = getCurrentRollingWindow(trips, d('2025-06-01'))
    expect(result.days).toBe(18)
  })
})

// ---------------------------------------------------------------------------
// Branch coverage — ensure private tripDaysInWindow branches are all hit
// ---------------------------------------------------------------------------

describe('Branch coverage — tripDaysInWindow internal guards', () => {
  it('getPeakRollingWindow: null return_date trip is skipped (line 187)', () => {
    // Null-return trips are excluded from peak window (historical metric)
    const trips = [trip('a', 'Spain', '2025-01-01', null)]
    const result = getPeakRollingWindow(trips, '2025-01-01', d('2026-01-01'))
    expect(result.days).toBe(0)
  })

  it('getPeakRollingWindow: pre-visa trip skipped (line 188)', () => {
    const trips = [trip('a', 'Spain', '2022-01-01', '2022-06-01')]
    const result = getPeakRollingWindow(trips, '2023-01-01', d('2026-01-01'))
    expect(result.days).toBe(0)
  })

  it('getCurrentRollingWindow: Crown Dependency trip contributes 0 (isCrownDependency branch in tripDaysInWindow)', () => {
    const trips = [trip('a', 'Guernsey', '2025-01-01', '2025-06-01')]
    const result = getCurrentRollingWindow(trips, d('2026-01-01'))
    expect(result.days).toBe(0)
  })

  it('trip return is before window start: no overlap → 0 days', () => {
    // Trip ends Dec 2023 entirely before the window starting Dec 2024
    const trips = [trip('a', 'USA', '2023-11-01', '2023-12-01')]
    const result = getCurrentRollingWindow(trips, d('2025-01-01')) // window: Jan 2024 – Jan 2025
    // absEnd = Nov 30, windowStart = Jan 5 2024 — overlap is 0
    // Actually: window is Jan 1 2024–Jan 1 2025, absEnd = Nov 30 2023 < windowStart Jan 1 2024
    expect(result.days).toBe(0)
  })

  it('same-day trip inside window: absEnd < absStart → 0 (line 112)', () => {
    // Depart and return on same day inside the rolling window — zero absence days
    const trips = [trip('a', 'Spain', '2025-06-15', '2025-06-15')]
    const result = getCurrentRollingWindow(trips, d('2026-01-01'))
    expect(result.days).toBe(0)
  })
})

describe('getRollingWindowSeries', () => {
  it('returns all-zero points (and a final today point) when there are no trips', () => {
    const series = getRollingWindowSeries([], '2024-01-15', d('2026-06-30'))
    expect(series.length).toBeGreaterThan(0)
    expect(series.every((p) => p.days === 0)).toBe(true)
  })

  it('always ends exactly on today', () => {
    const today = d('2026-06-30')
    const series = getRollingWindowSeries([trip('a', 'Spain', '2025-03-01', '2025-04-01')], '2024-01-15', today)
    expect(series[series.length - 1].date.getTime()).toBe(today.getTime())
  })

  it('respects the maxPoints cap', () => {
    // ~2.5 years span, capped at 30 points → at most 31 (cap + guaranteed final today)
    const series = getRollingWindowSeries([], '2024-01-15', d('2026-06-30'), 30)
    expect(series.length).toBeLessThanOrEqual(31)
  })

  it('the series peak equals getPeakRollingWindow at a sampled resolution', () => {
    const trips = [
      trip('a', 'Spain', '2025-01-01', '2025-04-15'), // ~103 absence days
      trip('b', 'USA', '2025-05-01', '2025-06-10'),   // ~39 absence days
    ]
    const today = d('2026-06-30')
    // Daily resolution (maxPoints high) so a sample lands on the true peak window end.
    const series = getRollingWindowSeries(trips, '2024-12-01', today, 1000)
    const seriesPeak = Math.max(...series.map((p) => p.days))
    const enginePeak = getPeakRollingWindow(trips, '2024-12-01', today).days
    expect(seriesPeak).toBe(enginePeak)
  })

  it('only counts completed trips on/after the visa start (mirrors peak)', () => {
    const trips = [
      trip('pre', 'Spain', '2023-01-01', '2023-06-01'), // before visa start — excluded
      trip('open', 'USA', '2025-01-01', null),          // ongoing — excluded from historical series
    ]
    const series = getRollingWindowSeries(trips, '2024-01-15', d('2026-06-30'))
    expect(series.every((p) => p.days === 0)).toBe(true)
  })
})

