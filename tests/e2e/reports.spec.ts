/**
 * Reports E2E tests
 *
 * Free-user tests verify the paywall is shown correctly.
 * Pro-user tests verify PDF download is available.
 *
 * Reskin Phase 4: Reports is an "ILR evidence pack" — a period selector + A4
 * live preview. The export still streams a PDF from /api/reports/pdf.
 */

import { test, expect } from '@playwright/test'
import path from 'path'

async function suppressCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

// ---------------------------------------------------------------------------
// Free user
// ---------------------------------------------------------------------------

test.describe('Reports — Free user', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/reports')
    await expect(page).toHaveURL(/\/reports/)
  })

  test('reports page loads with "ILR evidence pack" heading', async ({ page }) => {
    await expect(
      page.getByText('ILR evidence pack')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('period presets and live preview are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Full qualifying period' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Last 12 months' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Custom range' })).toBeVisible()
    await expect(page.getByText(/Live preview/i)).toBeVisible()
  })

  test('free user sees "Upgrade to export" button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Upgrade to export' }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('"Upgrade to export" click shows PaywallModal', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Upgrade to export' }).first()
    await expect(btn).toBeVisible({ timeout: 10_000 })
    await btn.click()
    await expect(
      page.getByText(/Unlock StayRight Pro/i)
    ).toBeVisible({ timeout: 5_000 })
  })
})

// ---------------------------------------------------------------------------
// Pro user
// ---------------------------------------------------------------------------

test.describe('Reports — Pro user', () => {
  // Override storage state to use pro session for this describe block
  test.use({ storageState: path.join(__dirname, '.auth/pro.json') })

  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/reports')
    await expect(page).toHaveURL(/\/reports/)
  })

  test('pro user sees "Export PDF" button (not "Upgrade to export")', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Export PDF' }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('clicking "Export PDF" starts a file download', async ({ page }) => {
    // PDF generation is server-side (/api/reports/pdf) — Content-Disposition: attachment
    // means the browser treats the response as a download and CDP fires downloadWillBegin.
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 })
    const btn = page.getByRole('button', { name: 'Export PDF' }).first()
    await expect(btn).toBeVisible({ timeout: 10_000 })
    await btn.click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  })

  test('custom range: end before start shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Custom range' }).click()

    const fromInput = page.getByLabel('From')
    const toInput = page.getByLabel('To')
    await expect(fromInput).toBeVisible({ timeout: 5_000 })

    await fromInput.fill('2025-06-15')
    await toInput.fill('2025-06-01') // end before start
    await toInput.blur()

    await page.getByRole('button', { name: 'Export PDF' }).first().click()

    await expect(
      page.getByText(/Start date must be before end date/i)
    ).toBeVisible({ timeout: 3_000 })
  })
})
