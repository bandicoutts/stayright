'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

// ---------------------------------------------------------------------------
// Update visa profile (name, visa route, visa start date)
// ---------------------------------------------------------------------------

export async function updateProfileAction(data: {
  first_name: string
  last_name?: string
  visa_route: string
  visa_start_date: string
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: data.first_name.trim() || '',
      last_name: data.last_name?.trim() || null,
      visa_route: data.visa_route,
      visa_start_date: data.visa_start_date,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

// ---------------------------------------------------------------------------
// Update notification preferences
// ---------------------------------------------------------------------------

export async function updateNotificationsAction(data: {
  notifications_120_day: boolean
  notifications_150_day: boolean
  notifications_return_reminder: boolean
  notifications_ilr_reminder: boolean
  notifications_monthly: boolean
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('profiles').update(data).eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

// ---------------------------------------------------------------------------
// Update email address
// Supabase sends a confirmation to the new address before the change takes effect.
// ---------------------------------------------------------------------------

export async function updateEmailAction(
  newEmail: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) return { error: error.message }
  return { success: true }
}

// ---------------------------------------------------------------------------
// Update password
// Verifies current password by attempting sign-in first, then updates.
// ---------------------------------------------------------------------------

export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'Not authenticated' }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { error: 'Current password is incorrect.' }

  // Apply new password
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

// ---------------------------------------------------------------------------
// Export user data (GDPR)
// Returns the user's profile and trips as a JSON string for download.
// ---------------------------------------------------------------------------

export async function exportDataAction(): Promise<
  { json: string } | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const [{ data: profile }, { data: trips }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name, visa_route, visa_start_date, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('trips')
      .select('destination, departure_date, return_date, notes, created_at')
      .eq('user_id', user.id)
      .order('departure_date', { ascending: true }),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile ?? {},
    trips: trips ?? [],
  }

  return { json: JSON.stringify(payload, null, 2) }
}

// ---------------------------------------------------------------------------
// Delete account
// Deletes trips + profile + subscriptions, then deletes Stripe customer
// (GDPR right to erasure), then deletes auth user via admin client.
// ON DELETE CASCADE on auth.users is the safety net for any rows that
// survive the explicit deletes.
// Note: hard delete in v1. Soft-delete with 30-day retention (per PRD §4h)
// requires a scheduled cleanup job — deferred post-launch (DECISION-026).
// ---------------------------------------------------------------------------

export async function deleteAccountAction(): Promise<
  { success: true } | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Fetch stripe_customer_id before deleting the subscription row
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  // 2. Delete user data (RLS DELETE policies allow own-row deletes)
  await supabase.from('trips').delete().eq('user_id', user.id)
  await supabase.from('subscriptions').delete().eq('user_id', user.id)
  await supabase.from('profiles').delete().eq('id', user.id)

  // 3. Delete Stripe customer — GDPR right to erasure requires removing
  //    all personal data including billing records held by Stripe.
  if (subscription?.stripe_customer_id) {
    try {
      await stripe.customers.del(subscription.stripe_customer_id)
    } catch (stripeErr) {
      // Log but don't block — customer may already be deleted in Stripe
      console.error('[delete-account] Stripe customer deletion failed:', stripeErr)
    }
  }

  // 4. Delete auth user — cascades to any remaining DB rows via ON DELETE CASCADE
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  return { success: true }
}
