/**
 * Settings E2E tests
 *
 * Reskin Phase 5: Settings is six jump-nav sections on one scrollable page
 * (Visa & ILR, Account, Subscription, Notifications, Appearance, Data & privacy).
 * Covers: page load, section nav, visa fields, ILR calculation, notifications Pro
 * gate, data export, and account deletion confirmation.
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

  test('settings page loads with section nav visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Visa & ILR' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('link', { name: 'Account' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Notifications' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Appearance' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Data & privacy' })).toBeVisible()
  })

  test('Visa & ILR: visa start date field is editable', async ({ page }) => {
    const dateInput = page.getByLabel(/visa start date/i)
    await expect(dateInput).toBeVisible({ timeout: 10_000 })
    await expect(dateInput).toBeEditable()
  })

  test('Account: first name field is editable', async ({ page }) => {
    const firstNameInput = page.getByLabel(/first name/i)
    await expect(firstNameInput).toBeVisible({ timeout: 10_000 })
    await expect(firstNameInput).toBeEditable()
  })

  test('ILR eligibility date appears after filling start date', async ({ page }) => {
    const dateInput = page.getByLabel(/visa start date/i)
    await expect(dateInput).toBeVisible({ timeout: 10_000 })
    await dateInput.fill('2021-06-01')
    await dateInput.blur()
    // ILR = visa start + 5 years = 2026
    await expect(page.getByText(/2026/)).toBeVisible({ timeout: 3_000 })
  })

  test('Notifications: Pro lock badge visible for free user', async ({ page }) => {
    // All sections render on one page; the Pro badge appears on locked toggles.
    await expect(page.getByText('Pro').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Email me at 120 days')).toBeVisible()
  })

  test('Subscription: all four plans are shown with prices', async ({ page }) => {
    await expect(page.getByText('£2.99')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('£24.99')).toBeVisible()
    await expect(page.getByText('£49.99')).toBeVisible()
  })

  test('"Export my data" button is present', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /export my data/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('delete confirmation asks to type "delete my account"', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete account/i })
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 })
    await deleteBtn.click()
    await expect(
      page.getByText(/Type delete my account to confirm/i)
    ).toBeVisible({ timeout: 3_000 })
  })
})
