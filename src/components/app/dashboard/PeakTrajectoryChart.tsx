import type { RollingWindowSeriesPoint } from '@/lib/calculations/absenceEngine'

const W = 300
const H = 120
const LIMIT = 180

interface Props {
  series: RollingWindowSeriesPoint[]
  peakDays: number
  peakDate?: Date | null
}

/**
 * SVG sparkline of the rolling-window day-count across the qualifying span,
 * with a dashed 180-day limit line and the peak point marked.
 */
export function PeakTrajectoryChart({ series, peakDays, peakDate }: Props) {
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const breached = peakDays > LIMIT
  const peakColor = breached ? 'var(--color-status-red)' : 'var(--color-green)'

  const enough = series.length >= 2
  const maxY = Math.max(LIMIT, peakDays) * 1.08
  const x = (i: number) => (series.length <= 1 ? 0 : (i / (series.length - 1)) * W)
  const y = (days: number) => H - (days / maxY) * H

  const linePath = enough ? series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.days).toFixed(1)}`).join(' ') : ''
  const areaPath = enough ? `${linePath} L${W},${H} L0,${H} Z` : ''
  const limitY = y(LIMIT)

  // Peak marker position
  let peakIdx = 0
  for (let i = 1; i < series.length; i++) if (series[i].days > series[peakIdx].days) peakIdx = i

  return (
    <div
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] uppercase text-[var(--color-text-faint)]">
          Rolling-window history
        </h2>
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
          highest <span className="font-semibold" style={{ color: peakColor }}>{peakDays}</span>
          {peakDate ? ` · ${fmt(peakDate)}` : ''}
        </span>
      </div>

      {enough ? (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="trajFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* 180-day limit line */}
          <line
            x1="0" y1={limitY} x2={W} y2={limitY}
            stroke="var(--color-status-red)" strokeWidth="1" strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke" opacity="0.7"
          />
          <path d={areaPath} fill="url(#trajFill)" />
          <path
            d={linePath} fill="none" stroke="var(--color-green)" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          />
          {/* peak marker */}
          <circle cx={x(peakIdx)} cy={y(series[peakIdx].days)} r="3.5" fill={peakColor} vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)] py-6 text-center">
          Log trips to see how your rolling-window count changes over time.
        </p>
      )}

      <div className="flex items-center gap-4 mt-3 text-[11px] text-[var(--color-text-faint)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full" style={{ background: 'var(--color-green)' }} />
          Rolling window
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 border-t border-dashed" style={{ borderColor: 'var(--color-status-red)' }} />
          180-day limit
        </span>
      </div>
    </div>
  )
}
