import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Handles the Supabase auth code exchange for:
//   - Email verification (signup)
//   - Google OAuth callback
//   - Password reset link
//
// The `next` search param controls where to redirect after a successful exchange.
// Defaults to /dashboard if not provided.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code missing or exchange failed — send to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
