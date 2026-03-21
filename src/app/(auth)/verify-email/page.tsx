'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Mail, Shield, CheckCircle } from 'lucide-react'
import { resendVerificationAction } from '@/lib/auth/actions'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleResend() {
    setError(null)
    startTransition(async () => {
      const result = await resendVerificationAction(email)
      if (result?.error) {
        setError(result.error)
      } else {
        setResent(true)
      }
    })
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Shield className="w-7 h-7 text-[#006948]" strokeWidth={2} />
        <span className="font-manrope text-xl font-bold text-[#191c1d]">StayRight</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(0,33,20,0.06)] p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-[#006948]/10 rounded-full flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#006948]" />
          </div>
        </div>

        <h1 className="font-manrope text-xl font-bold text-[#191c1d] mb-2">
          Check your inbox
        </h1>
        <p className="text-[#3d4a42] text-sm leading-relaxed mb-1">
          We&apos;ve sent a verification link to
        </p>
        {email && (
          <p className="font-medium text-[#191c1d] text-sm mb-4 break-all">{email}</p>
        )}
        <p className="text-[#3d4a42] text-sm leading-relaxed mb-6">
          Click the link in the email to verify your account and get started.
        </p>

        {resent ? (
          <div className="flex items-center justify-center gap-2 text-sm text-[#006948] bg-[#006948]/8 rounded-lg px-3 py-2 mb-4">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Email sent — check your inbox again.
          </div>
        ) : (
          <>
            {error && (
              <p className="text-xs text-[#ba1a1a] bg-[#ba1a1a]/8 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}
            {email && (
              <button
                type="button"
                onClick={handleResend}
                disabled={isPending}
                className="text-sm text-[#006948] font-medium hover:underline disabled:opacity-60 mb-4 block mx-auto"
              >
                {isPending ? 'Sending…' : "Didn't receive it? Resend email"}
              </button>
            )}
          </>
        )}

        <p className="text-xs text-[#3d4a42]/60">
          Check your spam folder if it doesn&apos;t appear within a few minutes.
        </p>
      </div>

      <p className="text-center text-sm text-[#3d4a42] mt-6">
        <Link href="/login" className="text-[#006948] font-medium hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
