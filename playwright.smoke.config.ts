/**
 * Playwright smoke configuration.
 *
 * Runs only smoke.spec.ts against a single browser (Chromium) with 1 worker.
 * Use this for fast CI validation before promoting a full multi-browser run.
 *
 * Local:  npx playwright test --config playwright.smoke.config.ts
 * CI:     same command (CI env var triggers `next start` instead of `next dev`)
 */
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /smoke\.spec\.ts/,

  // Serial execution — avoids DB conflicts on the trip CRUD test
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: 0,

  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report' }]]
    : [['html', { outputFolder: 'playwright-report' }]],

  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Auth setup — must run before the smoke tests
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Start the app server automatically when pointing at localhost.
  // In CI: `next start` (requires a prior `npm run build`).
  // Locally: `next dev` for fast iteration.
  webServer:
    !process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL === 'http://localhost:3000'
      ? {
          command: process.env.CI ? 'npm run start' : 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        }
      : undefined,
})
