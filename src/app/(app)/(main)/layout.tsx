import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { MainLayoutClient } from '@/components/app/MainLayoutClient'
import type { ReactNode } from 'react'

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const initial = user.email?.charAt(0).toUpperCase() ?? '?'

  // Fetch profile and subscription in parallel (PRD §4a, §4j)
  const [{ data: subscription }, { data: profile }] = await Promise.all([
    supabase.from('subscriptions').select('status, plan').eq('user_id', user.id).single(),
    supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
  ])

  const isPaymentFailed =
    subscription?.plan !== 'free' &&
    (subscription?.status === 'past_due' || subscription?.status === 'unpaid')

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
