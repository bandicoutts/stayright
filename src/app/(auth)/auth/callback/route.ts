import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { welcomeEmail } from '@/lib/email/templates'

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
      // Send welcome email for new signups (not password reset or re-login).
      // We detect a new signup by checking that the account was created within
      // the last 5 minutes AND this isn't a password reset callback.
      if (next !== '/auth/new-password') {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user?.email) {
            const createdAt = new Date(user.created_at).getTime()
            const isNewUser = Date.now() - createdAt < 5 * 60 * 1000

            if (isNewUser) {
              // Fetch name from profile (may not exist yet — that's fine)
              const adminSupabase = createAdminClient()
              const { data: profile } = await adminSupabase
                .from('profiles')
                .select('first_name')
                .eq('id', user.id)
                .single()

              const tmpl = welcomeEmail({ name: profile?.first_name || null })
              await resend.emails.send({
                from: EMAIL_FROM,
                to: user.email,
                subject: tmpl.subject,
                html: tmpl.html,
                text: tmpl.text,
              })

              // Tag the redirect so SignupTracker fires signup_completed with
              // the correct method. provider is 'google' for OAuth, 'email' otherwise.
              const provider = user.app_metadata?.provider === 'google' ? 'google' : 'email'
              return NextResponse.redirect(`${origin}${next}?signup=1&method=${provider}`)
            }

            // Existing user logging in via OAuth — tag so LoginTracker fires login event
            if (user.app_metadata?.provider === 'google') {
              return NextResponse.redirect(`${origin}${next}?login=1`)
            }
          }
        } catch (emailErr) {
          // Never block login due to email failure
          console.error('[auth/callback] welcome email error:', emailErr)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code missing or exchange failed — send to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
