/**
 * Smoke suite — 12 critical-path E2E tests.
 *
 * Designed to run fast (chromium only, serial) and validate:
 *   1. Auth redirects work
 *   2. Dashboard loads correctly
 *   3. Core absence calculations are accurate
 *   4. A trip can be saved and retrieved (DB roundtrip)
 *
 * Run locally:
 *   npx playwright test --config playwright.smoke.config.ts
 */

import { test, expect, type Page } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function suppressCookieBanner(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

async function navigateCalendarToMonth(page: Page, targetYear: number, targetMonth: number) {
  const headingLocator = page.locator('[aria-label="Next month"]').locator('..').locator('p').first()
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

async function clickDay(page: Page, year: number, month: number, day: number) {
  const label = `${day} ${MONTH_NAMES[month]} ${year}`
  await page.getByRole('button', { name: label, exact: true }).click()
}

async function goToStep2(page: Page, destination: string) {
  await page.getByLabel('Destination').fill(destination)
  await page.keyboard.press('Tab') // dismiss autocomplete without triggering modal's Escape handler
  await page.getByRole('button', { name: 'Next →' }).click()
  await expect(page.getByText('Step 2 of 3')).toBeVisible({ timeout: 5_000 })
}

// ---------------------------------------------------------------------------
// 1. Auth redirects — fresh context (no stored session)
// ---------------------------------------------------------------------------

test.describe('Auth redirects', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('unauthenticated user visiting /dashboard is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user visiting /settings is redirected to /login', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

// ---------------------------------------------------------------------------
// 2. Dashboard — authenticated
// ---------------------------------------------------------------------------

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('loads and shows quota ring', async ({ page }) => {
    await expect(page.getByText(/\/ 180 days/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('quota ring centre shows a valid integer', async ({ page }) => {
    const el = page.getByText(/^\d+$/).first()
    const text = await el.textContent()
    expect(parseInt(text ?? '-1', 10)).toBeGreaterThanOrEqual(0)
  })

  test('qualifying period progress bar is visible', async ({ page }) => {
    await expect(page.getByRole('progressbar').first()).toBeVisible({ timeout: 10_000 })
  })

  test('"Plan trip" button navigates to plan modal', async ({ page }) => {
    const btn = page.getByRole('link', { name: /plan trip/i }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/modal=plan/, { timeout: 5_000 })
  })

  test('"Log trip" button navigates to log modal', async ({ page }) => {
    const btn = page.getByRole('link', { name: /log trip/i }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/modal=log/, { timeout: 5_000 })
  })
})

// ---------------------------------------------------------------------------
// 3. Calculations — live CalcPanel (no DB write)
// ---------------------------------------------------------------------------

test.describe('Calculations — live CalcPanel', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/trips?modal=plan')
    await expect(page.getByText('Step 1 of 3')).toBeVisible({ timeout: 10_000 })
  })

  test('TC1 — standard trip: depart May 1, return May 9 → 7 absence days', async ({ page }) => {
    await goToStep2(page, 'France')
    await navigateCalendarToMonth(page, 2026, 4)
    await clickDay(page, 2026, 4, 1)
    await clickDay(page, 2026, 4, 9)
    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('7 days').first()).toBeVisible()
  })

  test('TC2 — next-day return: depart May 1, return May 2 → 0 absence days', async ({ page }) => {
    await goToStep2(page, 'Germany')
    await navigateCalendarToMonth(page, 2026, 4)
    await clickDay(page, 2026, 4, 1)
    await clickDay(page, 2026, 4, 2)
    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('0 days').first()).toBeVisible()
  })

  test('TC3 — Crown Dependency (Jersey) → 0 absence days + info panel', async ({ page }) => {
    await page.getByLabel('Destination').fill('Jersey')
    await page.keyboard.press('Tab') // dismiss autocomplete without triggering modal's Escape handler
    await expect(
      page.getByText(/Crown Dependencies count as UK presence/i)
    ).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('Step 2 of 3')).toBeVisible({ timeout: 5_000 })
    await navigateCalendarToMonth(page, 2026, 4)
    await clickDay(page, 2026, 4, 5)
    await clickDay(page, 2026, 4, 12)
    await expect(page.getByText('0 absence days.')).toBeVisible({ timeout: 5_000 })
  })

  test('TC4 — year-boundary trip: Dec 20 2026 – Jan 10 2027 → 20 absence days', async ({ page }) => {
    await goToStep2(page, 'USA')
    await navigateCalendarToMonth(page, 2026, 11)
    await clickDay(page, 2026, 11, 20)
    await navigateCalendarToMonth(page, 2027, 0)
    await clickDay(page, 2027, 0, 10)
    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('20 days').first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// 4. DB roundtrip — save a trip and confirm it persists
// ---------------------------------------------------------------------------

test.describe('DB roundtrip', () => {
  test('saving a trip via log modal → trip appears in the trips table', async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/trips?modal=log')
    await expect(page.getByText('Step 1 of 3')).toBeVisible({ timeout: 10_000 })

    // Step 1 — destination
    await goToStep2(page, 'Smoke Test Country')

    // Step 2 — dates
    await navigateCalendarToMonth(page, 2024, 4) // May 2024
    await clickDay(page, 2024, 4, 1)              // departure May 1
    await clickDay(page, 2024, 4, 10)             // return May 10

    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('Step 3 of 3')).toBeVisible({ timeout: 5_000 })

    // Step 3 — save
    await page.getByRole('button', { name: 'Save trip' }).click()

    // TripFlowClient redirects back to /trips after save (same-page return)
    await page.waitForURL('**/trips', { timeout: 15_000 })

    await expect(page.getByText(/Smoke Test Country/)).toBeVisible({ timeout: 10_000 })
  })
})
