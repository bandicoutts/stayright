/**
 * Date formatter utility tests
 *
 * Tests formatDateRange (en-dash, cross-month, cross-year, same-day, null return)
 * and formatDate (standard ISO → GB format).
 */

import { describe, it, expect } from 'vitest'
import { formatDate, formatDateRange } from './dateFormatters'

describe('formatDateRange', () => {
  it('same month and year — en-dash, no repeated month', () => {
    // "12–19 May 2026" — en-dash (U+2013), not a hyphen
    const result = formatDateRange('2026-05-12', '2026-05-19')
    expect(result).toBe('12–19 May 2026')
    // Verify it is an en-dash, not a hyphen
    expect(result).toContain('\u2013')
    expect(result).not.toContain('-')
  })

  it('different month, same year — en-dash with both months', () => {
    expect(formatDateRange('2026-04-28', '2026-05-03')).toBe('28 Apr – 3 May 2026')
  })

  it('different year — full date on both sides', () => {
    expect(formatDateRange('2025-12-28', '2026-01-03')).toBe('28 Dec 2025 – 3 Jan 2026')
  })

  it('same day — returns "0 days"', () => {
    expect(formatDateRange('2026-05-12', '2026-05-12')).toBe('0 days')
  })

  it('null return date — returns "Currently abroad"', () => {
    expect(formatDateRange('2026-05-12', null)).toBe('Currently abroad')
  })

  it('next-day return — short trip, different days same month', () => {
    expect(formatDateRange('2026-06-01', '2026-06-02')).toBe('1–2 Jun 2026')
  })

  it('leap year boundary — cross-month Feb to Mar', () => {
    expect(formatDateRange('2024-02-27', '2024-03-03')).toBe('27 Feb – 3 Mar 2024')
  })

  it('year boundary December to January', () => {
    expect(formatDateRange('2025-12-20', '2026-01-10')).toBe('20 Dec 2025 – 10 Jan 2026')
  })
})

describe('formatDate', () => {
  it('formats a standard ISO date to GB format', () => {
    expect(formatDate('2026-05-12')).toBe('12 May 2026')
  })

  it('formats 1 Jan correctly', () => {
    expect(formatDate('2026-01-01')).toBe('1 Jan 2026')
  })

  it('formats a December date correctly', () => {
    expect(formatDate('2025-12-31')).toBe('31 Dec 2025')
  })
})
