/**
 * Server Action unit tests — trips/actions.ts
 *
 * Supabase is fully mocked — no real database calls are made.
 * Each test constructs a mock chain that resolves to the expected DB response.
 *
 * Philosophy: test the Server Action logic (auth check, quota gate, validation,
 * ownership filter) — not Supabase internals.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock next/cache and next/navigation before importing actions
// ---------------------------------------------------------------------------
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

// ---------------------------------------------------------------------------
// Mock the Supabase server client
// ---------------------------------------------------------------------------
// We define a factory so each test can configure its own mock behaviour.
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}))

// Import AFTER mocks are registered
import {
  addTripAction,
  updateTripAction,
  deleteTripAction,
  redirectToTrips,
} from './actions'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a mock user session */
function authedUser(id = 'user-1') {
  return { data: { user: { id } }, error: null }
}

/** Returns an unauthenticated session */
function notAuthed() {
  return { data: { user: null }, error: null }
}

/** Mock trip row returned by Supabase  */
const mockTrip = {
  id: 'trip-1',
  destination: 'France',
  departure_date: '2025-06-01',
  return_date: '2025-06-10',
  notes: null,
}

/** Valid trip payload */
const validTripData = {
  destination: 'France',
  departure_date: '2025-06-01',
  return_date: '2025-06-10',
  notes: null,
}

/**
 * Build a chainable Supabase query mock.
 * Each method returns `this` (chainable) until the terminal method
 * which resolves with the provided data/error.
 */
function buildQueryChain(terminal: string, result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'single', 'order', 'limit']
  methods.forEach((m) => {
    if (m === terminal) {
      chain[m] = vi.fn(() => Promise.resolve(result))
    } else {
      chain[m] = vi.fn(() => chain)
    }
  })
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// addTripAction
// ===========================================================================

