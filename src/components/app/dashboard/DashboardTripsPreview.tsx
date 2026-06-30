import Link from 'next/link'
import {
  isCrownDependency,
  calculateTripAbsenceDays,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import { RISK_CONFIG } from '@/lib/riskConfig'
import { formatDateRange } from '@/lib/utils/dateFormatters'

interface TripRow {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
  notes: string | null
}

interface Props {
  trips: TripRow[]
}

function extractDestination(raw: string): { flag: string | null; name: string } {
  const firstSpace = raw.indexOf(' ')
  if (firstSpace === -1) return { flag: null, name: raw }
  const firstWord = raw.slice(0, firstSpace)
  const rest = raw.slice(firstSpace + 1)
  const isProbableFlag = firstWord.length > 0 && !/[a-zA-Z]/.test(firstWord)
  return isProbableFlag ? { flag: firstWord, name: rest } : { flag: null, name: raw }
}

export function DashboardTripsPreview({ trips }: Props) {
  const recent = trips.slice(0, 3)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-heading)] font-bold text-base tracking-tight text-[var(--color-text-primary)]">
          Recent trips
        </h2>
        <Link
          href="/trips"
          className="text-sm font-medium text-[var(--color-green-light)] hover:text-[var(--color-green)] transition-colors no-underline"
        >
          View all →
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-6 py-10 flex flex-col items-center text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">No trips logged yet.</p>
          <Link
            href="/trips?modal=log"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity no-underline"
            style={{ background: 'var(--gradient-green)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Log your first trip
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          {recent.map((trip, i) => {
            const { flag, name } = extractDestination(trip.destination)
            const isCrownDep = isCrownDependency(trip.destination)
            const absenceDays =
              trip.return_date && !isCrownDep
                ? calculateTripAbsenceDays({
                    destination: trip.destination,
                    departure_date: trip.departure_date,
                    return_date: trip.return_date,
                  })
                : null
            const dayStatus = absenceDays !== null ? getRiskStatus(absenceDays) : null
            const dayCfg = dayStatus ? RISK_CONFIG[dayStatus] : null

            return (
              <Link
                key={trip.id}
                href="/trips"
                className={`flex items-center gap-4 px-5 py-3.5 no-underline hover:bg-[var(--color-surface-raised)] transition-colors ${
                  i < recent.length - 1 ? 'border-b border-[var(--color-nav-border)]' : ''
                }`}
              >
                {flag && (
                  <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                    {flag}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-[family-name:var(--font-mono)]">
                    {formatDateRange(trip.departure_date, trip.return_date)}
                  </p>
                </div>
                <div className="shrink-0">
                  {trip.return_date === null ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning-text)] animate-pulse" />
                      Abroad
                    </span>
                  ) : isCrownDep ? (
                    <span className="font-[family-name:var(--font-mono)] text-[11px] px-2.5 py-1 rounded-full font-semibold bg-[var(--color-safe-bg)] text-[var(--color-safe-text)]">
                      0d
                    </span>
                  ) : dayCfg && absenceDays !== null ? (
                    <span className={`font-[family-name:var(--font-mono)] text-[11px] px-2.5 py-1 rounded-full font-semibold ${dayCfg.bg} ${dayCfg.text}`}>
                      {absenceDays}d
                    </span>
                  ) : null}
                </div>
              </Link>
            )
          })}

          {trips.length > 3 && (
            <Link
              href="/trips"
              className="flex items-center justify-center px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-green-light)] hover:bg-[var(--color-surface-raised)] transition-colors border-t border-[var(--color-nav-border)] no-underline"
            >
              View all {trips.length} trips
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
