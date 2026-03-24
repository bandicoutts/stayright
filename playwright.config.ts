import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

/**
 * StayRight — Playwright Configuration
 *
 * Tests run against a live Next.js server (dev or preview).
 * Set NEXT_PUBLIC_APP_URL in .env.local or CI env vars to point at the target.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report' }]]
    : [['html', { outputFolder: 'playwright-report' }]],

  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL,    /* Base browse settings for all projects */
    trace: 'retain-on-failure',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project to authenticate users — runs before all tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Landing page + auth tests don't need auth state
    {
      name: 'landing-auth-no-setup',
      testMatch: /\/(landing|auth)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the dev server for local runs; in CI use NEXT_PUBLIC_APP_URL pointing at Vercel
  webServer: !process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL === 'http://localhost:3000'
    ? {
        command: 'npm run dev',
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
