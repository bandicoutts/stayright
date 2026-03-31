'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { hasOverlappingTrip } from '@/lib/calculations/absenceEngine'
import { validateTripFields } from '@/lib/tripValidation'
import { isPlanPro, FREE_TRIP_LIMIT } from '@/lib/subscriptionUtils'

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
  | { error: string; quota?: true }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // M-1, M-2: validate field lengths and date formats server-side
  const validationError = validateTripFields({
    destination: data.destination,
    departure_date: data.departure_date,
    return_date: data.return_date,
  })
  if (validationError) return { error: validationError }

  // Fetch existing trips once — used for quota check and overlap check
  const { data: existingTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date')
    .eq('user_id', user.id)

  // C-2: Enforce Free tier quota during onboarding — same gate as main addTripAction
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  if (!isPlanPro(subscription?.plan, subscription?.status)) {
    if ((existingTrips ?? []).length >= FREE_TRIP_LIMIT) {
      return {
        error: `You've added ${FREE_TRIP_LIMIT} trips — great start! You can add unlimited trips with Pro.`,
        quota: true,
      }
    }
  }

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

  redirect('/dashboard?onboarded=1')
}
