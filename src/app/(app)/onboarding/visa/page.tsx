import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisaForm } from './VisaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Visa setup' }

export default async function OnboardingVisaPage({
  searchParams,
}: {
  searchParams: Promise<{ force?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_route, visa_start_date, first_name')
    .eq('id', user.id)
    .single()

  const params = await searchParams
  if (profile?.onboarding_completed && params.force !== '1') redirect('/dashboard')

  return (
    <VisaForm
      defaultFirstName={profile?.first_name ?? ''}
      defaultRoute={profile?.visa_route ?? 'Skilled Worker'}
      defaultStartDate={profile?.visa_start_date ?? ''}
    />
  )
}
