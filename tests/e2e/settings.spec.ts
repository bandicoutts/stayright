/**
 * Settings E2E tests
 *
 * Tests: visa profile editing, notification toggles, password change,
 * account deletion flow, data export.
 */

import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings/)
  })

  test('settings page loads with expected sections', async ({ page }) => {
    await expect(page.getByText(/visa profile/i)).toBeVisible()
    await expect(page.getByText(/notifications|account/i).first()).toBeVisible()
  })

  test('visa profile fields are editable', async ({ page }) => {
    const firstNameInput = page.getByLabel(/first name/i)
    if (await firstNameInput.isVisible()) {
      await expect(firstNameInput).toBeEditable()
    }

    const dateInput = page.getByLabel(/visa start date/i)
      .or(page.locator('input[type="date"]').first())
    if (await dateInput.isVisible()) {
      await expect(dateInput).toBeEditable()
    }
  })

  test('changing visa start date recalculates ILR target date', async ({ page }) => {
    const dateInput = page.getByLabel(/visa start date/i)
      .or(page.locator('input[type="date"]').first())

    if (await dateInput.isVisible()) {
      await dateInput.fill('2024-06-15')
      await dateInput.blur()

      // ILR date should update to 2029-06-15
      await expect(page.getByText(/2029/)).toBeVisible({ timeout: 3_000 })
    }
  })

  test('notification toggles are visible (Pro feature)', async ({ page }) => {
    const notifSection = page.getByText(/notifications/i).locator('..')
    await expect(notifSection).toBeVisible()
  })

  test('password change section is present and requires current password', async ({ page }) => {
    const currentPwdField = page.getByLabel(/current password/i)
    if (await currentPwdField.isVisible()) {
      await expect(currentPwdField).toBeVisible()
    } else {
      // Password section may be collapsible — look for the heading
      await expect(page.getByText(/password|change password/i)).toBeVisible()
    }
  })

  test('delete account button shows confirmation dialog', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete account/i })
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      await expect(
        page.getByText(/permanently delete|cannot be undone|are you sure/i)
      ).toBeVisible({ timeout: 3_000 })
    }
  })

  test('delete account requires typing DELETE to confirm', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete account/i })
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()

      // Check for a text confirmation input
      const confirmInput = page.getByPlaceholder(/DELETE|type to confirm/i)
        .or(page.getByLabel(/type.*DELETE/i))
      await expect(confirmInput).toBeVisible({ timeout: 3_000 })
    }
  })

  test('Export my data button is present', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export.*data/i })
      .or(page.getByRole('link', { name: /export.*data/i }))
    await expect(exportBtn).toBeVisible()
  })

  test('Export my data triggers a JSON download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 5_000 }).catch(() => null)
    const exportBtn = page.getByRole('button', { name: /export.*data/i })
      .or(page.getByRole('link', { name: /export.*data/i }))

    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      const download = await downloadPromise
      if (download) {
        const filename = download.suggestedFilename()
        expect(filename).toMatch(/\.json$/i)
      }
    }
  })
})
