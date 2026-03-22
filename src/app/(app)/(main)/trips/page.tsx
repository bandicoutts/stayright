import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TripsClient } from '@/components/app/trips/TripsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Trips — StayRight' }

export default async function TripsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profile check
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_start_date')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // All trips, most recent first
  const { data: rawTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date, notes')
    .eq('user_id', user.id)
    .order('departure_date', { ascending: false })

  const trips = (rawTrips ?? []).map((t) => ({
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
    notes: t.notes,
  }))

  // Subscription plan (default to free if no row)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const isPro = subscription?.plan !== 'free' && subscription?.plan != null

  return (
    <Suspense fallback={null}>
      <TripsClient
        trips={trips}
        visaStartDate={profile.visa_start_date ?? undefined}
        isPro={isPro}
      />
    </Suspense>
  )
}
