/**
 * Onboarding E2E tests
 *
 * The free E2E test user has onboarding_completed = true, so most of these
 * tests verify the post-onboarding redirect behaviour and that the visa form
 * is accessible and functional.
 */

import { test, expect } from '@playwright/test'

async function suppressCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
  })

  test('completed-onboarding user redirected from /onboarding to /dashboard', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('/onboarding/visa shows "Tell us about your visa" heading', async ({ page }) => {
    await page.goto('/onboarding/visa')
    await expect(
      page.getByText('Tell us about your visa')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('visa start date is required — form shows validation error if omitted', async ({ page }) => {
    await page.goto('/onboarding/visa')
    await expect(
      page.getByText('Tell us about your visa')
    ).toBeVisible({ timeout: 10_000 })

    // Clear the date field if pre-filled, then submit
    const dateInput = page.getByLabel(/visa start date/i)
    if (await dateInput.isVisible()) {
      await dateInput.fill('')
    }

    await page.getByRole('button', { name: /continue/i }).click()
    await expect(
      page.getByText(/please enter your visa start date/i)
    ).toBeVisible({ timeout: 3_000 })
  })

  test('ILR date auto-calculates from visa start date', async ({ page }) => {
    await page.goto('/onboarding/visa')
    await expect(
      page.getByText('Tell us about your visa')
    ).toBeVisible({ timeout: 10_000 })

    const dateInput = page.getByLabel(/visa start date/i)
    if (await dateInput.isVisible()) {
      await dateInput.fill('2023-01-14')
      await dateInput.blur()
      // ILR = 5 years from start = 2028
      await expect(page.getByText(/2028/)).toBeVisible({ timeout: 3_000 })
    }
  })
})
