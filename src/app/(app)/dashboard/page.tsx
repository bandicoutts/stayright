import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — StayRight' }

// Placeholder dashboard — full build is next.
// Redirects back to onboarding if the user hasn't completed setup.
export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#006948]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">🛡️</span>
        </div>
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
          Dashboard coming soon
        </h1>
        <p className="text-sm text-[#3D4A42]">
          Your account is set up. The full dashboard is being built next.
        </p>
      </div>
    </div>
  )
}
