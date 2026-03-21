'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { requestPasswordResetAction } from '@/lib/auth/actions'

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, null)

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Shield className="w-7 h-7 text-[#006948]" strokeWidth={2} />
        <span className="font-manrope text-xl font-bold text-[#191c1d]">StayRight</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(0,33,20,0.06)] p-8">
        <h1 className="font-manrope text-xl font-bold text-[#191c1d] mb-1">
          Reset your password
        </h1>
        <p className="text-[#3d4a42] text-sm mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form action={formAction} className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            autoComplete="email"
            className="w-full bg-[#f3f4f5] rounded-xl px-4 py-3 text-[#191c1d] placeholder-[#3d4a42]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30"
          />
          {state?.error && (
            <p className="text-xs text-[#ba1a1a] bg-[#ba1a1a]/8 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#006948] to-[#00855d] text-white font-semibold rounded-full py-3 text-sm disabled:opacity-60"
          >
            {isPending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#3d4a42] mt-6">
        <Link href="/login" className="text-[#006948] font-medium hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  )
}
