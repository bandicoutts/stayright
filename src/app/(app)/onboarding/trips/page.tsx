import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripForm } from './TripForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add your trips' }

export default async function OnboardingTripsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_start_date')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) redirect('/dashboard')
  // Must have completed visa setup first
  if (!profile?.visa_start_date) redirect('/onboarding/visa')

  // Load any trips already saved in this session (user may have come back mid-flow)
  const { data: existingTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date')
    .eq('user_id', user.id)
    .order('departure_date', { ascending: false })

  return (
    <TripForm
      initialTrips={existingTrips ?? []}
      visaStartDate={profile.visa_start_date}
    />
  )
}
