import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripFlowClient } from '@/components/app/trips/TripFlowClient'
import { PaywallModal } from '@/components/app/trips/PaywallModal'
import type { TripInput } from '@/lib/calculations/absenceEngine'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Log a Trip — StayRight' }

export default async function TripLogPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_start_date')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: rawTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date')
    .eq('user_id', user.id)
    .order('departure_date', { ascending: false })

  const trips: TripInput[] = (rawTrips ?? []).map((t) => ({
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
  }))

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const isPro = subscription?.plan !== 'free' && subscription?.plan != null
  const tripCount = trips.length

  // Free users at limit see the paywall inline (no form)
  if (!isPro && tripCount >= 3) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D]">
            Log a trip
          </h1>
          <p className="text-sm text-[#3D4A42] mt-0.5">
            You've reached the Free tier limit of 3 trips.
          </p>
        </div>
        <PaywallModal open inline onClose={() => {}} triggerReason="log_mode_gate" />
      </div>
    )
  }

  return (
    <TripFlowClient
      mode="log"
      existingTrips={trips}
      visaStartDate={profile.visa_start_date ?? undefined}
      isPro={isPro}
      tripCount={tripCount}
    />
  )
}
