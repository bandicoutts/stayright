'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AuthActionState = { error: string } | null

function mapAuthError(message: string, status?: number): string {
  const msg = message.toLowerCase()
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please try again in 15 minutes.'
  }
  if (msg.includes('already registered') || msg.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (msg.includes('invalid login') || msg.includes('invalid credentials') || status === 400) {
    return 'Invalid email or password.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email before logging in.'
  }
  if (msg.includes('expired') || msg.includes('invalid') || msg.includes('otp')) {
    return 'This link has expired. Request a new password reset.'
  }
  return 'Something went wrong. Please try again.'
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Please fill in all fields.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  })

  if (error) return { error: mapAuthError(error.message, error.status) }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`)
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Please fill in all fields.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: mapAuthError(error.message, error.status) }

  redirect('/dashboard')
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = (formData.get('email') as string).trim()

  if (!email) return { error: 'Please enter your email address.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/reset-password/confirm`,
  })

  if (error) return { error: mapAuthError(error.message, error.status) }

  redirect(`/reset-password/check-email?email=${encodeURIComponent(email)}`)
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) return { error: 'Please fill in all fields.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (password !== confirmPassword) return { error: 'Passwords do not match.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: mapAuthError(error.message, error.status) }

  redirect('/dashboard')
}

export async function resendVerificationAction(email: string): Promise<AuthActionState> {
  if (!email) return { error: 'Email address is required.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  })

  if (error) return { error: mapAuthError(error.message, error.status) }

  return null
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
