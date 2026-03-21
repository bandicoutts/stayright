'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { updatePasswordAction } from '@/lib/auth/actions'

function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        required
        className="w-full bg-[#f3f4f5] rounded-xl px-4 py-3 pr-11 text-[#191c1d] placeholder-[#3d4a42]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a42]/60 hover:text-[#3d4a42]"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function ConfirmResetPage() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null)

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Shield className="w-7 h-7 text-[#006948]" strokeWidth={2} />
        <span className="font-manrope text-xl font-bold text-[#191c1d]">StayRight</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(0,33,20,0.06)] p-8">
        <h1 className="font-manrope text-xl font-bold text-[#191c1d] mb-1">
          Set new password
        </h1>
        <p className="text-[#3d4a42] text-sm mb-6">
          Choose a strong password of at least 8 characters.
        </p>

        <form action={formAction} className="space-y-3">
          <PasswordInput name="password" placeholder="New password" />
          <PasswordInput name="confirmPassword" placeholder="Confirm new password" />
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
            {isPending ? 'Updating…' : 'Set new password'}
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
