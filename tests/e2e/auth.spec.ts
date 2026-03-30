/**
 * Auth flow E2E tests
 *
 * Tests: login, logout, protected route redirects, login page UI.
 * All tests use a fresh context (no stored session).
 */

import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

// All auth tests start with a clean slate
test.use({ storageState: { cookies: [], origins: [] } })

async function suppressCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

async function login(page: import('@playwright/test').Page) {
  await suppressCookieBanner(page)
  await page.goto('/login')
  await page.locator('button[type="button"]:has-text("Sign in")').click()
  await page.getByLabel(/email address/i).fill(process.env.TEST_FREE_USER_EMAIL!)
  await page.getByLabel(/^password$/i).fill(process.env.TEST_FREE_USER_PASSWORD!)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/dashboard', { timeout: 15_000 })
}

test.describe('Auth flows', () => {
  test('user can log in with email + password', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('logout clears session and redirects to /login', async ({ page }) => {
    await login(page)
    // The "Sign out" button lives inside the sidebar profile popover, which is
    // only rendered when the user card is toggled open.  Click the last button
    // in <aside> (the user card toggle) to open the popover, then click Sign out.
    await page.locator('aside').getByRole('button').last().click()
    await page.getByRole('button', { name: /sign out/i }).click()
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('/dashboard unauthenticated → /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('/settings unauthenticated → /login', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('/reports unauthenticated → /login', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page shows "Create account" and "Sign in" tabs', async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/login')
    await expect(
      page.locator('button[type="button"]:has-text("Create account")')
    ).toBeVisible()
    await expect(
      page.locator('button[type="button"]:has-text("Sign in")')
    ).toBeVisible()
  })

  test('login page submit button is visible', async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/login')
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('logged-in user visiting /login is redirected to /dashboard', async ({ page }) => {
    await login(page)
    await page.goto('/login')
    // Proxy redirects authenticated users away from /login
    expect(page.url()).toMatch(/\/dashboard/)
  })
})
