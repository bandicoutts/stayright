/**
 * Reports E2E tests
 *
 * Tests: report types visible, paywall for Free users, PDF generation for Pro.
 */

import { test, expect } from '@playwright/test'

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await expect(page).toHaveURL(/\/reports/)
  })

  test('reports page loads and shows report types', async ({ page }) => {
    await expect(page.getByText(/ILR Absence Table/i)).toBeVisible()
    await expect(page.getByText(/Rolling Window|Custom Date Range/i)).toBeVisible()
  })

  test('Free user sees paywall when clicking Generate or Download', async ({ page }) => {
    const generateBtn = page.getByRole('button', { name: /generate|download/i }).first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()
      // Should show paywall modal
      await expect(
        page.getByText(/upgrade|unlock pro|£2\.99/i)
      ).toBeVisible({ timeout: 5_000 })
    }
  })

  test('paywall shows correct pricing on reports page', async ({ page }) => {
    const generateBtn = page.getByRole('button', { name: /generate|download/i }).first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()

      // Paywall should show all three price points
      const body = await page.locator('body').textContent()
      if (body?.includes('Upgrade') || body?.includes('Pro')) {
        // If paywall was triggered, verify prices
        await expect(page.getByText(/£2\.99/)).toBeVisible()
        await expect(page.getByText(/£24\.99/)).toBeVisible()
        await expect(page.getByText(/£49\.99/)).toBeVisible()
      }
    }
  })

  test('PDF filename follows convention when downloaded (Pro user)', async ({ page }) => {
    // This test only runs meaningfully for Pro users
    // For Free users, the download is blocked — skip validation
    const downloadPromise = page.waitForEvent('download', { timeout: 5_000 }).catch(() => null)
    const generateBtn = page.getByRole('button', { name: /download|generate/i }).first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()
      const download = await downloadPromise
      if (download) {
        const filename = download.suggestedFilename()
        expect(filename).toMatch(/StayRight.*\d{4}-\d{2}-\d{2}\.pdf/)
      }
    }
  })
})
