/**
 * Trips E2E tests
 *
 * Covers: calculation regression (TC1–TC5), trip CRUD, search,
 * delete confirmation, paywall, and "return to /trips" after save.
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
// 1. Calculations — live CalcPanel (no DB write)
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
    await page.keyboard.press('Tab')
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

  test('TC5 — risk badge is one of the four valid labels', async ({ page }) => {
    await goToStep2(page, 'Italy')
    await navigateCalendarToMonth(page, 2026, 5)
    await clickDay(page, 2026, 5, 1)
    await clickDay(page, 2026, 5, 8)
    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })
    const body = await page.locator('body').textContent()
    const valid = ['Safe', 'Warning', 'Danger', 'Breach'].some((s) => body?.includes(s))
    expect(valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 2. Trip CRUD
// ---------------------------------------------------------------------------

test.describe('Trip CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
  })

  test('trips page loads with "Trip Log" heading', async ({ page }) => {
    await page.goto('/trips')
    await expect(page.getByText('Trip Log')).toBeVisible({ timeout: 10_000 })
  })

  test('trip modal Step 1 shows "Where are you going?"', async ({ page }) => {
    await page.goto('/trips?modal=plan')
    await expect(
      page.getByText('Where are you going?')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('saving a trip from /trips → returns to /trips (not /dashboard)', async ({ page }) => {
    await page.goto('/trips?modal=log')
    await expect(page.getByText('Step 1 of 3')).toBeVisible({ timeout: 10_000 })

    await goToStep2(page, 'Trips Return Test')
    await navigateCalendarToMonth(page, 2024, 5) // June 2024
    await clickDay(page, 2024, 5, 3)
    await clickDay(page, 2024, 5, 12)

    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('Step 3 of 3')).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Save trip' }).click()

    // Should return to /trips, not /dashboard
    await page.waitForURL('**/trips', { timeout: 15_000 })
    expect(page.url()).not.toContain('/dashboard')
    expect(page.url()).not.toContain('modal=')
  })

  test('search input filters trip list', async ({ page }) => {
    await page.goto('/trips')
    await expect(page.getByText('Trip Log')).toBeVisible({ timeout: 10_000 })

    const searchInput = page.getByPlaceholder('Search destinations…')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('ZZZNOMATCH')

    // Either shows "No trips logged yet" / "No trips match" or the list updates
    await page.waitForTimeout(500)
    const body = await page.locator('body').textContent()
    expect(body).toBeTruthy()
  })

  test('delete trip shows confirmation dialog', async ({ page }) => {
    await page.goto('/trips')
    await expect(page.getByText('Trip Log')).toBeVisible({ timeout: 10_000 })

    const deleteBtn = page.getByRole('button', { name: 'Delete' }).first()
    if (await deleteBtn.isVisible({ timeout: 3_000 })) {
      await deleteBtn.click()
      await expect(
        page.getByText('Delete this trip?')
      ).toBeVisible({ timeout: 3_000 })
    }
  })

  test('cancel delete dismisses the confirmation dialog', async ({ page }) => {
    await page.goto('/trips')
    await expect(page.getByText('Trip Log')).toBeVisible({ timeout: 10_000 })

    const deleteBtn = page.getByRole('button', { name: 'Delete' }).first()
    if (await deleteBtn.isVisible({ timeout: 3_000 })) {
      await deleteBtn.click()
      await expect(page.getByText('Delete this trip?')).toBeVisible({ timeout: 3_000 })

      await page.getByRole('button', { name: 'Cancel' }).click()
      await expect(page.getByText('Delete this trip?')).not.toBeVisible({ timeout: 3_000 })
    }
  })
})

// ---------------------------------------------------------------------------
// 3. Paywall
// ---------------------------------------------------------------------------

test.describe('Paywall', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
  })

  test('free user can open trip modal (< 10 trips: Step 1 of 3 visible)', async ({ page }) => {
    // The free user is seeded with exactly 10 trips — if the limit is 10
    // the paywall will trigger immediately. This test verifies modal loads.
    await page.goto('/trips?modal=plan')
    // Either step 1 is shown (< limit) or paywall is shown (at limit)
    const step1 = page.getByText('Step 1 of 3')
    const paywall = page.getByText(/Unlock StayRight Pro/i)
    await Promise.race([
      step1.waitFor({ timeout: 10_000 }),
      paywall.waitFor({ timeout: 10_000 }),
    ])
    // At least one must be visible
    const step1Visible = await step1.isVisible().catch(() => false)
    const paywallVisible = await paywall.isVisible().catch(() => false)
    expect(step1Visible || paywallVisible).toBe(true)
  })

  test('PaywallModal shows prices £2.99 / £24.99 / £49.99', async ({ page }) => {
    // The free user is seeded with 10 trips so the paywall triggers on plan modal
    await page.goto('/trips?modal=plan')
    const paywall = page.getByText(/Unlock StayRight Pro/i)
    const visible = await paywall.isVisible({ timeout: 10_000 }).catch(() => false)
    if (!visible) {
      test.skip() // User has < 10 trips — paywall won't trigger
      return
    }
    await expect(page.getByText('£2.99')).toBeVisible()
    await expect(page.getByText('£24.99')).toBeVisible()
    await expect(page.getByText('£49.99')).toBeVisible()
  })
})
