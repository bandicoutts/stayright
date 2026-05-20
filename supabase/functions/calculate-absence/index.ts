/**
 * calculate-absence Edge Function
 *
 * Exposes the StayRight 180-day absence calculation engine to mobile clients
 * (Flutter and future platforms) via a bearer-token-authenticated POST endpoint.
 *
 * The calculation logic is a direct port of src/lib/calculations/absenceEngine.ts.
 * Both implementations must stay in sync if the Home Office formula changes (DECISION-002).
 * The web app continues to run its own local TypeScript copy; this function is additive.
 *
 * API:
 *   POST /functions/v1/calculate-absence
 *   Authorization: Bearer <user_access_token>
 *   Content-Type: application/json
 *
 * Body (all fields optional):
 *   {
 *     "hypothetical_trips": [{ "destination": "...", "departure_date": "YYYY-MM-DD", "return_date": "YYYY-MM-DD" }],
 *     "projection_date": "YYYY-MM-DD"   // for what-if: project forward to trip return date (DECISION-022)
 *   }
 *
 * When hypothetical_trips are provided:
 *   - rolling_window includes the hypothetical trips (what-if result)
 *   - peak_rolling_window is omitted (O(days×trips) cost not justified for projections)
 *   - Pass projection_date = hypothetical trip return_date to project the window forward (DECISION-022)
 *
 * Related: DECISION-002, DECISION-011, DECISION-018, DECISION-022, DECISION-042, DECISION-071
 */

import { createClient } from 'npm:@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Types (mirrored from src/lib/calculations/absenceEngine.ts)
// ---------------------------------------------------------------------------

type RiskStatus = 'SAFE' | 'WARNING' | 'DANGER' | 'BREACH'

interface TripInput {
  id: string
  destination: string
  departure_date: string  // YYYY-MM-DD
  return_date: string | null  // null = currently abroad
}

interface RollingWindowResult {
  days: number
  status: RiskStatus
  windowStart: Date
  windowEnd: Date
}

