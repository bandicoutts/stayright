/**
 * Auth setup — runs before all E2E test suites.
 * Logs in a test user and saves session state to disk.
 *
 * Requires env vars:
 *   TEST_USER_EMAIL    — a verified Supabase user
 *   TEST_USER_PASSWORD — their password
 */
import { test as setup } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const authFile = path.join(__dirname, '.auth/user.json')

setup('authenticate test user', async ({ page }) => {
  await page.goto('/login')

  const tabBtn = page.locator('button[type="button"]:has-text("Sign in")')
  await tabBtn.click()

  const email = process.env.TEST_USER_EMAIL!
  const pass = process.env.TEST_USER_PASSWORD!
  await page.getByLabel(/email address/i).fill(email)
  await page.getByLabel(/^password$/i).fill(pass)

  // Use type="submit" to avoid ambiguity once we have switched to the Sign in tab
  await page.locator('button[type="submit"]').click()

  // Wait for redirect to dashboard (successful auth)
  await page.waitForURL('**/dashboard', { timeout: 15_000 })

  // Persist storage state so all other tests reuse this session
  await page.context().storageState({ path: authFile })
})
