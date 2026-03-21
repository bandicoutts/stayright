'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setResending(true)
    setError(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      setError('Session expired. Please sign up again.')
      setResending(false)
      return
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setResent(true)
    }
    setResending(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8 text-center">
        {/* Icon */}
        <div className="w-14 h-14 bg-[#006948]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-[#006948]" />
        </div>

        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
          Check your email
        </h1>
        <p className="text-sm text-[#3D4A42] mb-6 leading-relaxed">
          We&apos;ve sent a verification link to your email address. Click it to
          activate your account and start tracking.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#BA1A1A]">
            {error}
          </div>
        )}

        {resent ? (
          <div className="mb-4 px-4 py-3 bg-[#006948]/8 border border-[#006948]/20 rounded-xl text-sm text-[#006948]">
            Email resent — check your inbox.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm font-medium text-[#191C1D] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 cursor-pointer mb-4"
          >
            {resending ? 'Sending…' : 'Resend verification email'}
          </button>
        )}

        <Link
          href="/login"
          className="text-sm text-[#3D4A42] hover:text-[#006948] transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-[#3D4A42]">
        Didn&apos;t receive an email? Check your spam folder.
      </p>
    </div>
  )
}
