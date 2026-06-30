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
      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8">
        <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-2xl text-[#191C1D] mb-1">
          Reset your password
        </h1>
        <p className="text-sm text-[#3D4A42] mb-6">
          Enter your email and we&apos;ll send you a reset link. It expires in 24
          hours.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#BA1A1A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#191C1D] mb-1.5"
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
              className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] placeholder:text-[#3D4A42]/40 focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="text-sm text-[#3D4A42] hover:text-[#006948] transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
