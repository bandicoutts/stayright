import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisaForm } from './VisaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Visa setup' }

export default async function OnboardingVisaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_route, visa_start_date')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) redirect('/dashboard')

  return (
    <VisaForm
      defaultRoute={profile?.visa_route ?? 'Skilled Worker'}
      defaultStartDate={profile?.visa_start_date ?? ''}
    />
  )
}
