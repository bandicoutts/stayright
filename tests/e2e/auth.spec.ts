/**
 * Auth flow E2E tests
 *
 * Tests: login, logout, signup, password reset, logout, protected route redirect.
 *
 * Note: /signup is not a separate route — signup and login both live at /login
 * with a tabbed UI. "Create account" tab for signup, "Sign in" tab for login.
 */

import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

// Auth tests don't use stored session — fresh context for each
test.use({ storageState: { cookies: [], origins: [] } })

// Suppress the cookie consent banner so it never intercepts clicks in auth tests
async function suppressCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

// Helpers
async function fillLoginForm(page: import('@playwright/test').Page) {
  await suppressCookieBanner(page)
  await page.goto('/login')
  // Switch to "Sign in" tab. We use [type="button"] to distinguish the tab switcher 
  // from the [type="submit"] button which also says "Sign in".
  await page.locator('button[type="button"]:has-text("Sign in")').click()
  await page.getByLabel(/email address/i).fill(process.env.TEST_USER_EMAIL!)
  await page.getByLabel(/^password$/i).fill(process.env.TEST_USER_PASSWORD!)
}

test.describe('Auth flows', () => {
  test('user can log in with email + password', async ({ page }) => {
    await fillLoginForm(page)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('logout clears session and redirects to /login', async ({ page }) => {
    await fillLoginForm(page)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })

    // Find and click logout
    const logoutBtn = page.getByRole('button', { name: /log out|sign out/i })
      .or(page.getByRole('link', { name: /log out|sign out/i }))
    await logoutBtn.click()

    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('visiting protected route when logged out redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('/trips redirects to /dashboard when authenticated', async ({ page }) => {
    await fillLoginForm(page)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })

    await page.goto('/trips')
    // Should follow legacy redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('/reports redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('/settings redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('signup form is on /login — Create account tab', async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/login')
    // Default tab is "Create account" — no click needed
    await expect(page.getByLabel(/email address/i)).toBeVisible()
    // Use type="submit" to avoid strict-mode violation (tab button also reads "Create account")
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('user can request password reset — form accessible', async ({ page }) => {
    await page.goto('/auth/reset-password')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /reset|send/i })).toBeVisible()

    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
    await page.getByRole('button', { name: /reset|send/i }).click()

    await expect(page.getByText(/check your email|email sent|reset link/i)).toBeVisible({ timeout: 10_000 })
  })

  test('logged-in user visiting /login is redirected to /dashboard', async ({ page }) => {
    await fillLoginForm(page)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })

    // Proxy redirects logged-in users from /login → /dashboard (307).
    // page.goto follows the redirect chain and resolves once the final page loads.
    // Checking page.url() after goto is the correct way — no extra waitForURL needed.
    await page.goto('/login')
    expect(page.url()).toMatch(/\/dashboard/)
  })
})
