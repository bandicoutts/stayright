'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Envelope } from '@/components/ui/Icons'
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
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 text-center"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Icon */}
        <div className="w-14 h-14 bg-[var(--color-green-pale)] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Envelope className="w-7 h-7 text-[var(--color-green)]" />
        </div>

        <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-2">
          Check your email
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
          We&apos;ve sent a verification link to your email address. Click it to
          activate your account and start tracking.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
            {error}
          </div>
        )}

        {resent ? (
          <div className="mb-4 px-4 py-3 bg-[var(--color-green-pale)] border border-[var(--color-green)]/20 rounded-xl text-sm text-[var(--color-green)]">
            Email resent — check your inbox.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full border border-[var(--color-border-strong)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-warm)] transition-colors disabled:opacity-50 cursor-pointer mb-4"
          >
            {resending ? 'Sending…' : 'Resend verification email'}
          </button>
        )}

        <Link
          href="/login"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
        Didn&apos;t receive an email? Check your spam folder.
      </p>
    </div>
  )
}
