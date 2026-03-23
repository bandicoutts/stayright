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

  // The form defaults to "Create account" tab. On signup tab the submit button
  // reads "Create account", so "Sign in" uniquely targets the tab switcher button.
  await page.getByRole('button', { name: 'Sign in' }).click()

  await page.getByLabel(/email address/i).fill(process.env.TEST_USER_EMAIL!)
  await page.getByLabel(/^password$/i).fill(process.env.TEST_USER_PASSWORD!)
  // Use type="submit" to avoid ambiguity — both tab and submit read "Sign in" on login tab
  await page.locator('button[type="submit"]').click()

  // Wait for redirect to dashboard (successful auth)
  await page.waitForURL('**/dashboard', { timeout: 15_000 })

  // Persist storage state so all other tests reuse this session
  await page.context().storageState({ path: authFile })
})
