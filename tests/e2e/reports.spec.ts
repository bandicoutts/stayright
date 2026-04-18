/**
 * Reports E2E tests
 *
 * Free-user tests verify the paywall is shown correctly.
 * Pro-user tests verify PDF download is available.
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

  test('reports page loads with "Reports & Exports" heading', async ({ page }) => {
    await expect(
      page.getByText('Reports & Exports')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('all three report cards are visible', async ({ page }) => {
    await expect(page.getByText('ILR Absence Table')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Rolling Window History')).toBeVisible()
    await expect(page.getByText('Custom Date Range')).toBeVisible()
  })

  test('free user sees "Upgrade to Download" button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Upgrade to Download' }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('"Upgrade to Download" click shows PaywallModal', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Upgrade to Download' }).first()
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

  test('pro user sees "Download PDF" button (not "Upgrade to Download")', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Download PDF' }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('clicking "Download PDF" starts a file download', async ({ page }) => {
    // PDF generation is server-side (/api/reports/pdf) — Content-Disposition: attachment
    // means the browser treats the response as a download and CDP fires downloadWillBegin.
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 })
    const btn = page.getByRole('button', { name: 'Download PDF' }).first()
    await expect(btn).toBeVisible({ timeout: 10_000 })
    await btn.click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  })

  test('custom date range: end before start shows validation error', async ({ page }) => {
    await expect(page.getByText('Custom Date Range')).toBeVisible({ timeout: 10_000 })

    const fromInput = page.getByLabel('From')
    const toInput = page.getByLabel('To')

    if ((await fromInput.isVisible()) && (await toInput.isVisible())) {
      await fromInput.fill('2025-06-15')
      await toInput.fill('2025-06-01') // end before start
      await toInput.blur()

      const downloadBtn = page
        .getByRole('button', { name: 'Download PDF' })
        .last()
      await downloadBtn.click()

      await expect(
        page.getByText(/Start date must be before end date/i)
      ).toBeVisible({ timeout: 3_000 })
    }
  })
})
