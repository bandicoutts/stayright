/**
 * Regression tests for validateTripFields (pentest findings M-1, M-2)
 *
 * These tests encode the exact input constraints the pentest found missing.
 * If validation is ever removed or weakened, these tests will catch it.
 */

import { describe, it, expect } from 'vitest'
import { validateTripFields, MAX_DESTINATION_LEN, MAX_NOTES_LEN } from '../lib/tripValidation'

describe('validateTripFields', () => {
  const VALID_PARAMS = {
    destination: 'Paris',
    departure_date: '2025-06-01',
    return_date: '2025-06-10',
    notes: null,
  }

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('returns null for valid inputs', () => {
    expect(validateTripFields(VALID_PARAMS)).toBeNull()
  })

  it('returns null when return_date is null (currently abroad)', () => {
    expect(validateTripFields({ ...VALID_PARAMS, return_date: null })).toBeNull()
  })

  it('returns null when notes is provided within limit', () => {
    expect(validateTripFields({ ...VALID_PARAMS, notes: 'Family visit' })).toBeNull()
  })

  // ── M-1: Destination length ────────────────────────────────────────────────

  it('rejects destination exceeding MAX_DESTINATION_LEN', () => {
    const longDest = 'x'.repeat(MAX_DESTINATION_LEN + 1)
    const result = validateTripFields({ ...VALID_PARAMS, destination: longDest })
    expect(result).not.toBeNull()
    expect(result).toMatch(/200/)
  })

  it('accepts destination exactly at MAX_DESTINATION_LEN', () => {
    const borderDest = 'x'.repeat(MAX_DESTINATION_LEN)
    expect(validateTripFields({ ...VALID_PARAMS, destination: borderDest })).toBeNull()
  })

  it('rejects empty destination', () => {
    expect(validateTripFields({ ...VALID_PARAMS, destination: '' })).not.toBeNull()
  })

  it('rejects whitespace-only destination', () => {
    expect(validateTripFields({ ...VALID_PARAMS, destination: '   ' })).not.toBeNull()
  })

  // ── M-1: Notes length ─────────────────────────────────────────────────────

  it('rejects notes exceeding MAX_NOTES_LEN', () => {
    const longNotes = 'n'.repeat(MAX_NOTES_LEN + 1)
    const result = validateTripFields({ ...VALID_PARAMS, notes: longNotes })
    expect(result).not.toBeNull()
    expect(result).toMatch(/1000/)
  })

  it('accepts notes exactly at MAX_NOTES_LEN', () => {
    const borderNotes = 'n'.repeat(MAX_NOTES_LEN)
    expect(validateTripFields({ ...VALID_PARAMS, notes: borderNotes })).toBeNull()
  })

  // ── M-2: Departure date format ─────────────────────────────────────────────

  it('rejects postgres fuzzy date "epoch"', () => {
    expect(validateTripFields({ ...VALID_PARAMS, departure_date: 'epoch' })).not.toBeNull()
  })

  it('rejects postgres fuzzy date "tomorrow"', () => {
    expect(validateTripFields({ ...VALID_PARAMS, departure_date: 'tomorrow' })).not.toBeNull()
  })

  it('rejects "Jan 1 2025" format', () => {
    expect(validateTripFields({ ...VALID_PARAMS, departure_date: 'Jan 1 2025' })).not.toBeNull()
  })

  it('rejects "2025-1-1" (single-digit month/day)', () => {
    expect(validateTripFields({ ...VALID_PARAMS, departure_date: '2025-1-1' })).not.toBeNull()
  })

  it('accepts valid YYYY-MM-DD departure date', () => {
    expect(validateTripFields({ ...VALID_PARAMS, departure_date: '2025-06-01' })).toBeNull()
  })

  // ── M-2: Return date format ────────────────────────────────────────────────

  it('rejects postgres fuzzy return date "tomorrow"', () => {
    expect(validateTripFields({ ...VALID_PARAMS, return_date: 'tomorrow' })).not.toBeNull()
  })

  it('rejects "2025-6-10" return date format', () => {
    expect(validateTripFields({ ...VALID_PARAMS, return_date: '2025-6-10' })).not.toBeNull()
  })

  it('accepts null return_date without error', () => {
    expect(validateTripFields({ ...VALID_PARAMS, return_date: null })).toBeNull()
  })

  // ── Combined: M-1 check happens before M-2 ────────────────────────────────

  it('reports destination error before date error when both present', () => {
    const result = validateTripFields({
      destination: '',
      departure_date: 'epoch',
      return_date: null,
    })
    expect(result).toMatch(/Destination/)
  })
})
