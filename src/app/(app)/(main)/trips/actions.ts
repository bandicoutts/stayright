'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  const { data: savedTrip, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      destination: data.destination,
      departure_date: data.departure_date,
      return_date: data.return_date ?? null,
      notes: data.notes ?? null,
    })
    .select('id, destination, departure_date, return_date, notes')
    .single()

  if (error) return { error: error.message }
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

  const { data: updatedTrip, error } = await supabase
    .from('trips')
    .update({
      destination: data.destination,
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
  return { success: true }
}

// ---------------------------------------------------------------------------
// Redirect helpers (used by plan/log/edit pages after save)
// ---------------------------------------------------------------------------

export async function redirectToTrips() {
  redirect('/trips')
}
