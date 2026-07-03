'use client'

import { useEffect, useState } from 'react'
import { isCrownDependency, type RiskStatus, type TripInput } from '@/lib/calculations/absenceEngine'

// Single status word per state (spec 2A — intentionally drops the old
// "You're safe"). Colour + word both derive from the engine's RiskStatus
// (DECISION-002 thresholds: ≤120 SAFE / 121–150 WARNING / 151–180 DANGER / >180
// BREACH) — never hard-coded.
const VERDICT: Record<RiskStatus, string> = {
  SAFE: 'Safe',
  WARNING: 'Watch',
  DANGER: 'Close to limit',
  BREACH: 'Over limit',
}

// Solid status colours (themed; never gradient-filled numbers).
const TONE: Record<RiskStatus, string> = {
  SAFE: 'var(--color-green-light)',
  WARNING: 'var(--color-status-amber)',
  DANGER: 'var(--color-status-red)',
  BREACH: 'var(--color-status-red)',
}

const LIMIT = 180
const T1 = 120 // caution boundary (watch line + notification)
const T2 = 150 // breach boundary (watch line + notification)
const SWEEP = 270 // gauge arc degrees (open 90° at the bottom)
const START = 225 // arc start angle (lower-left), clockwise from 12 o'clock

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

// Map each trip's *absence days* onto the trailing-window track (clipped to it).
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

// Four evenly-spaced quarter labels across the trailing window (laid out with
// justify-between), e.g. "Jul · Oct · Jan · Apr".
function quarterLabels(windowStart: Date): string[] {
  const labels: string[] = []
  for (let i = 0; i < 4; i++) {
    const d = new Date(Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth() + i * 3, 1))
    labels.push(d.toLocaleDateString('en-GB', { month: 'short' }))
  }
  return labels
}

// The second stat tracks the *next* meaningful threshold, so it stays truthful
// past the 120-day mark (the spec's fixed "until 120" would read 0 at 140 days).
function nextMark(days: number): { value: number; caption: string } {
  if (days < T1) return { value: T1 - days, caption: `To the ${T1}-day watch point` }
  if (days < T2) return { value: T2 - days, caption: `To the ${T2}-day warning point` }
  if (days < LIMIT) return { value: LIMIT - days, caption: `To the ${LIMIT}-day limit` }
  return { value: days - LIMIT, caption: 'Days over the limit' }
}

export function WindowSpeedometer({ days, status, windowStart, windowEnd, trips = [] }: Props) {
  const tone = TONE[status]
  const clamped = Math.max(0, Math.min(days, LIMIT))
  const spare = Math.max(0, LIMIT - days)
  const mark = nextMark(days)

  // Needle angle (spec §4.1). The zone ring is fixed geometry (120/150/180 →
  // 180deg/225deg) and lives in the `.gauge-dial` CSS class (globals.css), so
  // the production JS minifier can't mangle the gradient string (DECISION-091).
  const needleDeg = START + (clamped / LIMIT) * SWEEP

  // Sweep the needle in from the arc start on mount (respecting reduced motion).
  const [angle, setAngle] = useState(START)
  useEffect(() => {
    const id = requestAnimationFrame(() => setAngle(needleDeg))
    return () => cancelAnimationFrame(id)
  }, [needleDeg])

  const spans = tripSpans(trips, windowStart, windowEnd)
  const labels = quarterLabels(windowStart)

  const LEGEND: { tone: string; label: string }[] = [
    { tone: 'var(--color-green-light)', label: `Safe up to ${T1}` },
    { tone: 'var(--color-status-amber)', label: `Watch ${T1}-${T2}` },
    { tone: 'var(--color-status-red)', label: `Limit ${T2}-${LIMIT}` },
  ]

  return (
    <div
      className="@container bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 md:p-7"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <span className="block font-[family-name:var(--font-mono)] text-[11px] tracking-[0.16em] uppercase text-[var(--color-text-faint)] mb-5">
        Current window
      </span>

      {/* Adapts to the CARD width (not the viewport): wide card → three columns
          (dashboard); narrow card → stacked gauge · legend · timeline · stats
          (marketing hero). */}
      <div className="flex flex-col @min-[720px]:flex-row @min-[720px]:items-center gap-7 @min-[720px]:gap-10">

        {/* ── Gauge + readout + pill ───────────────────────────────────── */}
        <div className="shrink-0 self-center @min-[720px]:self-auto flex flex-col items-center gap-3">
          <div
            className="relative w-[176px] h-[176px]"
            role="progressbar"
            aria-valuenow={days}
            aria-valuemin={0}
            aria-valuemax={LIMIT}
            aria-label="Days abroad in the current rolling window"
          >
            {/* Zone disc → ring (inner hole punches it out). Gradient is the
                static `.gauge-dial` class so it survives production minifying. */}
            <div className="gauge-dial absolute inset-0 rounded-full" />
            <div className="absolute inset-[18px] rounded-full" style={{ background: 'var(--color-surface)' }} />
            {/* Needle */}
            <div
              className="absolute left-1/2 top-1/2 w-[3px] h-[38%] rounded-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.4,0.5,1)] motion-reduce:transition-none"
              style={{ background: tone, transformOrigin: 'bottom center', transform: `translate(-50%,-100%) rotate(${angle}deg)` }}
            />
            {/* Hub */}
            <div className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full" style={{ background: 'var(--color-text-primary)', transform: 'translate(-50%,-50%)' }} />
          </div>

          {/* Readout */}
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-[family-name:var(--font-mono)] font-light leading-none tracking-[-0.03em] text-[2.75rem]"
              style={{ color: tone }}
            >
              {days}
            </span>
            <span className="font-[family-name:var(--font-mono)] font-light text-[1.125rem] text-[var(--color-text-muted)]">/ {LIMIT}</span>
          </div>

          {/* Status pill */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold"
            style={{
              color: tone,
              background: `color-mix(in srgb, ${tone} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${tone} 30%, transparent)`,
            }}
          >
            <span className="w-[7px] h-[7px] rounded-full" style={{ background: tone }} />
            {VERDICT[status]}
          </span>
        </div>

        {/* ── Legend + trailing timeline ───────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3.5">
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
            {LEGEND.map((z) => (
              <span key={z.label} className="inline-flex items-center gap-2">
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: z.tone }} />
                {z.label}
              </span>
            ))}
          </div>

          <div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.14em] uppercase text-[var(--color-text-faint)] mb-2">
              Trailing 12 months
            </div>
            <div
              className="relative h-[52px] rounded-[10px] border border-[var(--color-border)] overflow-hidden"
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
              <div className="absolute top-0 bottom-0 right-0 border-l border-dashed" style={{ borderColor: 'var(--color-text-faint)' }} />
            </div>
            <div className="flex justify-between mt-2 font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
              {labels.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats — beside the timeline on a wide card, below it (side by
               side) when the card is narrow ─────────────────────────────── */}
        <div className="shrink-0 flex flex-row @min-[720px]:flex-col gap-6 @min-[720px]:gap-5 @min-[720px]:w-[220px] @min-[720px]:border-l @min-[720px]:border-[var(--color-border)] @min-[720px]:pl-8">
          <div>
            <p className="font-[family-name:var(--font-mono)] font-medium text-[1.5rem] leading-none text-[var(--color-text-primary)]">{spare}</p>
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.12em] uppercase text-[var(--color-text-faint)] mt-1.5">Days left</p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-mono)] font-medium text-[1.5rem] leading-none text-[var(--color-text-primary)]">{mark.value}</p>
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.12em] uppercase text-[var(--color-text-faint)] mt-1.5">{mark.caption}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
