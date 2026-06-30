import { isCrownDependency, type TripInput } from '@/lib/calculations/absenceEngine'

const DAY = 86_400_000
const WEEKS = 52

function parse(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Set of UTC-midnight timestamps the user was abroad (absence days only). */
function absenceDaySet(trips: TripInput[], todayMs: number): Set<number> {
  const set = new Set<number>()
  for (const t of trips) {
    if (isCrownDependency(t.destination)) continue
    const dep = parse(t.departure_date)
    const ret = t.return_date ? parse(t.return_date) : todayMs + DAY
    // strictly between departure and return
    for (let d = dep + DAY; d <= ret - DAY; d += DAY) set.add(d)
  }
  return set
}

interface Props {
  trips: TripInput[]
  today: Date
}

/**
 * GitHub-style heatmap of absence days across the trailing year.
 * 7 rows (days) × 52 week-columns; a cell is green if the user was abroad.
 */
export function AbsenceHeatmap({ trips, today }: Props) {
  const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  // Align the final column to the week containing today (week starts Monday).
  const endDow = (new Date(end).getUTCDay() + 6) % 7 // 0 = Monday
  const lastColStart = end - endDow * DAY
  const firstColStart = lastColStart - (WEEKS - 1) * 7 * DAY

  const absent = absenceDaySet(trips, end)

  const columns: { ts: number; absent: boolean; future: boolean }[][] = []
  const monthLabels: { col: number; label: string }[] = []
  let lastMonth = -1

  for (let c = 0; c < WEEKS; c++) {
    const colStart = firstColStart + c * 7 * DAY
    const col: { ts: number; absent: boolean; future: boolean }[] = []
    for (let r = 0; r < 7; r++) {
      const ts = colStart + r * DAY
      col.push({ ts, absent: absent.has(ts), future: ts > end })
    }
    columns.push(col)
    const month = new Date(colStart).getUTCMonth()
    if (month !== lastMonth) {
      monthLabels.push({ col: c, label: new Date(colStart).toLocaleDateString('en-GB', { month: 'short' }) })
      lastMonth = month
    }
  }

  const totalAbroad = [...absent].filter((ts) => ts <= end && ts > firstColStart - DAY).length

  return (
    <div
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] uppercase text-[var(--color-text-faint)]">
          Absence heatmap
        </h2>
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
          {totalAbroad}d abroad · 12 mo
        </span>
      </div>

      {/* Fluid: columns flex to the card width; cells stay square. No scroll. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
          gridTemplateRows: 'repeat(7, auto)',
          gridAutoFlow: 'column',
          gap: '2px',
        }}
      >
        {columns.flatMap((col, c) =>
          col.map((cell, r) => (
            <div
              key={`${c}-${r}`}
              className="aspect-square w-full rounded-[2px]"
              style={{
                background: cell.future
                  ? 'transparent'
                  : cell.absent
                    ? 'var(--color-green)'
                    : 'var(--color-surface-sunken)',
              }}
              title={new Date(cell.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + (cell.absent ? ' · abroad' : '')}
            />
          ))
        )}
      </div>
      <div className="relative h-3 mt-2">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="absolute font-[family-name:var(--font-mono)] text-[9px] text-[var(--color-text-faint)]"
            style={{ left: `${(m.col / WEEKS) * 100}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  )
}
