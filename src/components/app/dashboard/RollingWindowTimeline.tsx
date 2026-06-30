'use client'

import { useEffect, useState } from 'react'
import { isCrownDependency, type RiskStatus, type TripInput } from '@/lib/calculations/absenceEngine'

// Verdict word derives from the engine's risk status (DECISION-002 thresholds:
// ≤120 SAFE / 121–150 WARNING / 151–180 DANGER / >180 BREACH). Never hard-code
// "you're safe" — it must follow the status.
const VERDICT: Record<RiskStatus, string> = {
  SAFE: "You're safe",
  WARNING: 'Getting close',
  DANGER: 'Very close',
  BREACH: 'Over the limit',
}

// Solid status colours (never gradient-filled numbers).
const TONE: Record<RiskStatus, string> = {
  SAFE: 'var(--color-green-light)',
  WARNING: 'var(--color-status-amber)',
  DANGER: 'var(--color-status-red)',
  BREACH: 'var(--color-status-red)',
}

// Soft status tint behind the verdict pill (keeps the verdict calm, not a
// second competing big number).
const TINT: Record<RiskStatus, string> = {
  SAFE: 'var(--color-safe-bg)',
  WARNING: 'var(--color-warning-bg)',
  DANGER: 'var(--color-danger-bg)',
  BREACH: 'var(--color-danger-bg)',
}

const LIMIT = 180
const WATCH_LOW = 120 // notification + watch line
const WATCH_HIGH = 150 // notification + watch line

interface Props {
  days: number
  status: RiskStatus
  windowStart: Date
  windowEnd: Date
  trips?: TripInput[]
}

// --- date helpers (UTC, no deps) ------------------------------------------
function parse(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
const DAY = 86_400_000

interface Span {
  leftPct: number
  widthPct: number
  ongoing: boolean
}

function tripSpans(trips: TripInput[], windowStart: Date, windowEnd: Date): Span[] {
  const wStart = windowStart.getTime()
  const wEnd = windowEnd.getTime()
  const total = Math.max(1, wEnd - wStart)

  return trips
    .map((t): Span | null => {
      if (isCrownDependency(t.destination)) return null
      const dep = parse(t.departure_date)
      const ongoing = !t.return_date
      const ret = ongoing ? wEnd : parse(t.return_date as string)
      // absence days are strictly between departure and return
      const absStart = dep + DAY
      const absEnd = ret - DAY
      if (absEnd < absStart) return null
      const clipStart = Math.max(absStart, wStart)
      const clipEnd = Math.min(absEnd, wEnd)
      if (clipEnd < clipStart) return null
      return {
        leftPct: ((clipStart - wStart) / total) * 100,
        widthPct: Math.max(1.2, ((clipEnd - clipStart + DAY) / total) * 100),
        ongoing,
      }
    })
    .filter((s): s is Span => s !== null)
}

function monthTicks(windowStart: Date, windowEnd: Date): { label: string; leftPct: number }[] {
  const wStart = windowStart.getTime()
  const total = Math.max(1, windowEnd.getTime() - wStart)
  const ticks: { label: string; leftPct: number }[] = []
  const cursor = new Date(Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth() + 1, 1))
  while (cursor.getTime() <= windowEnd.getTime()) {
    ticks.push({
      label: cursor.toLocaleDateString('en-GB', { month: 'short' }),
      leftPct: ((cursor.getTime() - wStart) / total) * 100,
    })
    cursor.setUTCMonth(cursor.getUTCMonth() + 3) // quarterly — ~4 labels, never collide
  }
  return ticks
}

