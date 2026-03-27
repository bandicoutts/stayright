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

  return (
    <MainLayoutClient
      userId={user.id}
      userEmail={user.email}
      userInitial={initial}
      isPaymentFailed={isPaymentFailed}
    >
      {children}
    </MainLayoutClient>
  )
}
