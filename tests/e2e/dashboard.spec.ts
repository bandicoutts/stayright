/**
 * Dashboard E2E tests
 *
 * Persona split:
 *   Free user — page load, quota ring, progress bar, status chip, CTAs,
 *               disclaimer, trip log section. The free user has 10 trips
 *               so the paywall triggers inside the modal, but URL tests
 *               still pass (the link navigates regardless).
 *   Pro user  — the "save trip and return to dashboard" test, because the
 *               free user's trip modal immediately shows the paywall.
 */

import { test, expect } from '@playwright/test'
import path from 'path'

const PRO_AUTH = path.join(__dirname, '.auth/pro.json')

async function suppressCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

async function navigateCalendarToMonth(
  page: import('@playwright/test').Page,
  targetYear: number,
  targetMonth: number
) {
  const headingLocator = page
    .locator('[aria-label="Next month"]')
    .locator('..')
    .locator('p')
    .first()

  for (let i = 0; i < 36; i++) {
    const text = await headingLocator.textContent()
    const current = text?.trim() ?? ''
    const target = `${MONTH_NAMES[targetMonth]} ${targetYear}`
    if (current === target) return
    const parts = current.split(' ')
    const cMonth = MONTH_NAMES.indexOf(parts[0])
    const cYear = parseInt(parts[1], 10)
    if (targetYear * 12 + targetMonth < cYear * 12 + cMonth) {
      await page.getByRole('button', { name: 'Previous month' }).click()
    } else {
      await page.getByRole('button', { name: 'Next month' }).click()
    }
  }
  throw new Error(`Could not navigate to ${MONTH_NAMES[targetMonth]} ${targetYear}`)
}

async function clickDay(
  page: import('@playwright/test').Page,
  year: number,
  month: number,
  day: number
) {
  const label = `${day} ${MONTH_NAMES[month]} ${year}`
  await page.getByRole('button', { name: label, exact: true }).click()
}

async function goToStep2(
  page: import('@playwright/test').Page,
  destination: string
) {
  await page.getByLabel('Destination').fill(destination)
  await page.keyboard.press('Tab')
  await page.getByRole('button', { name: 'Next →' }).click()
  await expect(page.getByText('Step 2 of 3')).toBeVisible({ timeout: 5_000 })
}

// ---------------------------------------------------------------------------
// Free user tests — page-level content, no trip modal interaction
// ---------------------------------------------------------------------------

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('loads and shows quota ring (/ 180 days)', async ({ page }) => {
    await expect(
      page.getByText(/\/ 180 days/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('quota ring centre shows a valid integer ≥ 0', async ({ page }) => {
    const el = page.getByText(/^\d+$/).first()
    const text = await el.textContent()
    expect(parseInt(text ?? '-1', 10)).toBeGreaterThanOrEqual(0)
  })

  test('qualifying period progress bar is visible', async ({ page }) => {
    await expect(
      page.getByRole('progressbar').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('status chip is one of SAFE / WARNING / DANGER / BREACH', async ({ page }) => {
    await page.getByText(/\/ 180 days/i).first().waitFor({ timeout: 10_000 })
    const body = await page.locator('body').textContent()
    const valid = ['SAFE', 'WARNING', 'DANGER', 'BREACH'].some((s) =>
      body?.includes(s)
    )
    expect(valid).toBe(true)
  })

  test('"Plan trip" link → URL has ?modal=plan', async ({ page }) => {
    const btn = page.getByRole('link', { name: /plan trip/i }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/modal=plan/, { timeout: 5_000 })
  })

  test('"Log trip" link → URL has ?modal=log', async ({ page }) => {
    const btn = page.getByRole('link', { name: /log trip/i }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/modal=log/, { timeout: 5_000 })
  })

  test('disclaimer visible — "consult an immigration adviser"', async ({ page }) => {
    // Text lives in TripsClient DISCLAIMER constant
    await expect(
      page.getByText(/consult an immigration adviser/i)
    ).toBeVisible({ timeout: 10_000 })
  })

  test('"Trip Log" section is visible', async ({ page }) => {
    await expect(
      page.getByText('Trip Log')
        .or(page.getByText('Your complete absence record.'))
        .first()
    ).toBeVisible({ timeout: 10_000 })
  })
})

// ---------------------------------------------------------------------------
// Pro user — trip save (free user hits paywall, can't reach Step 1)
// ---------------------------------------------------------------------------

test.describe('Dashboard — trip save', () => {
  test.use({ storageState: PRO_AUTH })

  test('saving a trip from dashboard → returns to /dashboard (not modal URL)', async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/dashboard?modal=log')
    await expect(page.getByText('Step 1 of 3')).toBeVisible({ timeout: 10_000 })

    await goToStep2(page, 'Dashboard Return Test')
    await navigateCalendarToMonth(page, 2024, 2) // March 2024
    await clickDay(page, 2024, 2, 5)
    await clickDay(page, 2024, 2, 10)

    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('Step 3 of 3')).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Save trip' }).click()

    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    expect(page.url()).not.toContain('modal=')
  })
})
