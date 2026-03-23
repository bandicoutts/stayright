#!/usr/bin/env node
/**
 * scripts/create-test-user.ts
 *
 * One-shot script: creates a pre-verified Supabase test user for E2E tests.
 * Also upserts a minimal profile row so the user lands on /dashboard.
 *
 * Usage:
 *   npm run test:create-user
 *
 * Reads from .env.local automatically.
 * Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local before running.
 *
 * Strategy:
 *   1. Use the admin API to check if the user already exists.
 *   2. If not, use admin.createUser — if that fails (DB trigger mismatch),
 *      fall back to signUp via anon client (which fires the correct trigger),
 *      then immediately confirm the email via admin.
 *   3. Upsert the profile row to mark onboarding complete.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'testuser@example.com'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error('❌  Missing env vars in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log(`\n🔧  Creating test user: ${TEST_EMAIL}`)

  // 1. Check if user already exists
  const { data: { users } } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 })
  const existing = users?.find((u) => u.email === TEST_EMAIL)

  let userId: string

  if (existing) {
    console.log(`ℹ️   User already exists (${existing.id}) — resetting password`)
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password: TEST_PASSWORD,
      email_confirm: true,
    })
    if (error) throw new Error(`Failed to update user: ${error.message}`)
    userId = data.user.id
  } else {
    // 2a. Try admin.createUser (works if trigger is up to date)
    const { data: adminData, error: adminError } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    })

    if (!adminError && adminData?.user) {
      userId = adminData.user.id
      console.log(`✅  Auth user created via admin: ${userId}`)
    } else {
      // 2b. Fallback: signUp via anon client (fires DB trigger), then confirm via admin
      console.log(`⚠️   Admin create failed (${adminError?.message}), falling back to signUp...`)
      const { data: signUpData, error: signUpError } = await anon.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
      if (signUpError) throw new Error(`signUp failed: ${signUpError.message}`)
      if (!signUpData.user) throw new Error('signUp returned no user')

      userId = signUpData.user.id
      console.log(`✅  Auth user created via signUp: ${userId}`)

      // Immediately confirm email so user can log in
      const { error: confirmError } = await admin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      })
      if (confirmError) {
        console.warn(`⚠️   Could not auto-confirm email: ${confirmError.message}`)
        console.warn('    Confirm manually in Supabase dashboard → Authentication → Users')
      } else {
        console.log(`✅  Email confirmed`)
      }
    }
  }

  // 3. Upsert profile to mark onboarding complete
  const { error: profileError } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        first_name: 'Test',
        last_name: 'User',
        visa_start_date: '2023-01-14',
        onboarding_completed: true,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.warn(`⚠️   Profile upsert warning: ${profileError.message}`)
    console.warn('    Try completing onboarding manually at http://localhost:3000/onboarding')
  } else {
    console.log(`✅  Profile row upserted — onboarding marked complete`)
    console.log(`    Visa start date: 2023-01-14`)
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Test user ready!

  Email:    ${TEST_EMAIL}
  Password: ${TEST_PASSWORD}

These credentials are already set in .env.local.
Run E2E tests with: npm run test:e2e
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

run().catch((err) => {
  console.error('❌  Error:', err.message)
  process.exit(1)
})
