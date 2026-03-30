'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { hasOverlappingTrip } from '@/lib/calculations/absenceEngine'
import { validateTripFields } from '@/lib/tripValidation'
import { isPlanPro, FREE_TRIP_LIMIT } from '@/lib/subscriptionUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TripRow = {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
  notes: string | null
}

type TripData = {
  destination: string
  departure_date: string
  return_date: string | null
  notes?: string | null
}

// ---------------------------------------------------------------------------
// Add a new trip
// ---------------------------------------------------------------------------

export async function addTripAction(
  data: TripData
): Promise<{ trip: TripRow } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // M-1, M-2: validate field lengths and date formats server-side
  const validationError = validateTripFields({
    destination: data.destination,
    departure_date: data.departure_date,
    return_date: data.return_date ?? null,
    notes: data.notes,
  })
  if (validationError) return { error: validationError }

  // Fetch existing trips once — used for both quota check and overlap check
  const { data: existingTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date')
    .eq('user_id', user.id)

  // C-1: Enforce Free tier quota server-side — UI paywall is UX only
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  if (!isPlanPro(subscription?.plan, subscription?.status)) {
    if ((existingTrips ?? []).length >= FREE_TRIP_LIMIT) {
      return {
        error: `Free plan is limited to ${FREE_TRIP_LIMIT} trips. Upgrade to Pro to add unlimited trips.`,
      }
    }
  }

  // Overlap check
  if (
    hasOverlappingTrip(
      (existingTrips ?? []).map((t) => ({
        id: t.id,
        destination: t.destination,
        departure_date: t.departure_date,
        return_date: t.return_date,
      })),
      data.departure_date,
      data.return_date ?? null
    )
  ) {
    return { error: 'These dates overlap with an existing trip. Please check your trip history.' }
  }

  const { data: savedTrip, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      destination: data.destination.trim(),
      departure_date: data.departure_date,
      return_date: data.return_date ?? null,
      notes: data.notes ?? null,
    })
    .select('id, destination, departure_date, return_date, notes')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/trips')
  return { trip: savedTrip }
}

// ---------------------------------------------------------------------------
// Update an existing trip
// ---------------------------------------------------------------------------

export async function updateTripAction(
  id: string,
  data: TripData
): Promise<{ trip: TripRow } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // M-1, M-2: validate field lengths and date formats server-side
  const validationError = validateTripFields({
    destination: data.destination,
    departure_date: data.departure_date,
    return_date: data.return_date ?? null,
    notes: data.notes,
  })
  if (validationError) return { error: validationError }

  // Overlap check — exclude the trip being edited (id) from the comparison
  const { data: existingTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date')
    .eq('user_id', user.id)

  if (
    hasOverlappingTrip(
      (existingTrips ?? []).map((t) => ({
        id: t.id,
        destination: t.destination,
        departure_date: t.departure_date,
        return_date: t.return_date,
      })),
      data.departure_date,
      data.return_date ?? null,
      id // exclude self
    )
  ) {
    return { error: 'These dates overlap with an existing trip. Please check your trip history.' }
  }

  const { data: updatedTrip, error } = await supabase
    .from('trips')
    .update({
      destination: data.destination.trim(),
      departure_date: data.departure_date,
      return_date: data.return_date ?? null,
      notes: data.notes ?? null,
    })
    .eq('id', id)
    .eq('user_id', user.id) // safety: only update own rows
    .select('id, destination, departure_date, return_date, notes')
    .single()

  if (error) return { error: error.message }
  if (!updatedTrip) return { error: 'Trip not found' }
  revalidatePath('/dashboard')
  revalidatePath('/trips')
  return { trip: updatedTrip }
}

// ---------------------------------------------------------------------------
// Delete a trip
// ---------------------------------------------------------------------------

export async function deleteTripAction(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // safety: only delete own rows

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/trips')
  return { success: true }
}

export async function bulkDeleteTripsAction(
  ids: string[]
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (ids.length === 0) return { success: true }

  const { error } = await supabase
    .from('trips')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/trips')
  return { success: true }
}

// ---------------------------------------------------------------------------
// Redirect helpers (used by plan/log/edit pages after save)
// ---------------------------------------------------------------------------

export async function redirectToDashboard() {
  redirect('/dashboard')
}
