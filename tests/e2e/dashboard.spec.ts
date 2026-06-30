/**
 * Dashboard E2E tests
 *
 * Persona split:
 *   Free user  — page-level content only (rolling-window timeline, progress bar,
 *                verdict/status, inline "Plan a trip" simulator, "Recent trips").
 *                The free user has 10 seeded trips and is at the free-tier limit.
 *   Pro user   — the "Log trip" CTA link URL assertion, the inline simulator, and
 *                the trip-save round-trip test. The pro user has no trip limit, so
 *                the modal opens normally and the URL stays as expected.
 *
 * Note on the "Log trip" link:
 *   The dashboard header "Log trip" button is a
 *   <Link href="/trips?modal=log&returnTo=%2Fdashboard">. Planning moved to the
 *   inline what-if simulator on the dashboard (DECISION-076), so there is no longer
 *   a "Plan trip" modal deep link on this page.
 *
 * Note on "Trip Log" / disclaimer:
 *   The dashboard renders DashboardTripsPreview (a read-only preview), NOT the full
 *   TripsTableClient. The "Trip Log" heading and DISCLAIMER constant live only in
 *   TripsTableClient (rendered at /trips). The dashboard section heading is
 *   "Recent trips" (DashboardTripsPreview line 37).
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

// Single-sheet modal (reskin Phase 8): destination + dates on one form.
async function fillDestination(
  page: import('@playwright/test').Page,
  destination: string
) {
  await page.getByLabel('Destination').fill(destination)
  await page.keyboard.press('Tab')
}

// ---------------------------------------------------------------------------
// Free user — page-level content only (no modal interaction)
// ---------------------------------------------------------------------------

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('loads and shows the rolling-window timeline (/ 180 days)', async ({ page }) => {
    await expect(
      page.getByText(/\/ 180 days/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('timeline shows a valid integer ≥ 0', async ({ page }) => {
    const el = page.getByText(/^\d+$/).first()
    const text = await el.textContent()
    expect(parseInt(text ?? '-1', 10)).toBeGreaterThanOrEqual(0)
  })

  test('progress bar is visible', async ({ page }) => {
    await expect(
      page.getByRole('progressbar').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('verdict reflects a valid risk state', async ({ page }) => {
    await page.getByText(/\/ 180 days/i).first().waitFor({ timeout: 10_000 })
    const body = await page.locator('body').textContent()
    // Verdict word derives from getRiskStatus (no redundant status chip).
    const valid = ["You're safe", 'Getting close', 'Very close', 'Over the limit'].some(
      (s) => body?.includes(s)
    )
    expect(valid).toBe(true)
  })

  test('"Recent trips" section is visible', async ({ page }) => {
    // The dashboard renders DashboardTripsPreview with heading "Recent trips".
    // The full "Trip Log" heading lives only on the /trips page (TripsTableClient).
    await expect(
      page.getByText('Recent trips')
    ).toBeVisible({ timeout: 10_000 })
  })
})

// ---------------------------------------------------------------------------
// Pro user — CTA links + trip-save round-trip
// ---------------------------------------------------------------------------

test.describe('Dashboard — pro user', () => {
  test.use({ storageState: PRO_AUTH })

  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('inline "Plan a trip" simulator is present (replaces the old Plan trip modal link)', async ({ page }) => {
    // Planning now happens via the inline what-if simulator on the dashboard
    // (DECISION-076), not a ?modal=plan deep link.
    await expect(page.getByText('Plan a trip')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /save as planned/i })).toBeVisible()
  })

  test('"Log trip" link → URL has ?modal=log', async ({ page }) => {
    const btn = page.getByRole('link', { name: /log trip/i }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/modal=log/, { timeout: 5_000 })
  })

  test('saving a trip from dashboard → returns to /dashboard (not modal URL)', async ({ page }) => {
    // The dashboard "Log trip" button is a <Link href="/trips?modal=log&returnTo=/dashboard">.
    // Navigate directly to that URL to simulate the click and verify the returnTo flow.
    await page.goto('/trips?modal=log&returnTo=%2Fdashboard')
    await expect(page.getByLabel('Destination')).toBeVisible({ timeout: 10_000 })

    await fillDestination(page, 'Dashboard Return Test')
    await navigateCalendarToMonth(page, 2024, 2) // March 2024
    await clickDay(page, 2024, 2, 5)
    await clickDay(page, 2024, 2, 10)

    await page.getByRole('button', { name: 'Log trip' }).click()

    // Success state appears; "Done" reads returnTo from the URL → router.push('/dashboard')
    await expect(page.getByText('Trip logged')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Done' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    expect(page.url()).not.toContain('modal=')
  })
})
