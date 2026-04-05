/**
 * Pro-user auth setup — runs before all full-suite tests.
 * Logs in as the pro E2E test user and saves session state to disk.
 *
 * Requires env vars:
 *   TEST_PRO_USER_EMAIL    — a verified Supabase user on the pro_lifetime plan
 *   TEST_PRO_USER_PASSWORD — their password
 */
import { test as setup } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const authFile = path.join(__dirname, '.auth/pro.json')

setup('authenticate pro test user', async ({ page }) => {
  await page.goto('/login')

  // Switch to the "Sign in" tab — use getByRole('tab') to avoid matching the
  // Google OAuth button, whose label also contains "Sign in" (substring match).
  await page.getByRole('tab', { name: 'Sign in' }).click()

  const email = process.env.TEST_PRO_USER_EMAIL!
  const pass = process.env.TEST_PRO_USER_PASSWORD!
  await page.getByLabel(/email address/i).fill(email)
  await page.getByLabel(/^password$/i).fill(pass)
  await page.locator('button[type="submit"]').click()

  await page.waitForURL('**/dashboard', { timeout: 15_000 })
  await page.context().storageState({ path: authFile })
})