describe('addTripAction', () => {
  it('returns auth error when not authenticated', async () => {
    mockGetUser.mockResolvedValue(notAuthed())
    const result = await addTripAction(validTripData)
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('validates required fields — rejects empty destination', async () => {
    mockGetUser.mockResolvedValue(authedUser())
    const result = await addTripAction({ ...validTripData, destination: '' })
    expect(result).toEqual(expect.objectContaining({ error: expect.stringContaining('Destination') }))
  })

  it('validates departure date format — rejects non-ISO string', async () => {
    mockGetUser.mockResolvedValue(authedUser())
    const result = await addTripAction({ ...validTripData, departure_date: 'epoch' })
    expect(result).toEqual(expect.objectContaining({ error: expect.stringContaining('YYYY-MM-DD') }))
  })

  it('enforces 3-trip Free tier limit server-side', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    // Mock: 3 existing trips (at the limit) + no subscription (Free user)
    const tripsQuery = buildQueryChain('eq', {
      data: [
        { id: 't1', destination: 'USA', departure_date: '2025-01-01', return_date: '2025-01-10' },
        { id: 't2', destination: 'Spain', departure_date: '2025-02-01', return_date: '2025-02-10' },
        { id: 't3', destination: 'France', departure_date: '2025-03-01', return_date: '2025-03-10' },
      ],
      error: null,
    })
    const subscriptionQuery = buildQueryChain('single', {
      data: null, // no subscription = Free
      error: null,
    })

    // from() is called twice: first for trips, then for subscriptions
    mockFrom
      .mockReturnValueOnce(tripsQuery)
      .mockReturnValueOnce(subscriptionQuery)

    const result = await addTripAction(validTripData)
    expect(result).toEqual(expect.objectContaining({ error: expect.stringContaining('Free plan') }))
  })

  it('allows a Pro user past the 3-trip quota', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    // 5 existing trips but user is Pro
    const existingTrips = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`,
      destination: 'USA',
      departure_date: `2025-0${i + 1}-01`,
      return_date: `2025-0${i + 1}-10`,
    }))

    const tripsQuery = buildQueryChain('eq', { data: existingTrips, error: null })
    const subscriptionQuery = buildQueryChain('single', {
      data: { plan: 'pro_monthly', status: 'active' },
      error: null,
    })
    const insertQuery = buildQueryChain('single', { data: mockTrip, error: null })
    // insert chain needs: from → insert → select → single
    const insertChain: Record<string, unknown> = {}
    insertChain['insert'] = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockTrip, error: null })),
      })),
    }))

    mockFrom
      .mockReturnValueOnce(tripsQuery)
      .mockReturnValueOnce(subscriptionQuery)
      .mockReturnValueOnce(insertChain)

    const result = await addTripAction(validTripData)
    expect(result).toEqual({ trip: mockTrip })
  })

  it('returns created trip on success (Free user, under quota)', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    // 0 existing trips + no subscription
    const tripsQuery = buildQueryChain('eq', { data: [], error: null })
    const subscriptionQuery = buildQueryChain('single', { data: null, error: null })
    const insertChain: Record<string, unknown> = {
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockTrip, error: null })),
        })),
      })),
    }

    mockFrom
      .mockReturnValueOnce(tripsQuery)
      .mockReturnValueOnce(subscriptionQuery)
      .mockReturnValueOnce(insertChain)

    const result = await addTripAction(validTripData)
    expect(result).toEqual({ trip: mockTrip })
  })

  it('returns typed error on Supabase insert failure', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    const tripsQuery = buildQueryChain('eq', { data: [], error: null })
    const subscriptionQuery = buildQueryChain('single', { data: null, error: null })
    const insertChain: Record<string, unknown> = {
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB insert failed' } })),
        })),
      })),
    }

    mockFrom
      .mockReturnValueOnce(tripsQuery)
      .mockReturnValueOnce(subscriptionQuery)
      .mockReturnValueOnce(insertChain)

    const result = await addTripAction(validTripData)
    expect(result).toEqual({ error: 'DB insert failed' })
  })

  it('rejects overlapping trips', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    // Existing trip overlaps with the new trip dates
    const existingTrips = [
      { id: 't1', destination: 'Spain', departure_date: '2025-05-25', return_date: '2025-06-15' },
    ]
    const tripsQuery = buildQueryChain('eq', { data: existingTrips, error: null })
    const subscriptionQuery = buildQueryChain('single', { data: null, error: null })

    mockFrom
      .mockReturnValueOnce(tripsQuery)
      .mockReturnValueOnce(subscriptionQuery)

    const result = await addTripAction(validTripData)
    expect(result).toEqual(expect.objectContaining({ error: expect.stringContaining('overlap') }))
  })
})

// ===========================================================================
// updateTripAction
// ===========================================================================

describe('updateTripAction', () => {
  it('returns auth error when not authenticated', async () => {
    mockGetUser.mockResolvedValue(notAuthed())
    const result = await updateTripAction('trip-1', validTripData)
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('validates input fields — rejects invalid date format', async () => {
    mockGetUser.mockResolvedValue(authedUser())
    const result = await updateTripAction('trip-1', {
      ...validTripData,
      departure_date: 'not-a-date',
    })
    expect(result).toEqual(expect.objectContaining({ error: expect.stringContaining('YYYY-MM-DD') }))
  })

  it('returns updated trip on success — user_id filter applied', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    // Mock trip list for overlap check (no overlap)
    const tripsQuery = buildQueryChain('eq', { data: [], error: null })
    const updateChain: Record<string, unknown> = {
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: { ...mockTrip, destination: 'Germany' }, error: null })
              ),
            })),
          })),
        })),
      })),
    }

    mockFrom
      .mockReturnValueOnce(tripsQuery)
      .mockReturnValueOnce(updateChain)

    const result = await updateTripAction('trip-1', { ...validTripData, destination: 'Germany' })
    expect(result).toEqual({ trip: expect.objectContaining({ destination: 'Germany' }) })
  })

  it('returns error when trip not found (ownership check via user_id)', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    const tripsQuery = buildQueryChain('eq', { data: [], error: null })
    // Supabase returns null data (trip doesn't belong to this user)
    const updateChain: Record<string, unknown> = {
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })),
    }

    mockFrom
      .mockReturnValueOnce(tripsQuery)
      .mockReturnValueOnce(updateChain)

    const result = await updateTripAction('other-users-trip', validTripData)
    expect(result).toEqual({ error: 'Trip not found' })
  })

  it('validates destination length', async () => {
    mockGetUser.mockResolvedValue(authedUser())
    const result = await updateTripAction('trip-1', {
      ...validTripData,
      destination: 'x'.repeat(201),
    })
    expect(result).toEqual(expect.objectContaining({ error: expect.stringContaining('200') }))
  })
})

// ===========================================================================
// deleteTripAction
// ===========================================================================

describe('deleteTripAction', () => {
  it('returns auth error when not authenticated', async () => {
    mockGetUser.mockResolvedValue(notAuthed())
    const result = await deleteTripAction('trip-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns success on deletion — user_id filter enforced', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    const deleteChain: Record<string, unknown> = {
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }
    mockFrom.mockReturnValueOnce(deleteChain)

    const result = await deleteTripAction('trip-1')
    expect(result).toEqual({ success: true })
  })

  it('returns error on Supabase delete failure', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    const deleteChain: Record<string, unknown> = {
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: { message: 'RLS violation' } })),
        })),
      })),
    }
    mockFrom.mockReturnValueOnce(deleteChain)

    const result = await deleteTripAction('trip-1')
    expect(result).toEqual({ error: 'RLS violation' })
  })

  it('does not delete across user_id boundary (user_id always in query)', async () => {
    mockGetUser.mockResolvedValue(authedUser('user-A'))

    // We verify that .eq('user_id', ...) is always called on the delete chain
    const eqMock = vi.fn(() => Promise.resolve({ error: null }))
    const firstEqMock = vi.fn(() => ({ eq: eqMock }))
    const deleteChain: Record<string, unknown> = {
      delete: vi.fn(() => ({ eq: firstEqMock })),
    }
    mockFrom.mockReturnValueOnce(deleteChain)

    await deleteTripAction('some-trip-id')

    // The first .eq() call should be .eq('id', 'some-trip-id')
    expect(firstEqMock).toHaveBeenCalledWith('id', 'some-trip-id')
    // The second .eq() call should include the user_id
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-A')
  })
})

// ===========================================================================
// updateTripAction — overlap check branch (lines 137–148)
// ===========================================================================

describe('updateTripAction — overlap branch', () => {
  it('rejects when updated dates overlap with another existing trip', async () => {
    mockGetUser.mockResolvedValue(authedUser())

    // Existing trip overlaps with the new dates (departure Jun 1 – return Jun 10)
    const existingTrips = [
      { id: 't1', destination: 'Spain', departure_date: '2025-05-25', return_date: '2025-06-15', notes: null },
    ]
    const tripsQuery = buildQueryChain('eq', { data: existingTrips, error: null })
    mockFrom.mockReturnValueOnce(tripsQuery)

    // updating a different trip (id trip-2) with dates that overlap t1
    const result = await updateTripAction('trip-2', validTripData) // departs Jun 1, inside t1
    expect(result).toEqual(expect.objectContaining({ error: expect.stringContaining('overlap') }))
  })
})

// ===========================================================================
// redirectToTrips
// ===========================================================================

describe('redirectToTrips', () => {
  it('calls redirect("/trips")', async () => {
    const { redirect } = await import('next/navigation')
    await redirectToTrips()
    expect(redirect).toHaveBeenCalledWith('/trips')
  })
})
