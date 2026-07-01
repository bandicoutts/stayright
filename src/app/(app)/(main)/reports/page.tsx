import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from '@/components/app/reports/ReportsClient'
import { isPlanPro } from '@/lib/subscriptionUtils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reports — StayRight' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Subscription — must check both plan AND status (H-1: past_due users lose Pro access)
  const [{ data: subscription }, { data: profileData }, { data: rawTrips }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('first_name, last_name, visa_route, visa_start_date')
      .eq('id', user.id)
      .single(),
    supabase
      .from('trips')
      .select('id, destination, departure_date, return_date, notes')
      .eq('user_id', user.id)
      .order('departure_date', { ascending: true }),
  ])

  const isPro = isPlanPro(subscription?.plan, subscription?.status)
  const trips = rawTrips ?? []

  return (
    <ReportsClient
      hasTrips={trips.length > 0}
      isPro={isPro}
      trips={trips}
      profile={{
        firstName: profileData?.first_name ?? '',
        lastName: profileData?.last_name ?? null,
        visaRoute: profileData?.visa_route ?? 'Skilled Worker',
        visaStartDate: profileData?.visa_start_date ?? null,
      }}
    />
  )
}
