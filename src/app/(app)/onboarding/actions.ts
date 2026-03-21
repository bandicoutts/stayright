'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  const visa_route = (formData.get('visa_route') as string) ?? 'Skilled Worker'
  const visa_start_date = formData.get('visa_start_date') as string

  if (!visa_start_date) throw new Error('Visa start date is required.')

  const { error } = await supabase
    .from('profiles')
    .update({ visa_route, visa_start_date })
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
