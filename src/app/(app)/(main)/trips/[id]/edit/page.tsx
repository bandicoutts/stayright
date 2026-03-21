import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripFlowClient } from '@/components/app/trips/TripFlowClient'
import type { TripInput } from '@/lib/calculations/absenceEngine'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Trip — StayRight' }

// Next.js 16: params is a Promise — must be awaited
interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTripPage({ params }: Props) {
  const { id } = await params

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

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Fetch the specific trip — must belong to this user
  const { data: trip } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date, notes')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trip) redirect('/trips')

  // All trips for live calculation (edit mode excludes the edited trip automatically in TripFlowClient)
  const { data: rawTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date')
    .eq('user_id', user.id)
    .order('departure_date', { ascending: false })

  const trips: TripInput[] = (rawTrips ?? []).map((t) => ({
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
  }))

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const isPro = subscription?.plan !== 'free' && subscription?.plan != null

  return (
    <TripFlowClient
      mode="edit"
      existingTrips={trips}
      visaStartDate={profile.visa_start_date ?? undefined}
      isPro={isPro}
      tripCount={trips.length}
      initialTrip={{
        id: trip.id,
        destination: trip.destination,
        departure_date: trip.departure_date,
        return_date: trip.return_date,
        notes: trip.notes,
      }}
    />
  )
}
