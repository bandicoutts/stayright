import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/app/settings/SettingsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings — StayRight' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, visa_route, visa_start_date, onboarding_completed, notifications_120_day, notifications_150_day, notifications_return_reminder, notifications_ilr_reminder, notifications_monthly')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, current_period_end')
    .eq('user_id', user.id)
    .single()

  return (
    <SettingsClient
      profile={profile}
      subscription={subscription ?? null}
      userEmail={user.email ?? ''}
    />
  )
}
