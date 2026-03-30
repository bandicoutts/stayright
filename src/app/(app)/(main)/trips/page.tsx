import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPlanPro } from '@/lib/subscriptionUtils'
import { TripsTableClient } from '@/components/app/trips/TripsTableClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Trip Log — StayRight' }

export default async function TripsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rawTrips }, { data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from('trips')
      .select('id, destination, departure_date, return_date, notes')
      .eq('user_id', user.id)
      .order('departure_date', { ascending: false }),
    supabase
      .from('profiles')
      .select('onboarding_completed, visa_start_date')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const isPro = isPlanPro(subscription?.plan, subscription?.status)
  const visaStartDate = profile?.visa_start_date ?? undefined

  return (
    <div className="p-6 md:p-8">
      <TripsTableClient
        trips={rawTrips ?? []}
        visaStartDate={visaStartDate}
        isPro={isPro}
      />
    </div>
  )
}
