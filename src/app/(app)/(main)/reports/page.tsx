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
    .select('onboarding_completed, first_name, last_name, visa_route, visa_start_date')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: rawTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date, notes')
    .eq('user_id', user.id)
    .order('departure_date', { ascending: true })

  // Subscription — must check both plan AND status (H-1: past_due users lose Pro access)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  const isPro = isPlanPro(subscription?.plan, subscription?.status)

  return (
    <ReportsClient
      profile={{
        firstName: profile.first_name,
        lastName: profile.last_name,
        visaRoute: profile.visa_route,
        visaStartDate: profile.visa_start_date,
      }}
      trips={(rawTrips ?? []).map((t) => ({
        id: t.id,
        destination: t.destination,
        departure_date: t.departure_date,
        return_date: t.return_date,
        notes: t.notes,
      }))}
      isPro={isPro}
    />
  )
}
