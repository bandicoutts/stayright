/**
 * Server-side trip field validation
 *
 * All trip write Server Actions must call validateTripFields() before any
 * DB write. This guards against:
 *  - M-1: unbounded string length (destination / notes)
 *  - M-2: unvalidated date format (Postgres accepts 'epoch', 'tomorrow', etc.)
 *
 * Security findings addressed: M-1, M-2 (pentest 2026-03-22).
 * See DECISIONS.md [DECISION-034].
 */

export const MAX_DESTINATION_LEN = 200
export const MAX_NOTES_LEN = 1000

// Strict ISO 8601 date: YYYY-MM-DD only — rejects any Postgres fuzzy format
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Validates trip input fields server-side.
 * Returns an error string if validation fails, or null if all fields are valid.
 */
export function validateTripFields(params: {
  destination: string
  departure_date: string
  return_date: string | null
  notes?: string | null
}): string | null {
  const { destination, departure_date, return_date, notes } = params

  // Destination
  if (!destination || !destination.trim()) return 'Destination is required.'
  if (destination.trim().length > MAX_DESTINATION_LEN)
    return `Destination must be ${MAX_DESTINATION_LEN} characters or fewer.`

  // Notes (optional)
  if (notes && notes.length > MAX_NOTES_LEN)
    return `Notes must be ${MAX_NOTES_LEN} characters or fewer.`

  // Date formats — must be strict YYYY-MM-DD
  if (!ISO_DATE_RE.test(departure_date))
    return 'Departure date must be in YYYY-MM-DD format.'
  if (return_date !== null && !ISO_DATE_RE.test(return_date))
    return 'Return date must be in YYYY-MM-DD format.'

  return null
}
