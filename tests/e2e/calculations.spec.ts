/**
 * Calculation regression E2E tests
 *
 * Tests the live CalcPanel output at /trips/plan (what-if simulator).
 * No trips are saved — these only verify the live calculation display.
 *
 * Formula: absence_days = (return_date - departure_date) - 1
 * Neither departure day nor return day counts as absence.
 *
 * These tests assert the INDIVIDUAL trip day count shown in CalcPanel,
 * NOT the total rolling window quota, since that depends on the test
 * user's existing trip data.
 */

import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Navigate the DateRangePicker calendar to the target year/month.
 * Reads the month heading from the <p> adjacent to the "Next month" button
 * and clicks Prev/Next until it matches.
 */
async function navigateCalendarToMonth(page: Page, targetYear: number, targetMonth: number) {
  // The month heading <p> sits between the Prev/Next nav buttons in their parent div
  const headingLocator = page.locator('[aria-label="Next month"]').locator('..').locator('p').first()

  for (let i = 0; i < 30; i++) {
    const text = await headingLocator.textContent()
    const current = text?.trim() ?? ''
    const target = `${MONTH_NAMES[targetMonth]} ${targetYear}`
    if (current === target) return

    const parts = current.split(' ')
    const cMonth = MONTH_NAMES.indexOf(parts[0])
    const cYear = parseInt(parts[1], 10)
    const currentTotal = cYear * 12 + cMonth
    const targetTotal = targetYear * 12 + targetMonth

    if (targetTotal < currentTotal) {
      await page.getByRole('button', { name: 'Previous month' }).click()
    } else {
      await page.getByRole('button', { name: 'Next month' }).click()
    }
  }
  throw new Error(`Failed to navigate to ${MONTH_NAMES[targetMonth]} ${targetYear} within 30 clicks`)
}

/**
 * Click a specific day cell in the currently displayed calendar month.
 * Day cells have aria-label "${day} ${Month} ${year}" (e.g. "1 May 2026").
 */
async function clickDay(page: Page, year: number, month: number, day: number) {
  // aria-label is "${day} ${MONTH_NAMES[month]} ${year}" for unselected cells.
  // exact: true prevents "1 May 2026" from matching "11 May 2026", "21 May 2026", etc.
  const label = `${day} ${MONTH_NAMES[month]} ${year}`
  await page.getByRole('button', { name: label, exact: true }).click()
}

/**
 * Type a destination in step 1 and click "Next →" to advance to step 2.
 */
async function goToStep2(page: Page, destination: string) {
  await page.getByLabel('Destination').fill(destination)
  await page.keyboard.press('Escape') // dismiss autocomplete dropdown
  await page.getByRole('button', { name: 'Next →' }).click()
  await expect(page.getByText('Step 2 of 3')).toBeVisible({ timeout: 5_000 })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Calculation regression — live CalcPanel at /trips/plan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trips/plan')
    await expect(page.getByText('Step 1 of 3')).toBeVisible({ timeout: 10_000 })
  })

  test('TC1 — standard trip: depart May 1, return May 9 → 7 absence days', async ({ page }) => {
    // Formula: (May 9 − May 1) − 1 = 7
    await goToStep2(page, 'France')
    await navigateCalendarToMonth(page, 2026, 4) // May 2026 (month index 4)
    await clickDay(page, 2026, 4, 1)             // departure: May 1
    await clickDay(page, 2026, 4, 9)             // return: May 9

    // CalcPanel must show "This trip" label and the trip-specific day count
    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('7 days').first()).toBeVisible()
  })

  test('TC2 — next-day return: depart May 1, return May 2 → 0 absence days', async ({ page }) => {
    // Formula: (May 2 − May 1) − 1 = 0
    await goToStep2(page, 'Germany')
    await navigateCalendarToMonth(page, 2026, 4)
    await clickDay(page, 2026, 4, 1)
    await clickDay(page, 2026, 4, 2)

    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('0 days').first()).toBeVisible()
  })

  test('TC3 — Crown Dependency (Jersey) → 0 absence days, Crown Dep panel visible', async ({ page }) => {
    // Step 1: typing "Jersey" triggers the Crown Dep info banner immediately
    await page.getByLabel('Destination').fill('Jersey')
    await page.keyboard.press('Escape')
    await expect(
      page.getByText(/Crown Dependencies count as UK presence/i)
    ).toBeVisible({ timeout: 5_000 })

    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('Step 2 of 3')).toBeVisible({ timeout: 5_000 })

    // Pick any dates to trigger the step-2 Crown Dep panel
    await navigateCalendarToMonth(page, 2026, 4)
    await clickDay(page, 2026, 4, 5)  // departure
    await clickDay(page, 2026, 4, 12) // return

    // Step 2 Crown Dep panel: "0 absence days. Crown Dependencies count as UK presence."
    await expect(page.getByText('0 absence days.')).toBeVisible({ timeout: 5_000 })
  })

  test('TC4 — year-boundary trip: Dec 20 2026 – Jan 10 2027 → 20 absence days', async ({ page }) => {
    // Dec 21–31 = 11 days, Jan 1–9 = 9 days → 20 total
    await goToStep2(page, 'USA')
    await navigateCalendarToMonth(page, 2026, 11) // December 2026
    await clickDay(page, 2026, 11, 20)            // departure: Dec 20
    await navigateCalendarToMonth(page, 2027, 0)  // January 2027
    await clickDay(page, 2027, 0, 10)             // return: Jan 10

    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('20 days').first()).toBeVisible()
  })

  test('TC5 — changing return date updates the live calculation', async ({ page }) => {
    // Start: May 1–9 (7 days), then reset return to May 19 (17 days)
    await goToStep2(page, 'Spain')
    await navigateCalendarToMonth(page, 2026, 4)
    await clickDay(page, 2026, 4, 1)
    await clickDay(page, 2026, 4, 9)

    // Verify initial count
    await expect(page.getByText('7 days').first()).toBeVisible({ timeout: 5_000 })

    // Click "Returned to UK" summary button to reset the return date
    await page.locator('button:has-text("Returned to UK")').click()

    // Navigate to May 2026 again and pick a later return date
    await navigateCalendarToMonth(page, 2026, 4)
    await clickDay(page, 2026, 4, 19) // return: May 19

    // CalcPanel should now show 17 days: (May 19 − May 1) − 1 = 17
    await expect(page.getByText('17 days').first()).toBeVisible({ timeout: 5_000 })
  })

  test('TC6 — risk badge is one of the four valid labels', async ({ page }) => {
    // Any trip will produce a risk verdict — validate the label is one of the four
    await goToStep2(page, 'Italy')
    await navigateCalendarToMonth(page, 2026, 5) // June 2026
    await clickDay(page, 2026, 5, 1)             // departure: Jun 1
    await clickDay(page, 2026, 5, 8)             // return: Jun 8

    await expect(page.getByText('This trip')).toBeVisible({ timeout: 5_000 })

    const body = await page.locator('body').textContent()
    const valid = ['Safe', 'Warning', 'Danger', 'Breach'].some((s) => body?.includes(s))
    expect(valid).toBe(true)
  })
})
