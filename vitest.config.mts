import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/app/**/actions.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/types/**',
        // Exclude Next.js framework files (pages, layouts, route handlers, proxy)
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/route.ts',
        'src/proxy.ts',
      ],
      thresholds: {
        'src/lib/calculations/': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
        'src/lib/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Threshold covers the security-critical trips server actions (RLS, quota enforcement).
        // settings/actions.ts and onboarding/actions.ts are not yet covered by unit tests.
        // branches: 75 (not 80) because null-coalescing operators have one un-exercised path.
        'src/app/(app)/(main)/trips/actions.ts': {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
