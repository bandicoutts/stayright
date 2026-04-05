# StayRight — Testing

---

### Selector conventions

Use `getByRole` for interactive elements rather than attribute+text combos (e.g. `locator('button[type="button"]:has-text(...)')`). The `:has-text()` selector does substring matching — it will match any element whose label *contains* the target string, which breaks as soon as labels evolve. Role-based selectors are unambiguous and resilient to styling changes.

```ts
// Avoid — substring match, fragile
page.locator('button[type="button"]:has-text("Sign in")')

// Prefer — exact role + accessible name
page.getByRole('tab', { name: 'Sign in' })
```

---

## Automated E2E Suite

Two tiers of Playwright tests run against a local Supabase instance in CI (Chromium only, 1 worker serial). See DECISION-064.

### Smoke suite — runs on every push to `main`
- **Config:** `playwright.smoke.config.ts`
- **Workflow:** `.github/workflows/e2e.yml`
- **Tests:** 12 tests in `tests/e2e/smoke.spec.ts`
- **Auth:** `testuser@stayright.test` → `.auth/smoke.json`
- **Covers:** auth redirects, dashboard load, calculation regression (TC1–TC4), DB roundtrip

### Full suite — runs nightly at 2am UTC
- **Config:** `playwright.config.ts`
- **Workflow:** `.github/workflows/e2e-nightly.yml`
- **Tests:** ~50 tests across 7 spec files
- **Auth personas:**

| File | User | Supabase plan | Purpose |
|---|---|---|---|
| `auth.setup-smoke.ts` | `testuser@stayright.test` | free, few trips | Smoke suite |
| `auth.setup-free.ts` | `e2e-free@stayright.test` | free, 10 trips | Paywall tests |
| `auth.setup-pro.ts` | `e2e-pro@stayright.test` | pro_lifetime | Modal, PDF, reports tests |

**Critical persona rule:** Tests that open the trip modal (calculations, CRUD, dashboard save) must use the pro user. The free user is seeded with exactly `FREE_TRIP_LIMIT` (10) trips so the PaywallModal always shows immediately — this is intentional for paywall testing.

### Running locally
```bash
# Smoke suite only
npx playwright test --config playwright.smoke.config.ts

# Full suite
supabase start
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
TEST_FREE_USER_EMAIL=e2e-free@stayright.test \
TEST_FREE_USER_PASSWORD=TestFree123! \
TEST_PRO_USER_EMAIL=e2e-pro@stayright.test \
TEST_PRO_USER_PASSWORD=TestPro123! \
npx playwright test
```

### Auth state files (`.auth/`)
`.auth/` is in `.gitignore`. The setup projects create these files at the start of each run. Playwright creates the directory automatically if it doesn't exist.

| File | Created by | Used by |
|---|---|---|
| `.auth/smoke.json` | `auth.setup-smoke.ts` | `playwright.smoke.config.ts` |
| `.auth/free.json` | `auth.setup-free.ts` | `playwright.config.ts` (default) |
| `.auth/pro.json` | `auth.setup-pro.ts` | `reports.spec.ts`, `trips.spec.ts`, `dashboard.spec.ts` pro describes |

### Spec file overview

| File | Persona | What it tests |
|---|---|---|
| `auth.spec.ts` | none (fresh context) | Login, logout, protected-route redirects |
| `landing.spec.ts` | none (fresh context) | Landing page load, pricing, cookie banner |
| `onboarding.spec.ts` | free | Redirect guards (all routes → /dashboard when completed) |
| `dashboard.spec.ts` | free (load tests), pro (save test) | Quota ring, progress bar, CTAs, disclaimer, trip save returns to /dashboard |
| `trips.spec.ts` | pro (calcs + CRUD), free (paywall) | Calculation regression, trip CRUD, paywall trigger |
| `settings.spec.ts` | free | Tabs, field editability, Pro lock badge, export, delete confirmation |
| `reports.spec.ts` | free (paywall), pro (PDF download) | Paywall on "Upgrade to Download", PDF download, custom date validation |
| `smoke.spec.ts` | smoke user | Subset of the above — fast path validation on every push |

---

## Manual Test Checklist

Run this checklist before every major release. Contains items that cannot be automated.

---

## Stripe Payment Flows

Use the [Stripe test card numbers](https://stripe.com/docs/testing).

- [ ] **Successful subscription** — card `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] **Failed payment** — card `4000 0000 0000 0002` → payment declined error shown
- [ ] **3DS authentication required** — card `4000 0025 0000 3155` → 3DS modal appears
- [ ] **Subscription cancellation** via Customer Portal → confirm Pro features remain until billing period ends
- [ ] **Pro access retained** until end of billing period after cancel
- [ ] **Free tier restrictions apply** after billing period ends (10-trip cap, no exports, no alerts)
- [ ] **Annual plan checkout** — `£24.99/year` displayed; subscription renews annually
- [ ] **Lifetime plan checkout** — `£49.99` one-time; no renewal prompt ever shown

---

## Auth Flows Requiring Real Email

- [ ] **Email verification** — sign up → check inbox → link works and lands on onboarding
- [ ] **Password reset** — request reset → check inbox → link works → new password screen
- [ ] **Reset link expiry** — confirm link expires after 24 hours (attempt after 24h → friendly error message)
- [ ] **Google OAuth signup** — new account created for a Google account not previously signed up
- [ ] **Google OAuth login** — existing account logs in successfully (no duplicate account)

---

## PDF Verification

Download the ILR Absence Table and verify the document manually.

- [ ] **Download** — click "Generate" on Reports → PDF downloads immediately
- [ ] **Header** — PDF contains: user's full name, visa route, qualifying period start and end dates
- [ ] **All trips present** — trips appear in chronological order (oldest first)
- [ ] **Total absence days** — summary row at the bottom shows the correct total
- [ ] **Disclaimer footer** — "Not legal advice. Always verify with UKVI."
- [ ] **File name** — follows convention `StayRight_ILR_Absence_Table_YYYY-MM-DD.pdf`
- [ ] **Open in Adobe Reader** — no errors, no corrupt file warnings

---

## Mobile Device Testing

Test on real hardware or a hardware-accurate simulator.

- [ ] **iOS / Safari mobile** — test on a real iPhone or Safari iOS Simulator
- [ ] **Android / Chrome** — test on a real Android device or Chrome DevTools mobile emulation
- [ ] **Trip modal** — opens as a bottom sheet on mobile (not a centred modal)
- [ ] **Touch targets** — all buttons and links are ≥ 44×44px (check with browser dev tools)
- [ ] **Cookie consent** — banner usable on mobile, does not obscure primary CTAs
- [ ] **Quota ring** — renders correctly on small screens (390px)
- [ ] **Horizontal scroll** — no horizontal scroll on main pages at 390px width
