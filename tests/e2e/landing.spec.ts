/**
 * Landing page E2E tests
 *
 * Tests: page load, pricing, cookie consent, responsive.
 * No auth required.
 */

import { test, expect } from '@playwright/test'

// Landing tests use no stored session
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so cookie banner is fresh
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/')
  })

  test('page loads with visible h1', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('shows £2.99 monthly price', async ({ page }) => {
    await expect(page.getByText('£2.99').first()).toBeVisible()
  })

  test('cookie consent banner appears on first visit', async ({ page }) => {
    await page.waitForTimeout(500)
    await expect(page.getByText(/we use cookies/i).first()).toBeVisible()
  })

  test('Accept all dismisses the cookie banner', async ({ page }) => {
    await page.waitForTimeout(500)
    const acceptBtn = page.getByRole('button', { name: /accept all/i })
    await expect(acceptBtn).toBeVisible({ timeout: 5_000 })
    await acceptBtn.click()
    await expect(page.getByText(/we use cookies/i)).not.toBeVisible({ timeout: 3_000 })
  })

  test.describe('Mobile viewport (390px)', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('page renders correctly on mobile', async ({ page }) => {
      await expect(page.locator('h1').first()).toBeVisible()
    })
  })
})
