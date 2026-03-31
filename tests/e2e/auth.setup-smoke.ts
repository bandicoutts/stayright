/**
 * Smoke-suite auth setup — runs before smoke tests only.
 * Logs in as the smoke test user (testuser@stayright.test) and saves
 * session state to tests/e2e/.auth/smoke.json.
 *
 * This is a separate user from the full-suite free/pro personas so that
 * the trip count stays low and the paywall never triggers during smoke runs.
 *
 * Requires env vars:
 *   TEST_USER_EMAIL    — testuser@stayright.test
 *   TEST_USER_PASSWORD — TestPassword123!
 */
import { test as setup } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const authFile = path.join(__dirname, '.auth/smoke.json')

setup('authenticate smoke test user', async ({ page }) => {
  await page.goto('/login')

  // /login now defaults to the Sign in tab — no tab click needed.

  const email = process.env.TEST_USER_EMAIL!
  const pass = process.env.TEST_USER_PASSWORD!
  await page.getByLabel(/email address/i).fill(email)
  await page.getByLabel(/^password$/i).fill(pass)
  await page.locator('button[type="submit"]').click()

  await page.waitForURL('**/dashboard', { timeout: 15_000 })
  await page.context().storageState({ path: authFile })
})
