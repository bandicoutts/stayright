/**
 * Formats an ISO date string (YYYY-MM-DD) as "1 Jan 2025".
 * Parses as UTC to avoid timezone shifts from local midnight.
 */
export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Formats a departure + return date pair (ISO strings) as a human-readable range.
 *
 * Examples:
 *   "1–5 Jan 2025"           — same month and year
 *   "28 Jan – 2 Feb 2025"    — same year, different month
 *   "28 Dec 2024 – 2 Jan 2025" — different year
 *   "Currently abroad"       — null return date
 */
export function formatDateRange(dep: string, ret: string | null): string {
  if (!ret) return 'Currently abroad'
  if (dep === ret) return '0 days'

  const d = new Date(dep + 'T00:00:00Z')
  const r = new Date(ret + 'T00:00:00Z')

  const depDay = d.getUTCDate()
  const retDay = r.getUTCDate()
  const depMonth = d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
  const retMonth = r.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
  const depYear = d.getUTCFullYear()
  const retYear = r.getUTCFullYear()

  if (depYear === retYear && depMonth === retMonth) {
    return `${depDay}–${retDay} ${retMonth} ${retYear}`
  }
  if (depYear === retYear) {
    return `${depDay} ${depMonth} – ${retDay} ${retMonth} ${retYear}`
  }
  return `${depDay} ${depMonth} ${depYear} – ${retDay} ${retMonth} ${retYear}`
}
