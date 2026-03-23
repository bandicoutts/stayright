/**
 * Auth setup — runs before all E2E test suites.
 * Logs in a test user and saves session state to disk.
 *
 * Requires env vars:
 *   TEST_USER_EMAIL    — a verified Supabase user
 *   TEST_USER_PASSWORD — their password
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

setup('authenticate test user', async ({ page }) => {
  await page.goto('/login')

  // The app uses a tabbed login/signup UI on /login
  // Click Sign in tab if multiple tabs are visible
  const signInTab = page.getByRole('tab', { name: /sign in/i })
  if (await signInTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await signInTab.click()
  }

  await page.getByLabel(/email address/i).fill(process.env.TEST_USER_EMAIL!)
  await page.getByLabel(/^password$/i).fill(process.env.TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: /^sign in$/i }).click()

  // Wait for redirect to dashboard (successful auth)
  await page.waitForURL('**/dashboard', { timeout: 15_000 })

  // Persist storage state so all other tests reuse this session
  await page.context().storageState({ path: authFile })
})