interface QualifyingPeriodResult {
  percentage: number
  ilrDate: Date
  visaStartDate: Date
  daysElapsed: number
  totalDays: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CROWN_DEPENDENCIES_EXACT = ['jersey', 'guernsey', 'isle of man']

// ---------------------------------------------------------------------------
// Absence engine (ported from src/lib/calculations/absenceEngine.ts)
// Keep in sync with the TypeScript original.
// ---------------------------------------------------------------------------

function isCrownDependency(destination: string): boolean {
  const lower = destination.toLowerCase().trim()
  return CROWN_DEPENDENCIES_EXACT.some((cd) => {
    if (lower === cd) return true
    const lastPart = lower.split(',').at(-1)!.trim()
    return lastPart === cd
  })
}

function tripAbsenceInterval(
  trip: TripInput,
  windowStart: Date,
  windowEnd: Date
): { start: Date; end: Date } | null {
  if (isCrownDependency(trip.destination)) return null

  const dep = parseDate(trip.departure_date)
  const ret = parseDate(trip.return_date as string)

  const absStart = addDays(dep, 1)
  const absEnd = addDays(ret, -1)

  if (absEnd < absStart) return null

  const overlapStart = absStart > windowStart ? absStart : windowStart
  const overlapEnd = absEnd < windowEnd ? absEnd : windowEnd

  if (overlapEnd < overlapStart) return null

  return { start: overlapStart, end: overlapEnd }
}

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

function getCurrentRollingWindow(
  trips: TripInput[],
  today: Date,
  visaStartDate?: string
): RollingWindowResult {
  const windowEnd = stripTime(today)
  const windowStart = new Date(windowEnd)
  windowStart.setFullYear(windowStart.getFullYear() - 1)

  const provisionalReturn = formatDate(windowEnd)

  const intervals = trips
    .filter((trip) => !(visaStartDate && trip.departure_date < visaStartDate))
    .map((trip) => {
      const effectiveTrip = trip.return_date ? trip : { ...trip, return_date: provisionalReturn }
      return tripAbsenceInterval(effectiveTrip, windowStart, windowEnd)
    })
    .filter((i): i is { start: Date; end: Date } => i !== null)

  const days = countDedupedDays(intervals)

  return { days, status: getRiskStatus(days), windowStart, windowEnd }
}

function getPeakRollingWindow(
  trips: TripInput[],
  visaStartDate: string,
  today: Date
): RollingWindowResult {
  const start = parseDate(visaStartDate)
  const end = stripTime(today)

  let peakDays = 0
  let peakWindowStart = start
  let peakWindowEnd = end

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

function getRiskStatus(days: number): RiskStatus {
  if (days <= 120) return 'SAFE'
  if (days <= 150) return 'WARNING'
  if (days <= 180) return 'DANGER'
  return 'BREACH'
}

function getQualifyingPeriod(visaStartDate: string, today: Date): QualifyingPeriodResult {
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

// ---------------------------------------------------------------------------
// Date utilities
// ---------------------------------------------------------------------------

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function stripTime(date: Date): Date {
  // Uses UTC methods to avoid local-timezone off-by-one. Edge Functions run in UTC
  // so getUTCFullYear() and getFullYear() are equivalent here, but UTC is explicit.
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401)
  }

  try {
    // Create a Supabase client scoped to the user's JWT — RLS applies automatically
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    // Parse optional body fields; tolerate empty or malformed body
    const body = await req.json().catch(() => ({}))
    const hypotheticalTrips: Array<{
      destination: string
      departure_date: string
      return_date: string
    }> = Array.isArray(body.hypothetical_trips) ? body.hypothetical_trips : []
    const projectionDate: string | undefined =
      typeof body.projection_date === 'string' ? body.projection_date : undefined

    // Fetch real trips (RLS: user sees only their own)
    const { data: rawTrips, error: tripsError } = await supabase
      .from('trips')
      .select('id, destination, departure_date, return_date')
      .order('departure_date')

    if (tripsError) throw new Error(`trips fetch failed: ${tripsError.message}`)

    const realTrips: TripInput[] = rawTrips ?? []

    // Fetch profile for visa_start_date
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('visa_start_date')
      .single()

    if (profileError) throw new Error(`profile fetch failed: ${profileError.message}`)

    const visaStartDate: string | null = profile?.visa_start_date ?? null

    // Effective "today" — callers pass projection_date for what-if forward projections (DECISION-022)
    const today = projectionDate ? parseDate(projectionDate) : new Date()

    // Build the full trip list for rolling window (real + hypothetical)
    const hypotheticalTripInputs: TripInput[] = hypotheticalTrips.map((t, i) => ({
      id: `__hypothetical_${i}__`,
      ...t,
    }))
    const allTrips: TripInput[] = [...realTrips, ...hypotheticalTripInputs]

    // Rolling window (includes hypothetical trips if any)
    const rollingWindow = getCurrentRollingWindow(allTrips, today, visaStartDate ?? undefined)

    // Qualifying period (visa_start_date required)
    const qualifyingPeriod = visaStartDate
      ? getQualifyingPeriod(visaStartDate, today)
      : null

    // Peak window — real trips only; skipped for what-if requests to avoid O(n×d) cost
    const isWhatIf = hypotheticalTripInputs.length > 0
    const peakWindow =
      !isWhatIf && visaStartDate
        ? getPeakRollingWindow(realTrips, visaStartDate, today)
        : null

    return jsonResponse({
      rolling_window: {
        days: rollingWindow.days,
        status: rollingWindow.status,
        window_start: formatDate(rollingWindow.windowStart),
        window_end: formatDate(rollingWindow.windowEnd),
      },
      peak_rolling_window: peakWindow
        ? {
            days: peakWindow.days,
            status: peakWindow.status,
            window_start: formatDate(peakWindow.windowStart),
            window_end: formatDate(peakWindow.windowEnd),
          }
        : null,
      qualifying_period: qualifyingPeriod
        ? {
            percentage: qualifyingPeriod.percentage,
            ilr_date: formatDate(qualifyingPeriod.ilrDate),
            visa_start_date: formatDate(qualifyingPeriod.visaStartDate),
            days_elapsed: qualifyingPeriod.daysElapsed,
            total_days: qualifyingPeriod.totalDays,
          }
        : null,
      days_remaining: Math.max(0, 180 - rollingWindow.days),
    })
  } catch (err) {
    console.error('calculate-absence error:', err)
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      500
    )
  }
})
