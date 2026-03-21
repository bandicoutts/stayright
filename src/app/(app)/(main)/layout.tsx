import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/app/Sidebar'
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
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar userEmail={user.email} userInitial={initial} />
      <div className="flex-1 min-w-0">
        {isPaymentFailed && (
          <div className="bg-[#BA1A1A] text-white text-sm font-medium px-4 py-2.5 text-center">
            Your payment failed. Please{' '}
            <a href="/settings" className="underline font-semibold">
              update your payment method
            </a>{' '}
            to keep Pro features.
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
