'use client'

import { isCrownDependency } from '@/lib/calculations/absenceEngine'
import { formatDateRange } from '@/lib/utils/dateFormatters'

const DAY = 86_400_000

function parse(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export type TripClass = 'planned' | 'abroad' | 'taken'

interface TripRowLite {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
}

interface Props {
  trips: TripRowLite[]
  today: Date
  classify: (t: TripRowLite) => TripClass
  onEdit: (id: string) => void
}

const BAR_COLOR: Record<TripClass, string> = {
  planned: 'var(--color-teal)',
  abroad: 'var(--color-status-amber)',
  taken: 'var(--color-green)',
}

function extractName(raw: string): string {
  const firstSpace = raw.indexOf(' ')
  if (firstSpace === -1) return raw
  const firstWord = raw.slice(0, firstSpace)
  const isFlag = firstWord.length > 0 && !/[a-zA-Z]/.test(firstWord)
  return isFlag ? raw.slice(firstSpace + 1) : raw
}

/**
 * Gantt-style timeline of trips on a shared time axis (reskin Phase 3 — NEW view).
 * Each row is a trip; the bar spans departure→return positioned within the axis.
 */
export function TripsTimelineView({ trips, today, classify, onEdit }: Props) {
  if (trips.length === 0) return null

  const todayMs = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())

  // Axis range: earliest departure → latest of (today, latest return/ongoing), padded.
  const departures = trips.map((t) => parse(t.departure_date))
  const ends = trips.map((t) => (t.return_date ? parse(t.return_date) : todayMs))
  const minMs = Math.min(...departures)
  const maxMs = Math.max(todayMs, ...ends)
  const pad = Math.max(DAY * 14, (maxMs - minMs) * 0.04)
  const axisStart = minMs - pad
  const axisEnd = maxMs + pad
  const span = Math.max(1, axisEnd - axisStart)

  const pct = (ms: number) => ((ms - axisStart) / span) * 100

  // Year ticks across the axis
  const ticks: { label: string; leftPct: number }[] = []
  const startYear = new Date(axisStart).getUTCFullYear()
  const endYear = new Date(axisEnd).getUTCFullYear()
  for (let y = startYear; y <= endYear; y++) {
    const ms = Date.UTC(y, 0, 1)
    if (ms >= axisStart && ms <= axisEnd) ticks.push({ label: String(y), leftPct: pct(ms) })
  }

  const todayPct = pct(todayMs)

  // Sort by departure ascending for a readable cascade
  const ordered = [...trips].sort((a, b) => parse(a.departure_date) - parse(b.departure_date))

  return (
    <div className="p-4 sm:p-5">
      {/* Axis */}
      <div className="relative h-4 mb-2 ml-[140px]">
        {ticks.map((t, i) => (
          <span
            key={i}
            className="absolute font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)] -translate-x-1/2"
            style={{ left: `${t.leftPct}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {ordered.map((trip) => {
          const cls = classify(trip)
          const isCrown = isCrownDependency(trip.destination)
          const dep = parse(trip.departure_date)
          const end = trip.return_date ? parse(trip.return_date) : todayMs
          const leftPct = pct(dep)
          const widthPct = Math.max(0.8, pct(end) - leftPct)
          const color = isCrown ? 'var(--color-text-faint)' : BAR_COLOR[cls]

          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => onEdit(trip.id)}
              className="group grid grid-cols-[140px_1fr] items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-[var(--color-surface-raised)] transition-colors text-left cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{extractName(trip.destination)}</p>
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)] truncate">
                  {formatDateRange(trip.departure_date, trip.return_date)}
                </p>
              </div>
              <div className="relative h-5">
                {/* track */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[var(--color-border)]" />
                {/* today marker */}
                <div className="absolute top-0 bottom-0 border-l border-dashed" style={{ left: `${todayPct}%`, borderColor: 'var(--color-text-faint)' }} />
                {/* bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: cls === 'planned' ? 'transparent' : color,
                    border: cls === 'planned' ? `1.5px dashed ${color}` : undefined,
                  }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 ml-[140px] text-[11px] text-[var(--color-text-faint)]">
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-full" style={{ background: 'var(--color-green)' }} />Taken</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-full border-[1.5px] border-dashed" style={{ borderColor: 'var(--color-teal)' }} />Planned</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-full" style={{ background: 'var(--color-status-amber)' }} />Abroad now</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 border-l border-dashed" style={{ borderColor: 'var(--color-text-faint)' }} />Today</span>
      </div>
    </div>
  )
}
