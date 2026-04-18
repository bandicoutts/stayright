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
  const [{ data: subscription }, { count: tripCount }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('trips')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const isPro = isPlanPro(subscription?.plan, subscription?.status)

  return (
    <ReportsClient
      hasTrips={(tripCount ?? 0) > 0}
      isPro={isPro}
    />
  )
}
