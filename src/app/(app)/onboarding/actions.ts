'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { hasOverlappingTrip } from '@/lib/calculations/absenceEngine'

// ─── Skip entire onboarding flow ────────────────────────────────────────────

export async function skipOnboardingAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  redirect('/dashboard')
}

// ─── Save visa profile (step 1) ─────────────────────────────────────────────

export async function saveVisaProfileAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const first_name = (formData.get('first_name') as string)?.trim()
  const visa_route = (formData.get('visa_route') as string) ?? 'Skilled Worker'
  const visa_start_date = formData.get('visa_start_date') as string

  if (!first_name) throw new Error('First name is required.')
  if (!visa_start_date) throw new Error('Visa start date is required.')

  const { error } = await supabase
    .from('profiles')
    .update({ first_name, visa_route, visa_start_date })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  redirect('/onboarding/trips')
}

// ─── Save a single trip (step 2) ────────────────────────────────────────────

export async function saveTripAction(data: {
  destination: string
  departure_date: string
  return_date: string
}): Promise<
  | { trip: { id: string; destination: string; departure_date: string; return_date: string | null } }
  | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Server-side overlap guard (client already warns, but defence in depth)
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
      data.return_date
    )
  ) {
    return { error: 'These dates overlap with an existing trip. Check the dates and try again.' }
  }

  const { data: savedTrip, error } = await supabase
    .from('trips')
    .insert({ user_id: user.id, ...data })
    .select('id, destination, departure_date, return_date')
    .single()

  if (error) return { error: error.message }
  return { trip: savedTrip }
}

// ─── Delete a trip ───────────────────────────────────────────────────────────

export async function deleteTripAction(
  tripId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', user.id) // safety: only delete own rows

  if (error) return { error: error.message }
  return { success: true }
}

// ─── Complete onboarding ─────────────────────────────────────────────────────

export async function completeOnboardingAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  redirect('/dashboard')
}
