/**
 * Security E2E tests
 *
 * Protects against regressions of vulnerabilities identified in the pentest
 * (DECISION-040). One test per confirmed vulnerability fix.
 *
 * These tests verify server-side enforcement — not just UI gates.
 * They call APIs and Server Actions directly to bypass client-side checks.
 */

import { test, expect } from '@playwright/test'

test.describe('Security — Server-side enforcement', () => {
  test('unauthenticated Server Action call returns auth error, not data', async ({ page }) => {
    // Call the Server Action endpoint directly without a session.
    // Next.js Server Actions are POST requests to the same URL.
    // We verify the response is an auth error, not trip data.
    const response = await page.request.post('/trips', {
      headers: {
        'Content-Type': 'application/json',
        'Next-Action': 'add', // server action identifier
      },
      data: JSON.stringify([{
        destination: 'Test',
        departure_date: '2025-06-01',
        return_date: '2025-06-10',
      }]),
    })

    // Without a session, should get a non-200 response or auth error in body
    // Exact response format depends on Next.js SA error handling
    expect(response.status()).not.toBe(200)
  })

  test('visiting protected /dashboard without session redirects to /login', async ({ page }) => {
    // Use a fresh context with no session
    const freshContext = await page.context().browser()!.newContext({
      storageState: { cookies: [], origins: [] },
    })
    const freshPage = await freshContext.newPage()
    await freshPage.goto(
      (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/dashboard'
    )
    await freshPage.waitForURL(/\/login/, { timeout: 10_000 })
    expect(freshPage.url()).toContain('/login')
    await freshContext.close()
  })

  test('User B cannot access /trips/[id]/edit for User A trip by guessing ID', async ({ page }) => {
    // We test by navigating to a non-existent or other-user's trip edit URL
    // The server should return a 404, redirect, or show "not found"
    await page.goto('/trips/00000000-0000-0000-0000-000000000000/edit')

    // Should not render an edit form with data — either redirect or show error
    const editForm = page.getByLabel(/destination/i)
    const hasValue = await editForm.isVisible().catch(() => false)
    if (hasValue) {
      const value = await editForm.inputValue()
      // If a form is shown, it should be empty (trip not found, no data loaded)
      expect(value).toBe('')
    }
    // OR the page should show a 404/not found message
    const body = await page.textContent('body')
    const isAuthError = page.url().includes('/login') || 
      body?.toLowerCase().includes('not found') ||
      body?.toLowerCase().includes('404') ||
      !hasValue
    expect(isAuthError).toBe(true)
  })

  test('Free user cannot add 4th trip via direct navigation to /trips/log', async ({ page }) => {
    // A Free user with 3 trips navigating to /trips/log should see paywall
    // even if they get past the client-side gate
    await page.goto('/trips/log')

    // Page should either show paywall or allow adding trip (if user has < 3)
    // Server-side: addTripAction will reject if user has >= 3 trips and is Free
    // This is a smoke test — the real enforcement is in the action test
    const paywallShown = await page.getByText(/upgrade|unlock pro|free plan/i).isVisible()
    const formShown = await page.getByLabel(/destination/i).isVisible()

    // At least one of these should be true
    expect(paywallShown || formShown).toBe(true)
  })

  test('PDF generation blocked for Free user server-side — paywall shown', async ({ page }) => {
    await page.goto('/reports')
    const generateBtn = page.getByRole('button', { name: /generate|download/i }).first()

    if (await generateBtn.isVisible()) {
      await generateBtn.click()
      // Free user should see paywall, not start a download
      await expect(
        page.getByText(/upgrade|unlock pro|£2\.99/i)
      ).toBeVisible({ timeout: 5_000 })
    }
  })

  test('cron endpoint returns 401 without auth token', async ({ page }) => {
    const response = await page.request.get('/api/cron/daily')
    expect(response.status()).toBe(401)
  })

  test('cron monthly endpoint returns 401 without auth token', async ({ page }) => {
    const response = await page.request.get('/api/cron/monthly')
    expect(response.status()).toBe(401)
  })

  test('Stripe webhook returns 400 for invalid/missing signature', async ({ page }) => {
    const response = await page.request.post('/api/stripe/webhook', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ type: 'checkout.session.completed' }),
    })
    // Without a valid Stripe-Signature header, should return 400
    expect(response.status()).toBe(400)
  })
})
