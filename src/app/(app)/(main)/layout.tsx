import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MainLayoutClient } from '@/components/app/MainLayoutClient'
import type { ReactNode } from 'react'

export default async function MainLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const initial = user.email?.charAt(0).toUpperCase() ?? '?'

  // Show payment failure banner if subscription is past_due or unpaid (PRD §4j)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .single()

  const isPaymentFailed =
    subscription?.plan !== 'free' &&
    (subscription?.status === 'past_due' || subscription?.status === 'unpaid')

  // Fetch user profile for name (PRD §4a)
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  const userName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Account'

  return (
    <MainLayoutClient
      userId={user.id}
      userEmail={user.email}
      userInitial={initial}
      userName={userName}
      subscriptionPlan={subscription?.plan ?? null}
      subscriptionStatus={subscription?.status ?? null}
      isPaymentFailed={isPaymentFailed}
    >
      {children}
    </MainLayoutClient>
  )
}
