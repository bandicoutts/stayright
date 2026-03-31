import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ShieldCheck } from '@/components/ui/Icons'
import { createClient } from '@/lib/supabase/server'
import { SignupTracker } from '@/components/app/onboarding/SignupTracker'
import { OnboardingStartedTracker } from '@/components/app/onboarding/OnboardingStartedTracker'
import { SkipButton } from '@/components/app/onboarding/SkipButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Welcome' }

export default async function OnboardingWelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ signup?: string }>
}) {
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

  // Already onboarded — don't show this again
  if (profile?.onboarding_completed) redirect('/dashboard')

  // Detect mid-flow resume: visa step already completed
  const visaStepDone = !!profile?.visa_start_date

  const params = await searchParams
  const isNewSignup = params.signup === '1'

  return (
    <div className="w-full max-w-md">
      {/* onboarding_started — fires every time this page is visited during onboarding */}
      <Suspense fallback={null}>
        <OnboardingStartedTracker />
      </Suspense>

      {/* Fire signup_completed for new users arriving from the auth callback */}
      {isNewSignup && (
        <Suspense fallback={null}>
          <SignupTracker />
        </Suspense>
      )}

      {/* Progress dots — 2 filled if visa step already done, else 1 */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="h-2 w-8 rounded-full bg-[var(--color-green)]" />
        <div className={`h-2 rounded-full ${visaStepDone ? 'w-8 bg-[var(--color-green)]' : 'w-2 bg-[#191C1D]/15'}`} />
        <div className="h-2 w-2 rounded-full bg-[#191C1D]/15" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8 text-center">
        <div className="w-16 h-16 bg-[#006948]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-[#006948]" />
        </div>

        {visaStepDone ? (
          <>
            <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[#3D4A42] mb-8 leading-relaxed">
              Your visa details are saved. One more step — add your travel history to get a complete picture.
            </p>
            <Link
              href="/onboarding/trips"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity mb-3"
            >
              Continue where you left off →
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
              Know exactly where you stand
            </h1>
            <p className="text-sm text-[#3D4A42] mb-8 leading-relaxed">
              In 2 minutes you&apos;ll have a live view of your 180-day window and
              ILR timeline — no spreadsheets required.
            </p>
            <Link
              href="/onboarding/visa"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity mb-3"
            >
              Let&apos;s go →
            </Link>
          </>
        )}

        <SkipButton />
      </div>
    </div>
  )
}
