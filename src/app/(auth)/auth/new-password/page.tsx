'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-1">
          Set new password
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Choose a strong password for your account.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full border border-[var(--color-border-strong)] bg-[var(--color-surface-warm)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[var(--color-border-strong)] bg-[var(--color-surface-warm)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
