'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/posthog'

type Tab = 'signup' | 'login'

interface Props {
  initialError?: string
}

export function LoginForm({ initialError }: Props) {
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    initialError === 'auth'
      ? 'Something went wrong with your login link. Please try again.'
      : null
  )

  function switchTab(next: Tab) {
    setTab(next)
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleGoogleAuth() {
    setLoading(true)
    setError(null)
    // Fire signup_started or login depending on which tab is active.
    // For Google we can't distinguish new vs returning until the callback,
    // so we fire based on the current tab context.
    track(tab === 'signup' ? 'signup_started' : 'login')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, browser navigates to Google — no need to setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (tab === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }
      track('signup_started')
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (data.session) {
        // Email confirmation disabled — go straight to onboarding.
        // Tag the URL so SignupTracker can fire signup_completed(method:'email').
        router.push('/onboarding?signup=1&method=email')
      } else {
        // Email confirmation required — goes through /auth/callback which tags signup=1
        router.push('/auth/verify-email')
      }
    } else {
      setLoading(true)
      const supabase = createClient()
      console.log('--- Client-side Auth Attempt ---')
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('---')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : error.message
        )
        setLoading(false)
      } else {
        track('login')
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8">
        {/* Heading */}
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-1">
          {tab === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-[#3D4A42] mb-6">
          {tab === 'signup'
            ? 'Start tracking your UK visa absence for free.'
            : 'Sign in to your StayRight account.'}
        </p>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm font-medium text-[#191C1D] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#191C1D]/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-[#3D4A42]">or</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#191C1D]/10 mb-6">
          <button
            type="button"
            onClick={() => switchTab('signup')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'signup'
                ? 'text-[#006948] border-b-2 border-[#006948] -mb-px'
                : 'text-[#3D4A42] hover:text-[#191C1D]'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'login'
                ? 'text-[#006948] border-b-2 border-[#006948] -mb-px'
                : 'text-[#3D4A42] hover:text-[#191C1D]'
            }`}
          >
            Sign in
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#BA1A1A]">
            {error}
          </div>
        )}

        {/* Form */}
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#191C1D]">
                Password
              </label>
              {tab === 'login' && (
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-[#006948] hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <input
              id="password"
              type="password"
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'At least 8 characters' : '••••••••'}
              className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] placeholder:text-[#3D4A42]/40 focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
            />
          </div>

          {tab === 'signup' && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-[#191C1D] mb-1.5"
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
                className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] placeholder:text-[#3D4A42]/40 focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading
              ? 'Please wait…'
              : tab === 'signup'
              ? 'Create account'
              : 'Sign in'}
          </button>
        </form>

        {tab === 'signup' && (
          <p className="mt-5 text-xs text-[#3D4A42] text-center">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-[#006948] hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-[#006948] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8368.859-3.0477.859-2.3441 0-4.3282-1.5832-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795Z"
        fill="#EA4335"
      />
    </svg>
  )
}
