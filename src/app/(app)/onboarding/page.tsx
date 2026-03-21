import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { skipOnboardingAction } from './actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Welcome' }

export default async function OnboardingWelcomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  // Already onboarded — don't show this again
  if (profile?.onboarding_completed) redirect('/dashboard')

  return (
    <div className="w-full max-w-md">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="h-2 w-8 rounded-full bg-[#006948]" />
        <div className="h-2 w-2 rounded-full bg-[#191C1D]/15" />
        <div className="h-2 w-2 rounded-full bg-[#191C1D]/15" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8 text-center">
        <div className="w-16 h-16 bg-[#006948]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-[#006948]" />
        </div>

        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
          Welcome to StayRight
        </h1>
        <p className="text-sm text-[#3D4A42] mb-8 leading-relaxed">
          Let&apos;s set up your profile so we can track your ILR journey
          accurately. It only takes a couple of minutes.
        </p>

        <Link
          href="/onboarding/visa"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity mb-3"
        >
          Let&apos;s go →
        </Link>

        <form action={skipOnboardingAction}>
          <button
            type="submit"
            className="text-sm text-[#3D4A42] hover:text-[#006948] transition-colors cursor-pointer"
          >
            Skip setup
          </button>
        </form>
      </div>
    </div>
  )
}
