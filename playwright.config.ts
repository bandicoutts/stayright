/**
 * Playwright full-suite configuration.
 *
 * Runs all spec files (except smoke.spec.ts) against Chromium with two auth
 * personas: free and pro. Auth is set up by two dedicated setup files.
 *
 * Local:  npx playwright test
 * CI:     same command (CI env var triggers `next start` instead of `next dev`)
 *
 * Smoke suite has its own config: playwright.smoke.config.ts
 */
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  testDir: './tests/e2e',

  // Smoke suite has its own config — exclude it here to avoid double-running.
  testIgnore: /smoke\.spec\.ts/,

  // Serial execution — avoids DB conflicts on CRUD tests.
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
    // Auth setup — must run before all authenticated tests.
    {
      name: 'setup-free',
      testMatch: /auth\.setup-free\.ts/,
    },
    {
      name: 'setup-pro',
      testMatch: /auth\.setup-pro\.ts/,
    },

    // Most tests run as the free user.
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/free.json',
      },
      dependencies: ['setup-free', 'setup-pro'],
      // auth.spec.ts and landing.spec.ts manage their own session state.
      testIgnore: /\/(auth|landing)\.spec\.ts/,
    },

    // auth.spec.ts and landing.spec.ts need no stored session.
    {
      name: 'no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /\/(auth|landing)\.spec\.ts/,
    },
  ],

  // Start the app server automatically when pointing at localhost.
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
