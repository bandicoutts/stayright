'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/posthog'

type Tab = 'signup' | 'login'

interface Props {
  initialError?: string
  defaultTab?: Tab
}

export function LoginForm({ initialError, defaultTab = 'signup' }: Props) {
  const router = useRouter()

  const [tab, setTab] = useState<Tab>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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
    setGoogleLoading(true)
    setError(null)
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
      setGoogleLoading(false)
    }
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
        router.push('/onboarding?signup=1&method=email')
      } else {
        router.push('/auth/verify-email')
      }
    } else {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development') {
          console.error('Login Error:', error.message)
        }
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
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm border border-[var(--color-border)] p-8">

        {/* Terms — shown above Google on signup so it covers both auth methods */}
        {tab === 'signup' && (
          <p className="text-xs text-[var(--color-text-muted)] text-center mb-5">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-[var(--color-green)] hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-[var(--color-green)] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        )}

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 border border-[var(--color-border-strong)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {googleLoading ? (
            <span className="w-[18px] h-[18px] border-2 border-[var(--color-text-faint)] border-t-[var(--color-green)] rounded-full animate-spin shrink-0" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading
            ? 'Opening Google…'
            : tab === 'signup'
            ? 'Sign up with Google'
            : 'Sign in with Google'}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-muted)]">or</span>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex border-b border-[var(--color-border)] mb-6">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signup'}
            onClick={() => switchTab('signup')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'signup'
                ? 'text-[var(--color-green)] border-b-2 border-[var(--color-green)] -mb-px'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            onClick={() => switchTab('login')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'login'
                ? 'text-[var(--color-green)] border-b-2 border-[var(--color-green)] -mb-px'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Sign in
          </button>
        </div>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-1">
          {tab === 'signup' ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {tab === 'signup'
            ? 'Start tracking your UK visa absence for free.'
            : 'Enter your email and password to continue.'}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl text-sm text-[var(--color-danger-text)]">
            {error}
          </div>
        )}

        {/* Form */}
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
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)]">
                Password
              </label>
              {tab === 'login' && (
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-[var(--color-green)] hover:underline py-1 -my-1"
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
              className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 focus:border-transparent transition-shadow"
            />
          </div>

          {tab === 'signup' && (
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
                className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 focus:border-transparent transition-shadow"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer mt-2"
            style={{ background: 'var(--gradient-green)' }}
          >
            {loading
              ? tab === 'signup' ? 'Creating account…' : 'Signing in…'
              : tab === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
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
