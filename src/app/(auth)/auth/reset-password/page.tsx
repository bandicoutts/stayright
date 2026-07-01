'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/new-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/check-email')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-1">
          Reset your password
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Enter your email and we&apos;ll send you a reset link. It expires in 24
          hours.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-[var(--color-border-strong)] bg-[var(--color-surface-warm)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
