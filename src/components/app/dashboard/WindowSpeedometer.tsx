'use client'

import { useEffect, useState } from 'react'
import { isCrownDependency, type RiskStatus, type TripInput } from '@/lib/calculations/absenceEngine'

// Single status word per state (spec 2A — intentionally drops the old
// "You're safe"). Colour + word both derive from the engine's RiskStatus
// (DECISION-002 thresholds: ≤120 SAFE / 121–150 WARNING / 151–180 DANGER / >180
// BREACH) — never hard-coded.
const VERDICT: Record<RiskStatus, string> = {
  SAFE: 'Safe',
  WARNING: 'Approaching',
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
  if (days < T1) return { value: T1 - days, caption: `Until the ${T1}-day mark` }
  if (days < T2) return { value: T2 - days, caption: `Until the ${T2}-day mark` }
  if (days < LIMIT) return { value: LIMIT - days, caption: `Until the ${LIMIT}-day limit` }
  return { value: days - LIMIT, caption: 'Days over the limit' }
}

export function WindowSpeedometer({ days, status, windowStart, windowEnd, trips = [] }: Props) {
  const tone = TONE[status]
  const clamped = Math.max(0, Math.min(days, LIMIT))
  const spare = Math.max(0, LIMIT - days)
  const mark = nextMark(days)

  // Zone boundaries + needle angle (spec §4.1)
  const z1 = (T1 / LIMIT) * SWEEP
  const z2 = (T2 / LIMIT) * SWEEP
  const needleDeg = START + (clamped / LIMIT) * SWEEP

  // Sweep the needle in from the arc start on mount (respecting reduced motion).
  const [angle, setAngle] = useState(START)
  useEffect(() => {
    const id = requestAnimationFrame(() => setAngle(needleDeg))
    return () => cancelAnimationFrame(id)
  }, [needleDeg])

  const spans = tripSpans(trips, windowStart, windowEnd)
  const labels = quarterLabels(windowStart)

  const zoneDisc = `conic-gradient(from ${START}deg, ` +
    `color-mix(in srgb, var(--color-green-light) 30%, transparent) 0deg ${z1}deg, ` +
    `color-mix(in srgb, var(--color-status-amber) 32%, transparent) ${z1}deg ${z2}deg, ` +
    `color-mix(in srgb, var(--color-status-red) 36%, transparent) ${z2}deg ${SWEEP}deg, ` +
    `transparent ${SWEEP}deg 360deg)`

  const LEGEND: { tone: string; label: string }[] = [
    { tone: 'var(--color-green-light)', label: `Safe ≤ ${T1}` },
    { tone: 'var(--color-status-amber)', label: `Caution ${T1}–${T2}` },
    { tone: 'var(--color-status-red)', label: `Breach ${T2}–${LIMIT}` },
  ]

  return (
    <div
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

        {/* ── Left: gauge + readout + pill ─────────────────────────────── */}
        <div className="w-full lg:w-[250px] shrink-0 flex flex-col items-center gap-4">
          <span className="self-start font-[family-name:var(--font-mono)] text-[11px] tracking-[0.16em] uppercase text-[var(--color-text-faint)]">
            Current window
          </span>

          {/* Gauge */}
          <div
            className="relative w-[220px] h-[220px]"
            role="progressbar"
            aria-valuenow={days}
            aria-valuemin={0}
            aria-valuemax={LIMIT}
            aria-label="Days abroad in the current rolling window"
          >
            {/* Zone disc → ring (inner hole punches it out) */}
            <div className="absolute inset-0 rounded-full" style={{ background: zoneDisc }} />
            <div className="absolute inset-[22px] rounded-full" style={{ background: 'var(--color-surface)' }} />
            {/* Needle */}
            <div
              className="absolute left-1/2 top-1/2 w-[3px] h-[40%] rounded-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.4,0.5,1)] motion-reduce:transition-none"
              style={{ background: tone, transformOrigin: 'bottom center', transform: `translate(-50%,-100%) rotate(${angle}deg)` }}
            />
            {/* Hub */}
            <div className="absolute left-1/2 top-1/2 w-3.5 h-3.5 rounded-full" style={{ background: 'var(--color-text-primary)', transform: 'translate(-50%,-50%)' }} />
          </div>

          {/* Readout */}
          <div className="flex items-baseline gap-2">
            <span
              className="font-[family-name:var(--font-mono)] font-light leading-none tracking-[-0.03em] text-[clamp(3rem,9vw,3.75rem)]"
              style={{ color: tone }}
            >
              {days}
            </span>
            <span className="font-[family-name:var(--font-mono)] font-light text-[1.375rem] text-[var(--color-text-muted)]">/ {LIMIT}</span>
          </div>

          {/* Status pill */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
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

        {/* ── Right: legend + timeline + stats ─────────────────────────── */}
        <div className="w-full flex-1 flex flex-col gap-6">
          {/* Zone legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--color-text-muted)]">
            {LEGEND.map((z) => (
              <span key={z.label} className="inline-flex items-center gap-2">
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: z.tone }} />
                {z.label}
              </span>
            ))}
          </div>

          {/* Trailing 12 months */}
          <div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.14em] uppercase text-[var(--color-text-faint)] mb-2">
              Trailing 12 months
            </div>
            <div
              className="relative h-[60px] rounded-[10px] border border-[var(--color-border)] overflow-hidden"
              style={{ background: 'var(--color-surface-sunken)' }}
            >
              {spans.map((s, i) => (
                <div
                  key={i}
                  className="absolute top-2.5 bottom-2.5 rounded-[4px]"
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

          {/* Stat strip */}
          <div className="flex border-t border-[var(--color-border)] pt-5">
            <div className="flex-1">
              <p className="font-[family-name:var(--font-mono)] font-medium text-[1.625rem] leading-none text-[var(--color-text-primary)]">{spare}</p>
              <p className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.12em] uppercase text-[var(--color-text-faint)] mt-1.5">Days of headroom</p>
            </div>
            <div className="flex-1 pl-8 border-l border-[var(--color-border)]">
              <p className="font-[family-name:var(--font-mono)] font-medium text-[1.625rem] leading-none text-[var(--color-text-primary)]">{mark.value}</p>
              <p className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.12em] uppercase text-[var(--color-text-faint)] mt-1.5">{mark.caption}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
