'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { signInAction, signUpAction } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'

type Tab = 'login' | 'signup'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

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

function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, null)

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="email"
        name="email"
        placeholder="Email address"
        required
        autoComplete="email"
        className="w-full bg-[#f3f4f5] rounded-xl px-4 py-3 text-[#191c1d] placeholder-[#3d4a42]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30"
      />
      <PasswordInput name="password" placeholder="Password" />
      <div className="flex justify-end">
        <Link href="/reset-password" className="text-xs text-[#006948] font-medium hover:underline">
          Forgot password?
        </Link>
      </div>
      {state?.error && (
        <p className="text-xs text-[#ba1a1a] bg-[#ba1a1a]/8 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-[#006948] to-[#00855d] text-white font-semibold rounded-full py-3 text-sm mt-1 disabled:opacity-60"
      >
        {isPending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}

function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, null)

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="email"
        name="email"
        placeholder="Email address"
        required
        autoComplete="email"
        className="w-full bg-[#f3f4f5] rounded-xl px-4 py-3 text-[#191c1d] placeholder-[#3d4a42]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30"
      />
      <PasswordInput name="password" placeholder="Password (min. 8 characters)" />
      {state?.error && (
        <p className="text-xs text-[#ba1a1a] bg-[#ba1a1a]/8 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-[#006948] to-[#00855d] text-white font-semibold rounded-full py-3 text-sm mt-1 disabled:opacity-60"
      >
        {isPending ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-xs text-[#3d4a42]/70 text-center leading-relaxed">
        By creating an account you agree to our{' '}
        <Link href="/terms" className="text-[#006948] hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-[#006948] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}

export function LoginTabs({ defaultTab }: { defaultTab: Tab }) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    setGoogleError(null)
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) setGoogleError('Something went wrong. Please try again.')
    } catch {
      setGoogleError('Something went wrong. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Shield className="w-7 h-7 text-[#006948]" strokeWidth={2} />
        <span className="font-manrope text-xl font-bold text-[#191c1d]">StayRight</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(0,33,20,0.06)] p-8">
        {/* Tab switcher */}
        <div className="flex bg-[#f3f4f5] rounded-full p-1 mb-6">
          {(['login', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#191c1d] shadow-[0px_2px_8px_rgba(0,33,20,0.08)]'
                  : 'text-[#3d4a42]'
              }`}
            >
              {tab === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#191c1d]/15 rounded-xl py-3 px-4 text-sm font-medium text-[#191c1d] hover:bg-[#f3f4f5] transition-colors disabled:opacity-60 mb-4"
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {googleError && (
          <p className="text-xs text-[#ba1a1a] bg-[#ba1a1a]/8 rounded-lg px-3 py-2 mb-4">
            {googleError}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#191c1d]/10" />
          <span className="text-xs text-[#3d4a42]/60">or</span>
          <div className="flex-1 h-px bg-[#191c1d]/10" />
        </div>

        {/* Form */}
        {activeTab === 'login' ? <SignInForm /> : <SignUpForm />}
      </div>

      {/* Footer switch */}
      <p className="text-center text-sm text-[#3d4a42] mt-6">
        {activeTab === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className="text-[#006948] font-medium hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="text-[#006948] font-medium hover:underline"
            >
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  )
}