export function RollingWindowTimeline({ days, status, windowStart, windowEnd, trips = [] }: Props) {
  const [fill, setFill] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(Math.min(days / LIMIT, 1) * 100))
    return () => cancelAnimationFrame(id)
  }, [days])

  const tone = TONE[status]
  const breached = days > LIMIT
  const spare = LIMIT - days
  const spans = tripSpans(trips, windowStart, windowEnd)
  const ticks = monthTicks(windowStart, windowEnd)

  return (
    <div
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-7 md:p-8"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
        {/* Verdict — single hero number, calm status pill, tidy supporting line */}
        <div>
          <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.14em] uppercase text-[var(--color-text-faint)]">
            Current 12-month window
          </span>

          <div className="mt-4">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold"
              style={{ background: TINT[status], color: tone }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: tone }} />
              {VERDICT[status]}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5 mt-5">
            <span
              className="font-[family-name:var(--font-mono)] font-semibold leading-none tracking-[-0.04em] text-[clamp(3.25rem,7.5vw,5rem)]"
              style={{ color: tone }}
            >
              {days}
            </span>
            <span className="text-base font-semibold text-[var(--color-text-muted)]">/ {LIMIT} days abroad</span>
          </div>

          <p className="text-sm text-[var(--color-text-muted)] mt-3">
            {breached ? (
              <><span className="font-semibold" style={{ color: tone }}>{Math.abs(spare)} days over</span> the 180-day limit</>
            ) : (
              <><span className="font-semibold text-[var(--color-text-primary)]">{spare} days</span> to spare</>
            )}
          </p>
        </div>

        {/* Track + trailing strip */}
        <div className="space-y-6">
          {/* Quota gauge — 0–180 with watch lines */}
          <div>
          <div className="flex items-baseline justify-between mb-2 font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-faint)]">
            <span className="tracking-[0.08em] uppercase">Days abroad</span>
            <span className="text-[var(--color-text-2)]"><span className="font-semibold" style={{ color: tone }}>{days}</span> / {LIMIT}</span>
          </div>
          <div
            className="relative h-4 rounded-lg overflow-hidden border border-[var(--color-border)]"
            style={{ background: 'var(--color-surface-sunken)' }}
            role="progressbar"
            aria-valuenow={days}
            aria-valuemin={0}
            aria-valuemax={LIMIT}
            aria-label="Days abroad in the current rolling window"
          >
            <div
              className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${fill}%`, background: tone }}
            />
            {/* Watch lines at 120 and 150 */}
            <div className="absolute inset-y-0 w-px" style={{ left: `${(WATCH_LOW / LIMIT) * 100}%`, background: 'var(--color-status-amber)', opacity: 0.9 }} />
            <div className="absolute inset-y-0 w-px" style={{ left: `${(WATCH_HIGH / LIMIT) * 100}%`, background: 'var(--color-status-red)', opacity: 0.9 }} />
          </div>
          <div className="flex justify-between mt-2 font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
            <span>
              <span style={{ color: 'var(--color-status-amber)' }}>{WATCH_LOW}</span>
              {' · '}
              <span style={{ color: 'var(--color-status-red)' }}>{WATCH_HIGH}</span>
              {' thresholds'}
            </span>
            <span>{LIMIT}-day limit</span>
          </div>
          </div>

          {/* Trailing 12 months — trips as a span */}
          <div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[var(--color-text-faint)] mb-2">
              Trailing 12 months
            </div>
            <div
              className="relative h-10 rounded-lg border border-[var(--color-border)] overflow-hidden"
              style={{ background: 'var(--color-surface-sunken)' }}
            >
              {spans.map((s, i) => (
                <div
                  key={i}
                  className="absolute top-2 bottom-2 rounded-[4px]"
                  style={{
                    left: `${s.leftPct}%`,
                    width: `${s.widthPct}%`,
                    background: s.ongoing ? 'var(--color-status-amber)' : 'var(--color-green)',
                  }}
                />
              ))}
              {/* Today marker (right edge) */}
              <div className="absolute -top-0.5 -bottom-0.5 right-0 border-l border-dashed" style={{ borderColor: 'var(--color-text-faint)' }} />
            </div>
            <div className="relative h-4 mt-2">
              {ticks.map((t, i) => (
                <span
                  key={i}
                  className="absolute font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)] -translate-x-1/2"
                  style={{ left: `${Math.min(96, Math.max(4, t.leftPct))}%` }}
                >
                  {t.label}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-[2px]" style={{ background: 'var(--color-green)' }} />
                Logged absence
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-[2px]" style={{ background: 'var(--color-status-amber)' }} />
                Currently abroad
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 border-l border-dashed" style={{ borderColor: 'var(--color-text-faint)' }} />
                Today
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
