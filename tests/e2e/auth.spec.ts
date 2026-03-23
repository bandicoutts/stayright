/**
 * Auth flow E2E tests
 *
 * Tests: login, logout, signup, password reset, logout, protected route redirect.
 *
 * Note: /signup is not a separate route — signup and login both live at /login
 * with a tabbed UI. "Create account" tab for signup, "Sign in" tab for login.
 */

import { test, expect } from '@playwright/test'

// Auth tests don't use stored session — fresh context for each
test.use({ storageState: { cookies: [], origins: [] } })

// Helpers
async function fillLoginForm(page: import('@playwright/test').Page) {
  await page.goto('/login')
  // Click Sign in tab (in case Create account is shown first)
  const signInTab = page.getByRole('tab', { name: /sign in/i })
    .or(page.getByRole('button', { name: /sign in/i }).filter({ has: page.locator('[role="tab"]') }))
  if (await signInTab.isVisible({ timeout: 1000 }).catch(() => false)) {
    await signInTab.click()
  }
  await page.getByLabel(/email address/i).fill(process.env.TEST_USER_EMAIL!)
  await page.getByLabel(/^password$/i).fill(process.env.TEST_USER_PASSWORD!)
}

test.describe('Auth flows', () => {
  test('user can log in with email + password', async ({ page }) => {
    await fillLoginForm(page)
    await page.getByRole('button', { name: /^sign in$/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('logout clears session and redirects to /login', async ({ page }) => {
    await fillLoginForm(page)
    await page.getByRole('button', { name: /^sign in$/i }).click()
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

  test('/trips redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/trips')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
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
    await page.goto('/login')

    // Click the "Create account" tab
    const createTab = page.getByRole('tab', { name: /create account/i })
      .or(page.getByText(/create account/i).first())
    if (await createTab.isVisible({ timeout: 3_000 })) {
      await createTab.click()
    }

    await expect(page.getByLabel(/email address/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
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
    await page.getByRole('button', { name: /^sign in$/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })

    await page.goto('/login')
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
