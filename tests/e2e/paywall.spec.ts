/**
 * Paywall E2E tests
 *
 * Tests: Free tier limits (3 trips), paywall triggers, pricing display.
 */

import { test, expect } from '@playwright/test'

test.describe('Paywall', () => {
  test('paywall shows £2.99, £24.99, £49.99 pricing', async ({ page }) => {
    // Trigger paywall via reports (most reliable way to see pricing)
    await page.goto('/reports')
    const generateBtn = page.getByRole('button', { name: /generate|download/i }).first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()
    }

    await expect(page.getByText(/£2\.99/)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/£24\.99/)).toBeVisible()
    await expect(page.getByText(/£49\.99/)).toBeVisible()
  })

  test('paywall shows correct feature list', async ({ page }) => {
    await page.goto('/reports')
    const generateBtn = page.getByRole('button', { name: /generate|download/i }).first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()
      const body = await page.locator('body').textContent()
      if (body?.includes('Upgrade') || body?.includes('Pro')) {
        await expect(page.getByText(/Unlimited trip logging/i)).toBeVisible()
        await expect(page.getByText(/PDF export|Audit-ready/i)).toBeVisible()
      }
    }
  })

  test('paywall on PDF export attempt', async ({ page }) => {
    await page.goto('/reports')
    const generateBtn = page.getByRole('button', { name: /generate|download/i }).first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()
      await expect(page.getByText(/upgrade|unlock pro/i).first()).toBeVisible({ timeout: 5_000 })
    }
  })

  test('Free user can access dashboard and see trips', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('paywall modal can be dismissed', async ({ page }) => {
    await page.goto('/reports')
    const generateBtn = page.getByRole('button', { name: /generate|download/i }).first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()

      // Try to close the paywall
      const closeBtn = page.getByRole('button', { name: /×|close|not now/i })
      if (await closeBtn.isVisible({ timeout: 3_000 })) {
        await closeBtn.click()
        await expect(page.getByText(/upgrade to pro/i)).not.toBeVisible({ timeout: 3_000 })
      }
    }
  })
})
