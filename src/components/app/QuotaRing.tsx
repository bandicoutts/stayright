'use client'

import { useEffect, useState } from 'react'
import type { RiskStatus } from '@/lib/calculations/absenceEngine'

const RADIUS = 68
const STROKE = 12
const SIZE = (RADIUS + STROKE) * 2
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const GRADIENTS: Record<RiskStatus, { start: string; end: string }> = {
  SAFE: { start: 'var(--color-green)', end: 'var(--color-green-light)' },
  WARNING: { start: 'var(--color-status-amber)', end: '#D97706' },
  DANGER: { start: '#8E0009', end: 'var(--color-status-red)' },
  BREACH: { start: '#680005', end: '#8E0009' },
}


interface Props {
  days: number
  status: RiskStatus
}

export function QuotaRing({ days, status }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Defer to next frame so the transition actually plays
    const id = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const fill = Math.min(days / 180, 1)
  const targetOffset = CIRCUMFERENCE * (1 - fill)
  const dashOffset = animated ? targetOffset : CIRCUMFERENCE
  const gradient = GRADIENTS[status]
  const remaining = Math.max(0, 180 - days)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${days} of 180 absence days used. Status: ${status}.`}
        >
          <defs>
            <linearGradient id={`ringGrad-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient.start} />
              <stop offset="100%" stopColor={gradient.end} />
            </linearGradient>
          </defs>
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth={STROKE} />
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS} fill="none"
            stroke={`url(#ringGrad-${status})`} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            className="transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="font-[family-name:var(--font-manrope)] font-bold text-[3rem] leading-none tracking-[-0.04em] text-[var(--color-text-primary)]" aria-hidden="true">
            {days}
          </span>
          <span className="font-[family-name:var(--font-inter)] text-xs font-medium text-[var(--color-text-muted)] mt-1">
            / 180 days
          </span>
        </div>
      </div>
      <p className="text-sm font-[family-name:var(--font-inter)] text-[var(--color-text-muted)] text-center">
        <span className="font-semibold text-[var(--color-text-primary)]">{remaining} days</span> remaining in your current window
      </p>
    </div>
  )
}
