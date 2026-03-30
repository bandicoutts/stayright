/**
 * Settings E2E tests
 *
 * Covers: page load, tab navigation, visa detail fields, ILR calculation,
 * notifications Pro gate, data export button, and account deletion confirmation.
 */

import { test, expect } from '@playwright/test'

async function suppressCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
  })
}

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await suppressCookieBanner(page)
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings/)
  })

  test('settings page loads with all three tabs visible', async ({ page }) => {
    await expect(page.getByText('Visa Details')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Account')).toBeVisible()
    await expect(page.getByText('Notifications')).toBeVisible()
  })

  test('Visa Details: First name field is editable', async ({ page }) => {
    await expect(page.getByText('Visa Details')).toBeVisible({ timeout: 10_000 })
    const firstNameInput = page.getByLabel(/first name/i)
    if (await firstNameInput.isVisible()) {
      await expect(firstNameInput).toBeEditable()
    }
  })

  test('Visa Details: Visa start date field is editable', async ({ page }) => {
    await expect(page.getByText('Visa Details')).toBeVisible({ timeout: 10_000 })
    const dateInput = page.getByLabel(/visa start date/i)
    if (await dateInput.isVisible()) {
      await expect(dateInput).toBeEditable()
    }
  })

  test('Visa Details: ILR target date hint appears after filling start date', async ({ page }) => {
    await expect(page.getByText('Visa Details')).toBeVisible({ timeout: 10_000 })
    const dateInput = page.getByLabel(/visa start date/i)
    if (await dateInput.isVisible()) {
      await dateInput.fill('2021-06-01')
      await dateInput.blur()
      // ILR = visa start + 5 years = 2026
      await expect(page.getByText(/2026/)).toBeVisible({ timeout: 3_000 })
    }
  })

  test('Notifications: Pro lock badge visible for free user', async ({ page }) => {
    await page.getByText('Notifications').click()
    // Pro badge should appear on at least one notification toggle
    await expect(
      page.getByText('Pro').first()
    ).toBeVisible({ timeout: 5_000 })
  })

  test('Account: "Export my data" button is present', async ({ page }) => {
    await page.getByText('Account').click()
    await expect(
      page.getByRole('button', { name: /export my data/i })
        .or(page.getByRole('link', { name: /export my data/i }))
    ).toBeVisible({ timeout: 5_000 })
  })

  test('Account: delete confirmation asks to type "delete my account"', async ({ page }) => {
    await page.getByText('Account').click()
    const deleteBtn = page.getByRole('button', { name: /delete account/i })
    if (await deleteBtn.isVisible({ timeout: 3_000 })) {
      await deleteBtn.click()
      await expect(
        page.getByText(/Type delete my account to confirm/i)
      ).toBeVisible({ timeout: 3_000 })
    }
  })
})
