/**
 * Onboarding E2E tests
 *
 * Both /onboarding and /onboarding/visa redirect to /dashboard when
 * onboarding_completed = true (server-side guard). The E2E users all
 * have onboarding completed, so these tests verify the guard behaviour
 * rather than the form internals (which are covered by unit tests).
 */

import { test, expect } from '@playwright/test'

async function suppressCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

test.describe('Onboarding guards', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
  })

  test('/onboarding redirects to /dashboard when onboarding is complete', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('/onboarding/visa redirects to /dashboard when onboarding is complete', async ({ page }) => {
    await page.goto('/onboarding/visa')
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('/onboarding/trips redirects to /dashboard when onboarding is complete', async ({ page }) => {
    await page.goto('/onboarding/trips')
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
