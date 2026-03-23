'use client'

import { useEffect, useState } from 'react'
import type { RiskStatus } from '@/lib/calculations/absenceEngine'

const RADIUS = 80
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const STATUS_COLOURS: Record<RiskStatus, string> = {
  SAFE: '#006948',
  WARNING: '#D97706',
  DANGER: '#BA1A1A',
  BREACH: '#8E0009',
}

const STATUS_BG: Record<RiskStatus, string> = {
  SAFE: 'bg-[#006948]/10 text-[#006948]',
  WARNING: 'bg-amber-100 text-[#D97706]',
  DANGER: 'bg-red-100 text-[#BA1A1A]',
  BREACH: 'bg-red-200 text-[#8E0009]',
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
  const strokeColour = STATUS_COLOURS[status]
  const remaining = Math.max(0, 180 - days)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        {/* SVG ring — rotated so progress starts at 12 o'clock */}
        <svg
          viewBox="0 0 180 180"
          className="w-full h-full -rotate-90"
          role="img"
          aria-label={`${days} of 180 absence days used. Status: ${status}.`}
        >
          {/* Track */}
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="#191C1D"
            strokeOpacity="0.08"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={strokeColour}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: animated
                ? 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none',
            }}
          />
        </svg>

        {/* Centre text — absolute over the SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className="font-[family-name:var(--font-manrope)] font-extrabold text-4xl leading-none text-[#191C1D]"
            aria-hidden="true"
          >
            {days}
          </span>
          <span className="text-xs text-[#3D4A42]">/ 180 days</span>
        </div>
      </div>

      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BG[status]}`}
        aria-hidden="true"
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: strokeColour }}
          aria-hidden="true"
        />
        {status}
      </div>

      <p className="text-sm text-[#3D4A42]">
        <span className="font-semibold text-[#191C1D]">{remaining} days</span>{' '}
        remaining in current window
      </p>
    </div>
  )
}
