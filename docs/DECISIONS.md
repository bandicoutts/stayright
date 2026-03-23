# StayRight — Decision Log

This file records significant decisions made during the design and build of StayRight. Each entry explains what was decided, why, what alternatives were considered, and the date it was made.

When there is a conflict between this file and other documentation, use this file to understand the intent behind the decision, then defer to PRD.md for what to build.

---

## Quick Reference

Scan this table to find relevant decisions. Read the full entry only if the summary suggests it is relevant to your task. Decisions marked **Superseded** must not be implemented — read the superseding decision instead.

| ID | Title | One-line summary | Status |
|---|---|---|---|
| DECISION-001 | Tech stack selection | Next.js + Supabase + Vercel + Stripe + Resend; TypeScript strict throughout | Decided |
| DECISION-002 | Absence day counting formula | `absence = (return − departure) − 1`; neither departure nor return day counts | Decided |
| DECISION-003 | No native mobile app in v1 | Web-only; PWA covers mobile use case | Decided |
| DECISION-004 | Freemium model with 3-trip free tier | Free up to 3 trips; Pro unlocks unlimited trips and PDF export | Decided |
| DECISION-005 | Calculations never stored, always computed on read | DB stores raw trip dates only; engine always recalculates | Decided |
| DECISION-006 | Design system source of truth | DESIGN.md + tokens.css are authoritative; wireframes are reference only | Decided |
| DECISION-007 | Wireframe folder structure | `/docs/wireframes/` with per-screen subdirectories | Decided |
| DECISION-008 | Tailwind v4 CSS-based configuration | `@theme` blocks in CSS; no `tailwind.config.ts` | Decided |
| DECISION-009 | Root layout holds fonts; marketing layout is segment wrapper | Manrope + Inter loaded once in `src/app/layout.tsx` | Decided |
| DECISION-010 | Multi-leg trips are a single trip record | First UK departure → final UK return; intermediate stops noted in `notes` field | Decided |
| DECISION-011 | Crown Dependencies count as UK presence; BOTs count as absence | Jersey/Guernsey/IoM → 0 absence days; Gibraltar/Bermuda etc. → full absence | Decided |
| DECISION-012 | Monthly summary email — 7-section HTML format | HTML + plain text fallback; 7 defined sections; sent via Resend | Decided |
| DECISION-013 | Database schema — three tables | `profiles`, `trips`, `subscriptions`; RLS on all | Decided |
| DECISION-014 | @supabase/ssr client pattern | `createBrowserClient` (client), `createServerClient` + `await cookies()` (server), `createAdminClient` (service role) | Decided |
| DECISION-015 | Session refresh and route protection via proxy.ts | `src/proxy.ts` handles auth session refresh and protected-route redirects | Decided |
| DECISION-016 | Auth screens architecture | Server component fetches session; client component handles form interaction | Decided |
| DECISION-017 | Onboarding state via `onboarding_completed` column | Boolean on `profiles`; `false` → redirect to `/onboarding` on every protected page | Decided |
| DECISION-018 | Absence engine as pure TypeScript functions | `src/lib/calculations/absenceEngine.ts`; no side effects, no DB calls | Decided |
| DECISION-019 | App shell uses `(main)` route group with sidebar | Sidebar layout wraps all authenticated app pages under `(app)/(main)/` | Decided |
| DECISION-020 | Trip flow pages are standalone routes | `/trips/plan`, `/trips/log`, `/trips/[id]/edit` as App Router pages, not modals | **Superseded by DECISION-031** |
| DECISION-021 | Paywall modal UI built; Stripe Checkout deferred | `PaywallModal` renders with "Coming soon" toast until payments sprint wires Stripe | Decided |
| DECISION-022 | `calculateWhatIf` uses `return_date` as `today` | Projects rolling window forward to trip return date for accurate future-trip results | Decided |
| DECISION-023 | PDF generation client-side with `@react-pdf/renderer` | Dynamic import on button click; Blob download; no server involvement | Decided |
| DECISION-024 | Recent exports list deferred — no DB table in v1 | Reports page shows PDF download only; no export history stored | Decided |
| DECISION-025 | `notes` field maps to "Reason for Travel" in ILR PDF | Column B of the ILR Absence Table populated from `notes` | Decided |
| DECISION-026 | Account deletion is a hard delete in v1 | Immediate cascade delete of profile + trips + subscription + Stripe customer | Decided |
| DECISION-027 | Stripe integration: server-side API routes, client redirect | `POST /api/stripe/checkout` creates session; client redirects to Stripe-hosted page | Decided |
| DECISION-028 | Email notifications via Resend + Vercel Cron | Daily cron checks thresholds; deduplication via boolean columns on `profiles` | Decided |
| DECISION-029 | PostHog analytics: client-only, consent-gated | SDK init only after cookie consent; typed `track()` wrapper | Decided |
| DECISION-030 | PWA: manifest + offline service worker | Push notifications deferred to v2 | Decided |
| DECISION-031 | Trip drawer replaces standalone trip pages | `TripsClient` opens a drawer for plan/log/edit; paywall check fires before drawer opens | Decided |
| DECISION-032 | Remove Recent Trips card from dashboard | Dashboard is status-only (quota ring + period bar); compact trip summary replaces trip cards | Decided |
| DECISION-033 | Split name into `first_name` + `last_name` | `last_name` deferred to Settings; `first_name` from onboarding/OAuth | Decided |
| DECISION-034 | Shared `RISK_CONFIG` and date formatting utilities | `src/lib/riskConfig.ts`, `src/lib/dateUtils.ts` — import don't inline | Decided |
| DECISION-035 | HTTP security headers via `next.config.ts` | CSP, HSTS, X-Frame-Options, etc. set as response headers | Decided |
| DECISION-036 | Auth callback `next` param validated against open redirect | Whitelist of allowed redirect paths; unknown paths fall back to `/dashboard` | Decided |
| DECISION-037 | RLS DELETE policies added for profiles and subscriptions | Users can only delete their own rows; admin client bypasses for account deletion | Decided |
| DECISION-038 | Stripe customer deleted on account deletion | `stripe.customers.del()` called in hard-delete flow (GDPR right to erasure) | Decided |
| DECISION-039 | Password reset does not invalidate other sessions in v1 | Supabase default behaviour; full session invalidation deferred | Decided |
| DECISION-040 | Server-side paywall enforcement + `isPlanPro` utility | `isPlanPro(plan, status)` in `src/lib/subscriptionUtils.ts`; checks both plan AND status | Decided |
| DECISION-041 | Webhook idempotency and rate limiting deferred to v1.1 | M-3 and L-1 security gaps acknowledged; mitigated but not fully closed | Decided |
| DECISION-042 | Ongoing trips counted with provisional return; Crown Dependency exact matching | Trips with no `return_date` use today as provisional end; Crown Dependency list is exact-match only | Decided |
| DECISION-043 | WCAG 2.2 AA Accessibility Compliance Architecture | Enforces contrast ratios, global focus states, reduced-motion queries, focus-trapping, and axe-core E2E tests | Decided |

---

## How to add an entry

When you make a decision that:
- Affects the architecture or data model
- Deviates from the wireframes or PRD
- Resolves an open question from the PRD
- Involves a meaningful tradeoff between options

Add an entry using this format:

### [DECISION-XXX] Short title
**Date:** YYYY-MM-DD
**Status:** Decided / Superseded / Under review
**Decided by:** [name or agent]

**Decision:**
One paragraph describing what was decided.

**Reasoning:**
Why this option was chosen over alternatives.

**Alternatives considered:**
- Alternative A — why rejected
- Alternative B — why rejected

**Consequences:**
What this decision means for the codebase, the product, or future decisions.

**Related:**
Links to relevant PRD sections, open questions, or other decision entries.

---

## Decisions

### [DECISION-001] Tech stack selection
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
The StayRight stack is Next.js 14+ (App Router) for frontend and API routes, Supabase for database and auth, Vercel for hosting, GitHub for version control, Stripe for payments, and Resend for transactional email. TypeScript throughout with strict mode enabled.

**Reasoning:**
Next.js + Supabase + Vercel is the most common stack for SaaS products at this stage and has the best agent support in Antigravity. App Router gives server-side rendering, API routes, and Vercel deployment in one package without a separate Node server. Supabase provides Postgres, auth, and Row Level Security out of the box, reducing the amount of auth infrastructure to build from scratch.

**Alternatives considered:**
- Plain Node + Express — rejected. More setup overhead, no SSR, separate deployment needed.
- Firebase — rejected. NoSQL is a poor fit for the relational data model (users → profiles → trips). Rolling window queries are easier in Postgres.
- Remix — rejected. Smaller ecosystem and less agent tooling support than Next.js at this stage.

**Consequences:**
All API routes live in src/app/api/. Server components handle data fetching. The calculation engine runs server-side to ensure accuracy. Supabase RLS policies are the primary data security layer.

**Related:** PRD.md Section 7 Open Question 1 (resolved)

---

### [DECISION-002] Absence day counting formula
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder), verified against official Home Office guidance

**Decision:**
Absence days are calculated as: `absence_days = (return_date - departure_date) - 1`

Neither the departure day nor the return day counts as a day of absence. Only full days spent entirely outside the UK are counted.

Example: Depart 1 March, return 8 March = 6 days absent (2, 3, 4, 5, 6, 7 March)

Example: Depart 1 March, return 2 March = 0 days absent (no full days outside UK)

**Reasoning:**
This matches the official Home Office guidance in Appendix Continuous Residence and is confirmed by multiple immigration barristers. Both the departure day and return day count as days of presence in the UK, not absence. Only whole days are counted. Part-day absences under 24 hours are not counted.

Conservative protection is applied through warning thresholds (120 days and 150 days) rather than through a non-standard formula. This ensures calculations match what the Home Office uses while giving users a meaningful safety margin.

**Alternatives considered:**
- Count departure day as an absence — rejected. Some solicitors recommend this as a personal buffer for their clients, but it does not match the official Home Office formula and would cause StayRight's calculations to differ from the SET(O) form guidance.
- Count both departure and return as absences — rejected. Same reason. Would overcount absences and potentially cause users to curtail travel unnecessarily.

**Consequences:**
The calculation engine must implement this formula exactly. Unit tests must cover the edge cases: same-day return (0 days), next-day return (0 days), and the standard case.

A disclaimer must appear on the dashboard and in the PDF export: "Calculations follow official Home Office guidance. Always verify with an immigration adviser if you are approaching the limit."

**Related:** PRD.md Section 4c, PRD.md Section 7 Open Question 5 (resolved)

---

### [DECISION-003] No native mobile app in v1
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder), recommended by PM review

**Decision:**
No native iOS or Android app will be built in v1. The web app will be fully responsive and mobile-optimised, and will be built as a PWA (Progressive Web App) so it can be installed on mobile home screens.

**Reasoning:**
The core use case (trip planning before booking) happens on desktop. Building two platforms doubles engineering surface area for auth, data sync, bug fixes, and platform-specific UI. A responsive PWA covers 80% of mobile value at 10% of the cost. PM review confirmed this is the right call for v1.

**Alternatives considered:**
- React Native — rejected for v1. Significant additional complexity, separate build pipeline, App Store/Play Store submissions.
- Flutter — rejected for v1. Same reasons as React Native. Good option for v2.
- Capacitor wrapper around the web app — rejected. Adds complexity without meaningful UX benefit over a PWA at this stage.

**Consequences:**
The web app must be fully responsive at 390px, 768px, and 1280px+ breakpoints. The PWA manifest and service worker must be configured so users can install the app on their home screen. Push notifications for alerts must use the Web Push API rather than native push notifications.

Mobile is the first priority for v2 once product-market fit is established on web.

**Related:** PRD.md Section 2.2 (out of scope)

---

### [DECISION-004] Freemium model with 3-trip free tier
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder), recommended by PM review

**Decision:**
The free tier allows up to 3 trips logged. Pro is £2.99/month or £24.99/year. No family tier in v1. No 14-day free trial — the free tier itself serves as the trial experience.

**Reasoning:**
A 3-trip free tier lets users experience the core "what if" calculation before hitting the paywall, without giving away so much that there's no incentive to upgrade. The paywall triggers naturally at the point users are invested enough to pay. Dropping the 14-day trial removes billing complexity (trial period tracking, trial expiry, trial-to-paid conversion) at no meaningful cost to conversion since the free tier already demonstrates value.

**Alternatives considered:**
- 14-day free trial — rejected. Adds Stripe trial period complexity. The free tier already serves this purpose with less engineering.
- 10-trip free tier — rejected. Too generous. A user with 10 trips logged has already solved their immediate problem and has less incentive to upgrade.
- No free tier (paid only) — rejected. Creates too much friction for a new product with no brand recognition.
- Family tier at £4.99/month — rejected for v1. Multi-tenancy adds significant complexity for marginal revenue. Validate demand first.

**Consequences:**
The paywall must trigger at exactly 3 saved trips, not 3 what-if simulations. Users can run unlimited what-if calculations but can only save 3 trips. Stripe must be configured for monthly and annual plans only — no trial periods, no family plan.

**Related:** PRD.md Section 3

---

### [DECISION-005] Calculations are never stored, always computed on read
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder), engineering spec

**Decision:**
No calculated absence values are stored in the database. The rolling window count, peak window, compliance status, days remaining, and ILR eligibility date are all computed on read from the raw trip dates stored in the trips table.

**Reasoning:**
Storing calculated values creates a consistency risk — if a user edits or deletes a trip, all stored calculations become stale instantly. Computing on read ensures the displayed value is always correct regardless of what data changes. The calculation is fast enough (a typical user has fewer than 50 trips) that there is no performance justification for caching calculated values.

**Alternatives considered:**
- Store calculated values and invalidate on trip change — rejected. Cache invalidation logic is complex and a source of bugs. Given the high-stakes nature of the data (visa compliance), a stale cached value could have serious consequences for the user.
- Background job to recalculate on trip change — rejected. Introduces async inconsistency. User could see stale data between trip save and background recalculation.

**Consequences:**
The calculation engine in src/lib/calculations/absenceEngine.ts must be pure functions that take trip data as input and return calculated values. No database calls inside the engine. All heavy calculation happens server-side in API routes or server components, not client-side.

**Related:** PRD.md Section 4c, engineer setup prompt

---

### [DECISION-006] Design system source of truth
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
The design system is documented in two files: /docs/design/landing.DESIGN.md (landing page) and /docs/design/dashboard.DESIGN.md (app). Shared rules are defined in /docs/DESIGN.md which acts as the wrapper. When there is a conflict between the two surface-specific files, dashboard.DESIGN.md takes precedence.

The Stitch wireframes are visual references only. The DESIGN.md files override the wireframes on all design decisions.

**Reasoning:**
Stitch generates design systems per project. The landing page and dashboard were designed in separate Stitch projects. Merging the files risked losing specificity. Keeping them separate with a wrapper allows each surface to have the detail it needs while shared rules (primary colour, typography, elevation) are defined once and applied everywhere.

**Alternatives considered:**
- Single merged DESIGN.md — rejected. Merging two AI-generated design files risks introducing conflicts and losing component-specific detail.

**Consequences:**
Engineers working on the landing page read landing.DESIGN.md. Engineers working on the app read dashboard.DESIGN.md. Both read the shared rules in /docs/DESIGN.md. If a component appears in both files with conflicting rules, dashboard.DESIGN.md wins.

**Related:** /docs/DESIGN.md, /docs/WIREFRAMES.md

---

### [DECISION-007] Wireframe folder structure
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
Wireframes are stored in /docs/wireframes/ preserving the original Stitch export folder structure. Landing page screens are in /docs/wireframes/landingpage2/ and all authenticated app screens are in /docs/wireframes/web2/. Subfolders use the original Stitch naming convention (e.g. v3_dashboard_overview/).

**Reasoning:**
Manually renaming and reorganising 20+ folders and files added unnecessary effort with no meaningful benefit to the engineer. The original Stitch naming is descriptive enough. The WIREFRAMES.md index maps each folder to its screen purpose, so engineers do not need to rely on the folder names alone.

**Alternatives considered:**
- Rename and reorganise into semantic folders (auth/, dashboard/, trips/ etc.) — rejected. High effort, low value. The index in WIREFRAMES.md provides the same navigation.

**Consequences:**
Any reference to wireframe file paths in documentation must use the landingpage2/ and web2/ folder structure. The WIREFRAMES.md index is the canonical map between screen names and folder locations.

**Related:** /docs/WIREFRAMES.md

---

### [DECISION-013] Database schema — three tables: profiles, trips, subscriptions
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
The StayRight database has three tables in the `public` schema:

- `profiles` — extends `auth.users` with visa profile data (visa route, visa start date) and notification preferences. One row per user, created automatically on signup via trigger.
- `trips` — one row per UK absence period. Stores `departure_date`, `return_date` (nullable — null means currently abroad), `destination` (free text), and `notes`. No calculated values stored (DECISION-005).
- `subscriptions` — one row per user. Stores Stripe IDs, plan (`free` | `pro_monthly` | `pro_annual` | `pro_lifetime`), and status. Writable only by service role (Stripe webhooks); users can read their own row.

**Reasoning:**
Three tables maps cleanly to the three data domains. Keeping notification preferences in `profiles` avoids a separate `notification_settings` table for what is a simple set of boolean toggles. Keeping Stripe IDs in `subscriptions` (separate from `profiles`) means the payments domain is isolated and the service role writes are scoped to one table.

**Alternatives considered:**
- Storing notification prefs in a separate table — rejected. Five boolean columns on `profiles` is simpler and there is no use case for querying notification prefs independently of the profile.
- Storing Stripe IDs on `profiles` — rejected. Mixes payment concerns into the profile table. Subscription writes need service role bypass; isolating to one table makes the RLS policy clearer.
- Using Supabase's built-in `user_metadata` for profile data — rejected. Not queryable with standard SQL; no type safety; harder to enforce constraints.

**Consequences:**
All API routes and server components fetch profile + subscription data together for most authenticated requests. A helper that returns `{ profile, subscription }` for the current user avoids duplicate queries.

**Related:** DECISION-001, DECISION-005, PRD Section 4h, 4j

---

### [DECISION-014] @supabase/ssr for Next.js App Router; separate browser, server, and admin clients
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
Three Supabase client functions are defined in `src/lib/supabase/`:

- `client.ts` — `createClient()` using `@supabase/ssr` `createBrowserClient`. Use in Client Components (`'use client'`).
- `server.ts` — `createClient()` using `@supabase/ssr` `createServerClient` with Next.js `cookies()`. Use in Server Components, Server Actions, and Route Handlers.
- `admin.ts` — `createAdminClient()` using the base `@supabase/supabase-js` client with the service role key. Bypasses RLS. Use only in API routes (Stripe webhooks, server-side admin operations). Never import in Client Components.

**Reasoning:**
`@supabase/ssr` is the Supabase-recommended package for Next.js App Router. It handles cookie-based session management required for SSR. The browser/server split is required because App Router Server Components cannot use browser APIs. The admin client is separated into its own file so it is impossible to accidentally import it on the client — the service role key would be exposed if bundled client-side.

**Alternatives considered:**
- Using `@supabase/auth-helpers-nextjs` — rejected. Deprecated in favour of `@supabase/ssr`.
- Single client for all contexts — rejected. Browser and server clients require different cookie handling. Mixing them causes session management bugs in SSR.

**Consequences:**
Developers must always use the correct client for the context: `src/lib/supabase/client.ts` in Client Components, `src/lib/supabase/server.ts` everywhere else, `src/lib/supabase/admin.ts` only for privileged operations.

**Related:** DECISION-001, DECISION-013

---

### [DECISION-015] Next.js middleware handles session refresh and route protection
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
`src/middleware.ts` runs on every non-static request and handles two things: (1) refreshes the Supabase session so tokens do not expire mid-session; (2) redirects unauthenticated users away from authenticated routes (`/dashboard`, `/trips`, `/reports`, `/settings`, `/onboarding`) to `/login`, and redirects authenticated users away from auth pages (`/login`, `/signup`) to `/dashboard`.

**Reasoning:**
Supabase's `@supabase/ssr` documentation requires session refresh in middleware to prevent token expiry in Server Components. Combining route protection in the same middleware avoids a separate auth check in every Server Component or layout.

**Alternatives considered:**
- Per-layout auth check in Server Components — rejected. Requires duplicating the session check in every layout and still needs the middleware session refresh. More code, same result.

**Consequences:**
Any new authenticated route must be added to the `isAppRoute` check in `src/middleware.ts`. Any new public route does not need any changes — it is public by default.

**Related:** DECISION-013, DECISION-014

---

### [DECISION-010] Multi-leg trips are a single trip record
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
A multi-leg trip (e.g. London → Dubai → Bangkok → London) is stored as a single trip record. The record uses the first UK departure date and the final UK return date. Intermediate destinations and stopover dates are not tracked by the calculation engine. Users may record multiple destinations in the trip notes field for their own reference. The trip log shows one row per trip record.

**Reasoning:**
The Home Office assesses when the applicant left the UK and when they came back — not where they went in between. Tracking intermediate legs adds schema complexity and UI complexity (multi-row trip entries, leg-level editing) with no compliance benefit. The calculation is identical whether the trip has one destination or ten. One record per UK departure/return pair keeps the data model simple and the UI uncluttered.

**Alternatives considered:**
- Track each leg as a separate trip record — rejected. Overcomplicates the schema, the trip list UI, and the editing flow. Does not change the absence calculation.
- Add a "legs" sub-table under trips — rejected. Same overengineering problem. No ILR compliance benefit.

**Consequences:**
The `trips` table has one row per UK absence period. The destination field is a free-text string; users enter whatever is meaningful to them ("Dubai and Bangkok", "Multiple destinations"). The notes field is available for additional detail. The what-if simulator and trip log both operate on first-departure/final-return dates only.

**Related:** PRD.md Section 4c, 4e, 4f; Open Question 1 (resolved)

---

### [DECISION-011] Crown Dependencies count as UK presence; BOTs count as absence
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
Following the 2025 rule update, time spent in Jersey, Guernsey, and the Isle of Man counts toward UK continuous residence. If a trip's destination is one of these three Crown Dependencies, the calculation engine returns `absence_days = 0` regardless of the dates entered.

All other destinations outside Great Britain and Northern Ireland count as absence, including British Overseas Territories (Gibraltar, Bermuda, Cayman Islands, Falkland Islands, etc.). This is the conservative and safe approach — BOTs are not part of the UK for immigration purposes and Home Office guidance on discretion is ambiguous.

All trip detail views display a permanent note: "Time in Crown Dependencies (Jersey, Guernsey, Isle of Man) does not count as absence. Time in British Overseas Territories (Gibraltar, Bermuda etc.) does count as absence. If you are unsure, consult an immigration adviser."

**Reasoning:**
The Crown Dependencies exception is settled law following the 2025 update and must be implemented correctly. The BOT position is deliberately conservative — treating BOT time as absence protects users. If the Home Office later clarifies that certain BOTs count as presence, this can be updated without data migration (calculations are always computed on read).

**Alternatives considered:**
- Treat all non-UK destinations as absence — rejected. Would incorrectly penalise users who spent time in Crown Dependencies after the 2025 rule change.
- Ask users to manually flag Crown Dependency trips — rejected. Adds UI friction and risks user error on a legal question where StayRight should be authoritative.
- Treat BOTs as UK presence — rejected. Home Office guidance is ambiguous. Conservative approach protects users from inadvertently breaching.

**Consequences:**
The engine must check whether a trip's destination matches the Crown Dependencies list before applying the standard formula. The destination field is free text, so matching requires normalised comparison (case-insensitive, alias-aware: "Jersey", "St Helier", "Isle of Man", "IOM", etc. should all match). A curated destination list with Crown Dependency flags is required in the data model.

**Related:** PRD.md Section 4c, 4f; Open Question 3 (resolved)

---

### [DECISION-012] Monthly summary email — 7-section HTML format with plain text fallback
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
The monthly summary email is an HTML email sent via Resend on the 1st of each month to all Pro users with the monthly summary toggle enabled. It has 7 sections: Header, Status Card, Key Stats, Recent Trips, Next Known Trip, CTA Button, Footer. A plain text fallback is always generated alongside the HTML version. The full spec is in PRD Section 4i.

**Reasoning:**
A structured HTML email with a status card and progress bar communicates compliance status more effectively than plain text. The 7-section order follows the user's attention: status first, then context (stats, recent trips), then action (CTA). Keeping recent trips to a maximum of 3 rows prevents the email from becoming a full trip dump — that's what the app is for.

**Alternatives considered:**
- Plain text only — rejected. Compliance information benefits from visual hierarchy (colour-coded risk badge, progress bar). Plain text fallback is still required for email client compatibility.
- Link to a hosted web version of the report — rejected. Adds a hosted page that must be generated and secured. The CTA to log in to the dashboard achieves the same goal without extra infrastructure.

**Consequences:**
The Resend email template must be built as a React Email component (or equivalent) that accepts the monthly stats as props and renders both HTML and plain text. The template must match the StayRight brand (#006948 header, Manrope headlines, Inter body, white background). The subject line uses the dynamic pattern from PRD Section 5.9.

**Related:** PRD.md Section 4i, Section 5.9; Open Question 2 (resolved)

---

### [DECISION-008] Tailwind v4 CSS-based configuration
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering (build constraint)

**Decision:**
The project uses Tailwind CSS v4, which is installed by `create-next-app@16`. Tailwind v4 does not use a `tailwind.config.ts` file. All theme configuration (colors, fonts, radius) is done via `@theme` blocks in `src/app/globals.css`. Design tokens are also exported as CSS custom properties from `src/styles/tokens.css`.

**Reasoning:**
`create-next-app@16` (the latest version at the time of initialisation) automatically installs Tailwind v4. Migrating to v3 for a config file would add unnecessary complexity. Tailwind v4's `@theme` blocks provide equivalent configurability and integrate cleanly with CSS custom properties.

**Alternatives considered:**
- Downgrade to Tailwind v3 — rejected. Would require pinning the dependency and fighting against the framework default.
- Maintain a `tailwind.config.ts` alongside CSS — rejected. Not valid in Tailwind v4; the JS config is ignored.

**Consequences:**
Color and font utilities use the `@theme` CSS variable names. Engineers should reference `src/app/globals.css @theme` block to see available utility classes. Custom colors are referenced with `text-[#006948]` syntax or via theme variables.

**Related:** DECISION-001, DECISION-006

---

### [DECISION-009] Root layout holds fonts; marketing layout is a segment wrapper
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering (Next.js App Router constraint)

**Decision:**
Manrope and Inter fonts are loaded via `next/font/google` in `src/app/layout.tsx` (the root layout). The `(marketing)` route group layout (`src/app/(marketing)/layout.tsx`) is a simple segment wrapper that only exports SEO metadata — it does not include `<html>` or `<body>` tags.

**Reasoning:**
Next.js App Router requires exactly one `<html>` and `<body>` element, provided by the root layout. Nested layouts must not repeat these. Fonts loaded in the root layout are available to all routes including the future authenticated app under `(app)/`.

**Alternatives considered:**
- Load fonts separately in each route group layout — rejected. Not permitted; multiple `<html>` elements cause a build error.

**Consequences:**
All routes in the app have Manrope and Inter available via CSS variables `--font-manrope` and `--font-inter`. The root layout metadata is minimal; route-group and page-level `metadata` exports provide the actual SEO content.

**Related:** DECISION-001, PRD Section 4k

---

### [DECISION-016] Auth screens architecture — server/client split and route layout
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
Auth screens live in the `(auth)` route group (`src/app/(auth)/`), sharing a common layout that provides the logo header, centered content area, and footer. Each auth page owns its own content. Pages that handle form submission are client components (`'use client'`). Pages that only need to read `searchParams` or render static content are server components.

The login page (`/login`) is split into a thin server component (`page.tsx`) that reads `searchParams` (required in Next.js 16 where `searchParams` is a Promise) and a client component (`LoginForm.tsx`) that holds all form state. This avoids the `useSearchParams()` Suspense boundary requirement.

The Supabase auth code exchange is handled by a Route Handler at `/auth/callback`. The `next` query parameter controls where the user lands after a successful exchange: `/onboarding` for new signups and Google OAuth, `/auth/new-password` for password resets, `/dashboard` as the default.

**Reasoning:**
Next.js 16 made `params` and `searchParams` asynchronous (Promises). Client components cannot `await` them, and `useSearchParams()` requires a `<Suspense>` boundary. The server wrapper pattern eliminates both issues without adding a boundary component. The `(auth)` route group gives these screens their own layout (minimal, centred) without affecting URLs.

**Alternatives considered:**
- Use `useSearchParams()` wrapped in `<Suspense>` — works but adds boilerplate for every client page that needs URL params.
- Put auth pages at root level without a route group — rejected. No shared layout, more repetition across pages.
- Use middleware to handle auth redirects from the callback — rejected. The callback is a Route Handler; middleware cannot inspect auth codes.

**Consequences:**
Any new auth-related page (e.g. account linking, MFA setup) should follow the same pattern: place in `(auth)/`, use the server wrapper if `searchParams` are needed, keep form logic in a client component. Add the route to the `isAuthRoute` check in `src/middleware.ts` if logged-in users should be redirected away.

**Related:** DECISION-009, DECISION-014, DECISION-015, PRD Section 4a

---

### [DECISION-017] Onboarding state persisted via `onboarding_completed` column
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
A boolean column `onboarding_completed` (default `false`) is added to the `profiles` table to track whether a user has finished or skipped onboarding. The onboarding layout server components read this flag and redirect to `/dashboard` if it is true. When a user completes or skips onboarding, the flag is set to `true` via a Server Action before redirecting. Mid-flow persistence is achieved by reading from the DB: if `visa_start_date IS NOT NULL` but `onboarding_completed IS FALSE`, the user is placed at the trips step.

Server Actions (`src/app/(app)/onboarding/actions.ts`) handle all DB writes: `saveVisaProfileAction` (step 1), `saveTripAction` / `deleteTripAction` (step 2), `skipOnboardingAction`, and `completeOnboardingAction`. Each trip is saved to the DB immediately when added, so the list is durable across sessions.

**Reasoning:**
A DB flag is the simplest durable signal. `localStorage` would be lost on a different device; session storage is lost on tab close. Inferring completion from data presence (e.g. `visa_start_date IS NOT NULL`) is ambiguous — a user might have set their visa date but never finished trip entry. An explicit flag eliminates all ambiguity.

**Alternatives considered:**
- `localStorage` for onboarding step — rejected. Not durable across devices or browser restarts.
- Infer completion from `visa_start_date IS NOT NULL` — rejected. Ambiguous — doesn't distinguish mid-flow from genuinely complete.
- Separate `onboarding_step` integer column — rejected. Overkill. Three steps, and the DB data itself tells us which step was reached.

**Consequences:**
Any new onboarding step added in future must ensure `onboarding_completed` is set to `true` at the end of the final step. The `profiles.onboarding_completed` flag is the authoritative signal for all auth-callback redirects.

**Related:** PRD Section 4b, DECISION-013, DECISION-014

---

### [DECISION-018] Absence engine as pure TypeScript functions in src/lib/calculations/
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
All 180-day absence calculations live in `src/lib/calculations/absenceEngine.ts` as pure functions with no framework dependencies. The engine exports: `calculateTripAbsenceDays`, `getCurrentRollingWindow`, `getPeakRollingWindow`, `getRiskStatus`, `getQualifyingPeriod`, `calculateWhatIf`, and `isCrownDependency`. Date arithmetic uses UTC to avoid timezone-shift bugs. Dashboard and reports call these functions server-side and pass pre-computed results as props to client components — no calculations happen in the browser.

**Reasoning:**
Pure functions are trivially unit-testable and can be imported by any server component, route handler, or cron job without framework coupling. UTC date parsing prevents off-by-one errors caused by local timezone offsets (a trip logged as "1 March" in BST must not be read as "28 February" in UTC).

**Alternatives considered:**
- Inline calculations in server components — rejected. Duplicates logic, makes testing hard.
- Store calculations in the DB — explicitly rejected in DECISION-005.
- Client-side calculations — rejected. PRD requires server-side for accuracy.

**Consequences:**
Any change to calculation logic must be made in `absenceEngine.ts`. The file carries a prominent warning comment. Future unit tests should target this file exclusively.

**Related:** DECISION-002, DECISION-005, PRD Section 4c

---

### [DECISION-019] App shell uses (main) route group with sidebar layout
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
Authenticated app screens (dashboard, trips, reports, settings) live under `src/app/(app)/(main)/`. The `(main)` layout is a server component that fetches the authenticated user and renders the `Sidebar` client component. The `Sidebar` uses `usePathname()` for active-state highlighting and handles sign-out client-side via `supabase.auth.signOut()`. Onboarding uses its own layout outside `(main)` since it has different chrome.

**Alternatives considered:**
- Single layout for all authenticated routes — rejected. Onboarding needs minimal chrome; the app needs a sidebar.
- Client-side layout with useEffect for auth check — rejected. Server component auth check is simpler and avoids flash of unauthenticated content.

**Consequences:**
All future authenticated screens (trips, reports, settings) go in `(app)/(main)/`. Each new route needs to be added to the `NAV_ITEMS` array in `Sidebar.tsx` when it's ready to be navigable.

**Related:** DECISION-009, DECISION-015, DECISION-016

---

### [DECISION-020] Trip flow pages are standalone routes, not overlay modals
**Date:** 2026-03-21
**Status:** Superseded by DECISION-031
**Decided by:** Engineering

**Decision:**
`/trips/plan`, `/trips/log`, and `/trips/[id]/edit` are implemented as standalone Next.js App Router pages rather than client-side overlay modals. The "modal" language in the PRD is UI intent, not a technical specification. After a save or cancel action, users are redirected to `/trips` via `router.push('/trips')`.

**Reasoning:**
Standalone pages are simpler to implement, have better URL semantics (users can bookmark or deep-link), support browser back navigation natively, and integrate cleanly with Next.js Server Components for data loading. Client-side modal routing would require URL state management (e.g. `?modal=plan`) plus a parallel route or intercepting route, adding significant complexity with no user-facing benefit.

**Alternatives considered:**
- Next.js intercepting routes (`@modal`) — rejected. Adds folder structure complexity and intercepting route edge cases (direct navigation, hard refresh). Not worth the overhead for three forms.
- `?action=plan` URL state + client-side modal — rejected. Requires the trips page to be a client component to read the URL state, and the calculation data must still be fetched server-side.

**Consequences:**
`/trips/plan`, `/trips/log`, and `/trips/[id]/edit` are regular pages under `(app)/(main)/trips/`. Each loads its data server-side and renders `TripFlowClient`. The user experience is functionally equivalent to a modal — the sidebar is preserved and the back button works.

**Related:** PRD Section 4e, 4f; DECISION-019

---

### [DECISION-021] Paywall modal UI is built; Stripe Checkout is deferred to payments sprint
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
The `PaywallModal` component (`src/components/app/trips/PaywallModal.tsx`) is fully built to the PRD §4l spec — including plan selection cards, benefit list, and CTA button — but clicking "Upgrade to Pro" shows a "Coming soon" toast rather than opening Stripe Checkout. The Stripe integration will be wired in the dedicated payments sprint.

The component accepts an `inline` prop. When `inline={true}`, it renders as a full-width card (no overlay backdrop), used on `/trips/plan` and `/trips/log` when a Free user has reached the 3-trip limit. When `inline={false}` (default), it renders as a focus-trapped overlay modal, used from the `TripsClient` add trip button.

**Reasoning:**
Building the paywall UI now ensures paywall triggers are correctly gated in the trip flow. Deferring Stripe prevents blocking the trip feature on payment infrastructure. The `inline` variant avoids shipping dead pages (a Free user navigating to `/trips/plan` with 3 trips would otherwise see an empty page).

**Alternatives considered:**
- Skip the paywall UI until Stripe is ready — rejected. Paywall gates must be present for Free users to avoid broken flows. The UI stub communicates intent correctly.
- Redirect to a dedicated paywall page — rejected. A redirect to `/upgrade` is a worse user experience than an inline gate on the page they already navigated to.

**Consequences:**
When the payments sprint is built, `handleUpgrade()` in `PaywallModal.tsx` must be wired to the Stripe Checkout Server Action. No other changes are required in the trip flow.

**Related:** PRD Section 3.3, 4j, 4l; DECISION-020

---

### [DECISION-022] calculateWhatIf uses return_date as the `today` parameter for future trips
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** Engineering

**Decision:**
In `TripFlowClient.tsx`, the live what-if calculation calls `calculateWhatIf(existingTrips, hypotheticalTrip, new Date(return_date), visaStartDate)` — passing the hypothetical trip's return date as the `today` parameter instead of the current date.

**Reasoning:**
`calculateWhatIf` calls `getCurrentRollingWindow` with the provided `today`, which calculates a 12-month window ending on that date. If `today = new Date()` (the current date) and the trip departs in 3 months, the rolling window is `[today − 1 year, today]`. Future absence days are outside this window and would not be counted, giving a misleadingly safe result. Passing `today = return_date` computes the rolling window as `[return_date − 1 year, return_date]`, which correctly shows the user where they will stand when they return.

This gives the user the right answer to the question: "How many days will I have used when I get back from this trip?"

**Alternatives considered:**
- Use `new Date()` as today — rejected. Correct for past and present trips but gives wrong results for any future trip, which is the primary use case of the "Plan a Trip" feature.
- Create a new engine function that projects forward — rejected. `calculateWhatIf` already accepts a `today` parameter for exactly this reason. No new function needed.

**Consequences:**
The live calculation on `/trips/plan` correctly projects the rolling window forward to the return date. For past trips (log/edit mode), `return_date` is in the past, so this has no difference in behaviour — the window ends before today, which is the correct snapshot.

**Related:** PRD Section 4e; DECISION-018; `src/lib/calculations/absenceEngine.ts`

---

### [DECISION-023] PDF generation library and execution pattern
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Use `@react-pdf/renderer` v4.3.2 for PDF generation. PDF documents are generated **client-side only**, via a dynamic `import()` inside the "Download PDF" button click handler in `ReportsClient`. The PDF Blob is created in the browser and downloaded directly — no server action, no API route, no Vercel function involvement.

**Reasoning:**
PDF generation only happens on explicit user action, so there is no need to involve the server. Client-side generation keeps the serverless functions small, avoids cold-start latency for a non-critical path, and simplifies the architecture. The library was verified compatible before installation: peer deps support React `^19.0.0`, no browser-only APIs in the source (`HTMLCanvasElement`, `window`, `document` are absent), ESM-only but handled correctly by Next.js 16 Turbopack via `import()`. On-disk footprint is 3MB — no risk of Vercel's 250MB bundle size limit.

**Alternatives considered:**
- **pdf-lib** — low-level, no React integration, would require manual coordinate-based layout for every table cell. Viable but significantly more code for the same result.
- **Puppeteer / Playwright** — headless browser spins up a full Chromium instance. ~400MB+ dependency, Vercel serverless size limit risk, cold starts. Rejected.
- **Server-side @react-pdf/renderer** (via Server Action or API route) — technically works (no browser APIs required), but adds unnecessary serverless complexity when the trigger is a client button click. Deferred unless server-side PDF generation becomes a requirement (e.g. auto-emailing reports).
- **@vercel/og / Satori** — designed for OpenGraph image generation (SVG→PNG), not document PDFs. Does not produce multi-page downloadable PDFs. Rejected.

**Consequences:**
PDF generation is browser-only. If server-side generation is ever required (e.g. automatically emailing a PDF report as part of the monthly notification job), the pattern will need revisiting — most likely a dedicated API route using the server-compatible execution path of `@react-pdf/renderer`.

**Related:** PRD Section 4g; `src/lib/pdf/reportDocuments.tsx`; `src/components/app/reports/ReportsClient.tsx`

---

### [DECISION-024] Recent exports list deferred — no DB table in v1
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
The PRD §4g acceptance criterion "Recent exports are shown in a sidebar list with date, type, and re-download option" and the associated stale-data warning are deferred from v1. The Reports page shows the three report type cards and generates PDFs on demand — no report generation history is persisted to the database.

**Reasoning:**
Implementing a `report_exports` table requires an additional Supabase migration, a `updated_at`-based staleness check against the trips table, and a re-download flow (which is simply re-generation from current data anyway). Since Stripe is not yet built, no user is on a paid Pro plan in the current deployment — the feature cannot be meaningfully tested. Deferring keeps the v1 surface area focused.

**Alternatives considered:**
- localStorage-based history — breaks across devices, not acceptable for a compliance tool.
- Full DB table with report history — correct long-term approach; deferred to v1.1.

**Consequences:**
Free users see all three report cards but hit the paywall on any "Download PDF" click. Pro users generate PDFs on demand. No generation history is shown. The stale-data warning is not implemented. Add `report_exports` table and stale detection in the first post-launch iteration.

**Related:** PRD Section 4g; DECISION-023; `src/app/(app)/(main)/reports/`

---

### [DECISION-025] `notes` field maps to "Reason for Travel" in ILR Absence Table PDF
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
The ILR Absence Table PDF includes a "Reason for Travel" column (matching the SET(O) form format). The `trips.notes` field is used as the value for this column. No separate `reason_for_travel` field is added to the trips table or trip form.

**Reasoning:**
The PRD specifies a "Reason for Travel" column in the PDF but does not specify a distinct form field for it — the trip form has a `notes` field which serves the same semantic purpose. Adding a separate field would require a DB migration and an extra input in the trip form for marginal gain. Users who want to capture travel reasons can use the notes field.

**Alternatives considered:**
- Add a `reason_for_travel` column to `trips` table — requires migration, extra UI. Deferred.

**Consequences:**
The trip form's "Notes" field implicitly serves as "Reason for Travel" for ILR report purposes. This should be noted in the trip form placeholder text and/or help copy in a future iteration.

**Related:** PRD Section 4g; `src/lib/pdf/reportDocuments.tsx`; `src/app/(app)/(main)/trips/`

---

### [DECISION-026] Account deletion is a hard delete in v1
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
`deleteAccountAction` performs an immediate hard delete: trips → subscriptions → profiles → auth user (via admin client). The PRD §4h data retention policy ("soft-deleted, retained 30 days") is not implemented in v1.

**Reasoning:**
Soft-delete with 30-day recovery requires a `deleted_at` column on all tables, a scheduled cleanup job (cron or Supabase Edge Function), and a recovery flow. None of these infrastructure pieces exist yet. For v1, hard delete is safe and simpler. The 30-day retention policy is an aspirational goal that requires a post-launch engineering sprint to implement properly.

**Alternatives considered:**
- Add `deleted_at` column and soft-delete immediately — requires migration on all three tables and a scheduler.

**Consequences:**
Account deletion is irreversible in v1. The UI makes this explicit ("This action cannot be undone") and requires typing "delete my account" to confirm. Post-launch: add `deleted_at` to profiles/trips/subscriptions and a scheduled Edge Function to purge rows older than 30 days.

**Related:** PRD Section 4h; `src/app/(app)/(main)/settings/actions.ts`

---

### [DECISION-027] Stripe integration pattern: server-side API routes, client redirect
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Stripe Checkout and Customer Portal sessions are created via Next.js API route handlers (`POST /api/stripe/checkout`, `POST /api/stripe/portal`). The client fetches the session URL and performs `window.location.href = url` to redirect. Webhooks are handled at `POST /api/stripe/webhook` using `request.text()` for raw body access (required for Stripe signature verification). The production URL is `https://stayright.vercel.app` (Vercel project: stayright, linked to main branch). The Stripe webhook endpoint is `https://stayright.vercel.app/api/stripe/webhook` and `NEXT_PUBLIC_APP_URL` must be set to `https://stayright.vercel.app` in Vercel environment variables.

**Reasoning:**
API routes (not Server Actions) are used because Checkout and Portal session creation requires returning a URL to the client for redirect — Server Actions cannot return raw redirect URLs to the browser in this way. The webhook route requires raw body access for signature verification; App Router route handlers receive the raw body via `request.text()` without any parser configuration needed.

**Alternatives considered:**
- Server Actions for checkout — cannot return a URL for `window.location.href` redirect in a type-safe way without additional complexity.
- `@stripe/stripe-js` + client-side `redirectToCheckout` — deprecated by Stripe in favour of server-created sessions with URL redirect.

**Consequences:**
Three Stripe env vars must be set before payments work: `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME`. The Stripe webhook endpoint must be registered in the Stripe Dashboard pointing to `{NEXT_PUBLIC_APP_URL}/api/stripe/webhook` with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Webhooks are idempotent (upsert on `user_id`). Payment failures set `subscriptions.status = 'past_due'`, which triggers the red banner in the app layout.

**Related:** PRD Section 4j; `src/lib/stripe.ts`; `src/app/api/stripe/`; `src/components/app/trips/PaywallModal.tsx`

---

### [DECISION-028] Email notifications: Resend SDK, Vercel Cron Jobs, threshold deduplication via profile columns
**Date:** 2026-03-21
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Transactional email is delivered via the Resend SDK (server-only). Scheduled emails (monthly summary, daily threshold/reminder checks) run as Vercel Cron Jobs defined in `vercel.json`. Cron routes are protected by a `CRON_SECRET` env var checked against `Authorization: Bearer <secret>`. Threshold deduplication is handled by three new columns on `profiles`: `notified_120_day_at`, `notified_150_day_at`, `notified_monthly_summary_at`. The monthly cron uses idempotency (checks if already sent this calendar month). The return reminder uses departure_date arithmetic (fires for trips where `return_date IS NULL` AND `departure_date = today - 3`) to avoid a separate tracking column. The welcome email is sent in the auth callback immediately after `exchangeCodeForSession` succeeds for new users (detected by `created_at < 5 min ago`). All email sends are wrapped in try-catch so failures never block the user experience.

**Reasoning:**
Resend was chosen because it is the only provider currently in `.env.local.example` and it supports React Email / HTML string templates. Vercel Cron Jobs require no additional infrastructure (no separate cron service, no Supabase Edge Functions). Profile columns are the simplest deduplication mechanism that avoids a separate `notification_log` table. The departure_date arithmetic trick for return reminders avoids a `return_reminder_sent_at` column on trips at the cost of missing the reminder if the cron fails on that exact day.

**Alternatives considered:**
- Supabase Edge Functions with pg_cron — more complex infrastructure, harder to iterate on locally.
- `notification_log` table for deduplication — cleaner but requires schema migration + join query on every cron run.
- Return reminder via `return_reminder_sent_at` on trips — more robust but additional column + migration.

**Consequences:**
Five new env vars required: `RESEND_API_KEY`, `CRON_SECRET`. Domain `stayright.co.uk` must be verified in Resend before sending from `hello@stayright.co.uk`. Until domain is verified, use Resend's test domain. The migration `20260321000003_notification_tracking.sql` must be applied to production Supabase before the cron jobs run.

**Related:** PRD Section 4i; `src/lib/resend.ts`; `src/lib/email/templates.ts`; `src/app/api/cron/`; `vercel.json`

---

### [DECISION-040] Security: server-side paywall enforcement, isPlanPro utility, trip input validation
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** Grey-hat pentest (2026-03-22) + Claude (agent)

**Decision:**
Following a penetration test that identified 2 Critical, 1 High, and 2 Medium findings, the following security fixes were implemented as a single coherent change:

**C-1 / C-2 — Free tier quota enforced in every trip write Server Action:**
`addTripAction` (main), `saveTripAction` (onboarding) now fetch the user's subscription plan and status and count existing trips before performing any DB insert. If the user is Free-tier (or past_due/unpaid) and already has ≥ 3 trips, the action returns `{ error: '...' }` without touching the database. The `PaywallModal` in the UI remains as UX only. The invariant is: no trip insert can bypass the quota gate, regardless of how the Server Action is called.

**H-1 — Past_due/unpaid subscriptions lose Pro access:**
A new shared utility `isPlanPro(plan, status)` in `src/lib/subscriptionUtils.ts` is the single source of truth for Pro access checks. It returns `false` when `status` is `past_due` or `unpaid`. All seven locations that previously computed `isPro` from `plan` alone were updated to use `isPlanPro()`. These are: `trips/page.tsx`, `reports/page.tsx`, `dashboard/page.tsx`, `trips/plan/page.tsx`, `trips/log/page.tsx`, `trips/[id]/edit/page.tsx`, and `api/cron/daily/route.ts`.

**M-1 / M-2 — Server-side input validation on all trip write actions:**
A new utility `validateTripFields()` in `src/lib/tripValidation.ts` validates destination length (≤ 200 chars), notes length (≤ 1000 chars), and date format (strict YYYY-MM-DD regex — rejects Postgres fuzzy formats like `'epoch'`, `'tomorrow'`, `'Jan 1 2025'`). Called at the top of `addTripAction`, `updateTripAction`, and `saveTripAction` (onboarding) before any other logic.

**M-3 — Webhook replay (documented, deferred):**
`handlePaymentFailed` uses a plain `.update()` which is not idempotent under replay. Fixing this requires a `processed_webhook_events` table. Logged as a known gap; low exploitability (requires Stripe dashboard access or captured webhook secret). Deferred to v1.1.

**L-1 — Rate limiting (documented, deferred):**
No rate limiting middleware exists. PRD §4o specifies limits but none are implemented. Deferred to v1.1. Supabase Auth has its own rate limits on auth endpoints; the main risk is the Stripe checkout endpoint being hammered. Not exploitable for data access.

**Regression tests:**
`src/__tests__/subscriptionUtils.test.ts` (12 tests) — covers `isPlanPro()` for all plan/status combinations including C-1/C-2/H-1 scenarios.
`src/__tests__/tripValidation.test.ts` (18 tests) — covers `validateTripFields()` for all M-1/M-2 scenarios including Postgres fuzzy dates.
Test runner: vitest (`npm test`). Config: `vitest.config.mts`.

**Reasoning:**
The root cause of C-1/C-2 was the classic vibe-coding split: UI guards one thing, the Server Action guards another, and the two don't cover the same surface. The fix ensures the Server Action is the authoritative boundary. The root cause of H-1 was `isPro` being computed from `plan` alone; adding `status` to the check closes the payment-failure window. The `isPlanPro()` utility prevents future divergence by making the check a single importable function rather than an inline expression that can be written differently in each file.

**Alternatives considered:**
- DB-level trigger to enforce quota — would work but harder to surface as user-friendly error messages; also doesn't handle the subscription status check for the paywall.
- Middleware-level plan check — the paywall is not a route-level gate (Pro users and Free users share the same routes); it's a feature-level gate that must be evaluated per-operation.

**Consequences:**
1. `src/lib/subscriptionUtils.ts` and `src/lib/tripValidation.ts` are the mandatory entry points for all Pro access checks and trip field validation respectively. Any new Server Action that writes trips or gates features MUST import and use these.
2. All subscription DB selects must include `status` (not just `plan`) everywhere `isPlanPro()` is called.
3. M-3 (webhook replay) and L-1 (rate limiting) are logged as known gaps and must be addressed in v1.1.

**Related:** PRD Section 4j, 4o; `src/lib/subscriptionUtils.ts`; `src/lib/tripValidation.ts`; `src/__tests__/subscriptionUtils.test.ts`; `src/__tests__/tripValidation.test.ts`

---

### [DECISION-043] WCAG 2.2 AA Accessibility Compliance Architecture
**Date:** 2026-03-23
**Status:** Decided
**Decided by:** Accessibility Engineer 

**Decision:**
The application strictly targets WCAG 2.2 Level AA compliance. 
- Global animations and transitions respect `prefers-reduced-motion: reduce`.
- Global interactive elements (`<button>`, `<a>`, `<input>`) have high-visibility `:focus-visible` outlines. 
- Form validation errors use `role="alert"` and `aria-live="assertive"`.
- Modals and drawers implement focus trapping.
- Contrast on all text elements including status chips enforces a strict 4.5:1 ratio for normal text.

**Reasoning:**
The StayRight user base includes non-native English speakers, screen-reader users, and keyboard-only navigators in high-stress situations (visa compliance). Accessible inclusive design is non-negotiable. 

**Alternatives considered:**
- Best-effort accessibility fixes — rejected. Compliance must be comprehensive (WCAG 2.2 AA).
- Disabling outline styles globally — rejected. Focus visibility is a core AA requirement.

**Consequences:**
Future UI components must pass `@axe-core/playwright` automated tests added to the E2E suite. Manual checks must verify focus management and screen reader behavior for any new interactive component. Color palettes must maintain >=4.5:1 text contrast ratios.

**Related:** PRD.md Section 4; globals.css; tests/e2e/dashboards.spec.ts

---

### [DECISION-041] Known security gaps deferred to v1.1: webhook idempotency (M-3) and rate limiting (L-1)
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder) + Claude (agent)

**Decision:**
Two findings from the 2026-03-22 pentest are logged as known gaps and deferred to v1.1:

**M-3 — Webhook replay idempotency:**
`handlePaymentFailed` in `src/app/api/stripe/webhook/route.ts` performs an unconditional `.update({ status: 'past_due' })`. If the same `invoice.payment_failed` event is replayed after the user has resolved payment and the status has recovered to `active`, it would re-mark the subscription `past_due`. Exploitability is low — requires Stripe dashboard access or a captured webhook secret. Fix requires a `processed_webhook_events` table (`event_id text primary key, processed_at timestamptz`) and an idempotency check before each handler runs.

**L-1 — Rate limiting:**
No rate limiting exists on any endpoint. PRD §4o specifies 5/15min per IP on auth, 60/min per user on calculations, 10/hr per user on PDF generation. Supabase Auth has its own auth rate limits. The main gap is the Stripe checkout endpoint and scripted trip creation. Fix requires `@upstash/ratelimit` or Vercel edge rate limiting.

**Reasoning:**
Both are low-to-medium exploitability with no user data at risk. Both require meaningful infrastructure additions that are out of scope for the current sprint. Documenting them here ensures they are not forgotten and prevents future contributors from treating the current state as intentional.

**Consequences:**
These gaps remain open until v1.1. They do not block the current launch.

**Related:** DECISION-040; PRD Section 4j, 4o; `src/app/api/stripe/webhook/route.ts`

---

### [DECISION-042] Absence engine: ongoing trips counted with provisional return; Crown Dependency exact matching
**Date:** 2026-03-23
**Status:** Decided
**Decided by:** David Flynn-Coutts (mathematical audit)

**Context:**
A domain-specific audit of `absenceEngine.ts` against all 17 Home Office compliance test cases
identified two correctness bugs:

**BUG-1 — Ongoing trips yielded 0 absence days.** `getCurrentRollingWindow` skipped trips with
`return_date = null`. A user currently abroad saw no absence counted, potentially giving false
comfort that they were within their 180-day limit.

**BUG-2 — "New Jersey" matched as Crown Dependency.** `isCrownDependency` used substring
matching (`lower.includes('jersey')`), so any destination containing the word "jersey" — including
"New Jersey, USA" — was treated as UK presence and counted as 0 absence days.

**Decision:**

*BUG-1 fix:* In `getCurrentRollingWindow`, ongoing trips (null return) are given a provisional
return date of `today` (the window end) before passing to `tripDaysInWindow`. This ensures a
user who is currently abroad sees their accumulated absence days in the rolling window. The
`getPeakRollingWindow` function continues to skip ongoing trips — peak is a historical metric
over completed windows.

*BUG-2 fix:* `isCrownDependency` now uses exact matching: the full destination string OR its
last comma-separated component must equal one of the three canonical names ("jersey",
"guernsey", "isle of man"). "St Helier, Jersey" ✅. "New Jersey" ❌.

**Consequences:**
- Dashboard quota ring now reflects absence for users currently abroad.
- No false Crown Dependency matches for US state/city names.
- Test case TC4 in the audit spec had an incorrect expected value (87); correct value is 88.
  March has 31 days; with return on March 31, 30 March days count as absence, not 29.
- A full unit test suite (`absenceEngine.test.ts`, 40 tests) was created covering all 17 audit
  cases plus regression tests for both bugs.

**Related:** DECISION-002, DECISION-011, DECISION-018; `src/lib/calculations/absenceEngine.ts`;
`src/lib/calculations/absenceEngine.test.ts`

---

## Template for new entries

### [DECISION-030] PWA: manifest + offline service worker; push notifications deferred to v2
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Implement PWA as: (1) `src/app/manifest.ts` using the Next.js 16 file convention (no library), (2) a custom service worker at `public/sw.js` with cache-first for static assets and network-first with cache fallback for page navigations, (3) production-only SW registration via a client component. Push notifications are deferred to v2.

**Reasoning:**
- The manifest file convention in Next.js 16 requires no additional library.
- A custom SW avoids the complexity and maintenance overhead of `serwist`/`next-pwa` for the simple caching strategy needed in v1.
- SW is production-only to prevent stale Turbopack chunks interfering with local development.
- Push notifications require: VAPID key management, storing per-user push subscription objects in the DB, wiring sends into the cron job, and a SW push handler. This is substantial scope. Email notifications (Resend) already cover the same alert delivery requirement for v1.

**Caching strategy:**
- `/_next/static/*` — cache-first (immutable, content-addressed by Next.js build)
- Navigation requests (HTML pages) — network-first, offline fallback to last cached version
- `/api/*`, `/auth/*` — network-only (never cache live data or auth callbacks)
- Cross-origin (Supabase, Stripe, PostHog) — not intercepted

**Offline behaviour:**
Pages visited at least once while online are available offline in read-only mode. Users who have never loaded a page while online see a brief offline message.

**Consequences:**
- Push notification requirement from PRD §1.1 is deferred — PRD updated accordingly.
- Proper rasterised PNG icons (192×192, 512×512) should be designed before public launch; current icon is SVG (supported by Chrome/Edge/Firefox; Safari uses the apple-touch-icon meta tag).
- When `stayright.app` domain is live, verify SW scope and HTTPS (SW requires HTTPS — satisfied by Vercel).

**Related:** PRD §1.1 (scope), DECISION-028 (Resend email notifications)

---

### [DECISION-029] PostHog analytics: client-only SDK, consent-gated init, typed wrapper
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Use `posthog-js` (v1.x, Cloud EU) for product analytics, initialised client-side only when the user has accepted analytics cookies (`cookie_consent === 'accepted'`). A module-level `initialized` flag prevents double-init and gates all `track()` / `identifyUser()` calls. Events fire from client components only — no server-side `posthog-node` usage. PostHog identifies users by their Supabase UUID only (no name, email, or IP). All 11 events from PRD §4n are instrumented.

**Reasoning:**
- `posthog-js` is purely client-side — no serverless bundle concerns and no additional server infrastructure.
- The `initialized` guard keeps analytics silent until consent is explicitly given, satisfying PRD §4m (cookie consent) and GDPR.
- Cloud EU region (`eu.i.posthog.com`) means all data stays within the EU.
- Typed `track()` union enforces the exact event names from PRD §4n at compile time.

**Architecture decisions within this scope:**
- `PostHogProvider` wraps the root layout and listens for a `cookie-consent` custom window event dispatched by `CookieBanner` (native `storage` events don't fire in the same tab).
- `PostHogIdentify` renders in the app `(main)` layout, called once per authenticated session.
- `SignupTracker` fires `signup_completed` from the onboarding welcome page when `?signup=1` is present (set by auth callback for new users).
- `SkipButton` replaces the server action form to fire `onboarding_skipped` before calling `skipOnboardingAction()`.
- `UpgradeTracker` fires `upgrade_completed` on dashboard load when `?upgraded=1` is present (set by Stripe checkout success_url).
- `what_if_used` fires once on `TripFlowClient` mount when `mode === 'plan'`.
- `paywall_shown` includes a `trigger_reason` property; all PaywallModal callers pass a reason (`trip_limit`, `plan_mode_gate`, `log_mode_gate`, `pdf_export`).

**Alternatives considered:**
- Plausible — simpler but event tracking requires a custom server-side setup; PostHog has better funnel analytics for the signup/upgrade funnel.
- `posthog-node` for server-side events — rejected to keep the implementation simple (all events are user-initiated UI actions, not background jobs).

**Consequences:**
- PostHog project must be created at posthog.com (Cloud EU region). API key must be set as `NEXT_PUBLIC_POSTHOG_KEY` in Vercel environment variables.
- Basic dashboard to be created in PostHog showing: signup funnel, paywall conversion rate, PDF generation count (acceptance criterion in PRD §4n).
- If consent is later withdrawn (settings page), `optOutCapturing()` must be called.

**Related:** PRD §4m (cookie consent), PRD §4n (analytics), DECISION-027 (Stripe)

---

### [DECISION-031] Trip drawer: paywall behaviour — skip drawer, fire PaywallModal on TripsClient
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
When a free user at the 3-trip limit triggers the trip drawer (via "Plan a Trip", "Log a Past Trip", or any edit entry point), the drawer does **not** open. Instead, `setShowPaywall(true)` is called directly on `TripsClient`, firing the existing `PaywallModal` overlay. The drawer never renders paywall content. `PaywallModal` is unchanged.

**Reasoning:**
The drawer is a trip entry/edit form. Showing a paywall inside it would create a confusing experience — the user expects a form and gets a sales screen. The PaywallModal already handles this case cleanly as a standalone overlay. Keeping the two concerns separate also means zero changes to `PaywallModal` or its callers.

**Implementation rule:**
In `TripsClient`, before opening the drawer, check `!isPro && tripCount >= 3`. If true: `setShowPaywall(true)`, return early. Do not set drawer open state.

**Alternatives considered:**
- Render paywall inside the drawer — rejected. Confusing UX; the drawer is a form container, not a sales screen.
- Show inline paywall on the standalone plan/log pages as before — moot once those pages are replaced by the drawer.

**Related:** DECISION-020 (superseded by DECISION-031 drawer build), DECISION-021 (PaywallModal)

---

### [DECISION-032] Remove Recent Trips card from dashboard — status-only view
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** David Coutts

**Decision:**
The Recent Trips card (last 3 trips rendered inline on the dashboard) has been removed. The dashboard is now purely a compliance status screen: quota ring, qualifying period progress, ILR timeline, and quick-action CTAs. A compact summary line replaces the trip cards: "{n} trips logged · {n} days abroad recorded" with a "View all trips →" link to `/trips`.

**Reasoning:**
The dashboard's job is to answer "am I compliant?" at a glance. Rendering trip rows on the same screen duplicates the trips page, creates visual clutter, and distracts from the quota ring — the primary compliance indicator. The compact summary gives the same at-a-glance context (how many trips, total days) without the noise. Detailed trip history belongs on the dedicated `/trips` page.

**Alternatives considered:**
- Keep recent trips — rejected. Adds clutter without information value; the trips page is one tap away.
- Collapse recent trips behind a toggle — rejected. Unnecessary complexity; the compact summary achieves the goal more cleanly.

**Consequences:**
Dashboard page.tsx no longer imports `TripRow` or `getRiskStatus`. The `recentTrips` slice computation is removed. The compact summary replaces it with `tripCount` and `totalDaysAbroad` already computed in the dashboard.

**Related:** PRD §4e (dashboard), UX improvements plan

---

### [DECISION-033] Split name into first_name + last_name; defer last name to settings and PDF generation
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** David Coutts

**Decision:**
The user's name is split into two separate database columns: `first_name` (NOT NULL) and `last_name` (nullable). First name is collected at onboarding (visa setup step). Last name is deferred — it appears as an optional field in Settings → Visa Profile, and is only *required* when the user generates their first PDF export. If `last_name` is absent at PDF generation time, an inline prompt appears before the PDF is created: the user enters (or confirms) their first and last name, the record is saved to their profile, and the PDF generates immediately with the full name.

**Reasoning:**
Onboarding is the highest-anxiety moment in the product. The user has just signed up and wants to reach a populated dashboard as quickly as possible. Every additional required field is a reason to bounce. First name alone is sufficient for the dashboard greeting ("Good morning, David") and for identifying the user. Last name is not needed until the PDF export — which is also the moment the user has the highest motivation to provide it, because they are actively preparing documents for a Home Office application and want their name to appear correctly. Collecting last name at the point of maximum motivation rather than maximum friction is the better experience.

**Alternatives considered:**
- Collect full name at signup — rejected. Adds friction at the highest-anxiety point in the flow. Many people also don't use a "last name" in the same way (mononyms, compound names) and a mandatory single field forces awkward workarounds.
- Collect full name at onboarding visa setup step — rejected. Same reasoning as above; no feature at onboarding actually requires a last name.
- Single `name` column — rejected. Makes the PDF "last name required" check brittle (requires string splitting) and the settings UI awkward (one combined field vs. two clearly labelled fields).
- Ask for last name in settings only, not as a PDF pre-generation prompt — rejected. Users who never visit settings would be blocked at PDF generation with no clear path forward. The inline prompt is lower friction.

**Consequences:**
- `profiles` table: add `first_name text NOT NULL` and `last_name text` columns. If a `name` column already exists, write a migration to split it and drop the old column. Update all references in the codebase.
- Onboarding visa setup step: collects `first_name` only (required). No `last_name` field.
- Settings → Visa Profile: two fields — "First name" (required) and "Last name" (optional, helper text: "Used in PDF exports").
- Dashboard greeting: "Good morning, {firstName}".
- PDF generation in `ReportsClient`: check `profile.last_name` before generating. If absent, show an inline form (first name pre-filled and editable, last name required). On confirm, `upsert` the profile with both name fields, then proceed to generate. If present, generate immediately.
- PDF header: "Name: {firstName} {lastName}".

**Related:** PRD §4b (onboarding), §4g (PDF export), §4h (settings), DECISION-013 (database schema — profiles table)

---

### [DECISION-034] Shared utility modules for RISK_CONFIG and date formatting
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** Refactor agent

**Decision:**
Two shared utility modules were extracted during the March 2026 code review:

1. `src/lib/riskConfig.ts` — exports a single `RISK_CONFIG` constant (label, bg, text per risk status). Previously defined verbatim in both `TripFlowClient.tsx` and `TripsClient.tsx`.

2. `src/lib/utils/dateFormatters.ts` — exports `formatDate(iso: string)` and `formatDateRange(dep, ret)`. Previously, `formatDateRange` was defined identically in both trip client components; `formatDate` existed under different names (`formatDate`, `formatShort`, `fmt`) in four separate files.

**Reasoning:**
Duplicated constants and helper functions are a maintenance risk — a future change to risk colour tokens or date format would require finding and updating every definition site. Centralising them means a single edit propagates everywhere.

**Alternatives considered:**
- Leave in place — rejected. Two identical 20-line functions with zero divergence have no reason to be separate definitions.
- Co-locate with absenceEngine.ts — rejected. Formatting concerns belong in separate modules; the engine is pure business logic with no UI/locale dependencies.

**Consequences:**
Any future change to risk badge colours or date display format should be made in `riskConfig.ts` or `dateFormatters.ts` respectively — not in individual component files.

**Related:** DECISION-018 (absence engine as pure functions)

---

### [DECISION-035] HTTP security headers via next.config.ts
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** Security audit

**Decision:**
HTTP security response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`) are set globally via the `headers()` function in `next.config.ts`. The CSP uses `unsafe-inline` and `unsafe-eval` for the `script-src` directive to accommodate Next.js runtime script injection.

**Reasoning:**
Without these headers, the app was vulnerable to clickjacking (no `frame-ancestors` / `X-Frame-Options`) and had no CSP to reduce XSS blast radius. `unsafe-inline` is required by the Next.js App Router — the framework injects inline scripts for hydration. A nonce-based CSP that eliminates `unsafe-inline` is architecturally possible with Next.js `generateNonce()` but requires significant plumbing; deferred to post-launch hardening.

**Alternatives considered:**
- Nonce-based CSP — stronger, eliminates `unsafe-inline`; deferred post-launch (L3)
- Vercel headers via `vercel.json` — equivalent, but `next.config.ts` keeps security config co-located with the app

**Consequences:**
All responses from the app include the security headers. The `frame-ancestors 'none'` CSP directive and `X-Frame-Options: DENY` header together prevent clickjacking on all clients. The CSP `connect-src` list must be kept up to date if new third-party API connections are added. Post-launch: replace `unsafe-inline`/`unsafe-eval` with per-request nonces.

**Related:** PRD §4 (security requirements); OWASP A05 Security Misconfiguration

---

### [DECISION-036] Auth callback `next` parameter validated against open redirect
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** Security audit

**Decision:**
The `next` query parameter in `src/app/(auth)/auth/callback/route.ts` is passed through a `safeNext()` helper that rejects any value that does not start with `/` or that starts with `//` (protocol-relative URL). Invalid values fall back to `/dashboard`.

**Reasoning:**
Without validation, an attacker could craft a URL like `/auth/callback?code=<code>&next=//evil.com` — after URL decode, `${origin}//evil.com` could be mishandled by some HTTP clients as a redirect to an external host. The fix is minimal: a two-line guard that enforces same-origin relative paths only.

**Alternatives considered:**
- Allowlist of known safe paths — more restrictive but requires maintenance as new routes are added; the starts-with-`/` guard is sufficient for the threat model

**Consequences:**
Any `next` value that is not a valid relative path silently redirects to `/dashboard`. This is the correct secure default — the user lands in the app rather than being bounced out.

**Related:** OWASP A01 Broken Access Control; `src/app/(auth)/auth/callback/route.ts`

---

### [DECISION-037] RLS DELETE policies added for profiles and subscriptions
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** Security audit

**Decision:**
New RLS policies `profiles: owner delete` and `subscriptions: owner delete` were added via migration `20260322000004_add_owner_delete_policies.sql`. These allow authenticated users to delete their own rows using the anon-key client (i.e., from Server Actions).

**Reasoning:**
`deleteAccountAction()` called `supabase.from('profiles').delete()` and `supabase.from('subscriptions').delete()` using the regular (RLS-respecting) client. Without DELETE policies, both calls silently returned success with 0 rows affected — the data was only ultimately removed by `ON DELETE CASCADE` when the auth user was deleted. This masked the silent failure and created confusion about what was actually being deleted and when. Explicit policies make the code work as written.

**Alternatives considered:**
- Use admin client for all deletes — would bypass RLS entirely; this is a wider attack surface than needed, since users should be able to delete their own data
- Rely solely on ON DELETE CASCADE — works, but the explicit deletes in the action are misleading dead code; this option was rejected because it degrades code clarity

**Consequences:**
Users can now delete their own profile and subscription rows via the anon-key client. The `ON DELETE CASCADE` constraint remains as a safety net.

**Related:** DECISION-013 (database schema); DECISION-026 (hard delete v1); `supabase/migrations/20260322000004_add_owner_delete_policies.sql`

---

### [DECISION-038] Stripe customer deleted on account deletion (GDPR right to erasure)
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** Security audit

**Decision:**
`deleteAccountAction()` now fetches `stripe_customer_id` from the subscriptions table before deleting the DB row, then calls `stripe.customers.del()` to remove the Stripe customer object. Stripe deletion is wrapped in try/catch — failure is logged but does not block the auth user deletion.

**Reasoning:**
UK/EU GDPR right to erasure (Article 17) requires that all personal data be deleted on account deletion, including data held by third-party processors. Stripe customer objects contain billing name, email, payment method metadata, and invoice history — all personal data. The previous implementation deleted the DB subscription row (losing the `stripe_customer_id` reference) without ever calling Stripe's delete API, leaving PII in Stripe indefinitely.

**Alternatives considered:**
- Store stripe_customer_id in a separate table that survives the subscription row delete — unnecessarily complex; fetching before deletion is simpler and correct
- Block account deletion if Stripe deletion fails — too disruptive for users; the Stripe object is ancillary to the core deletion; log and continue is the right tradeoff

**Consequences:**
Stripe customer records are now deleted as part of account deletion. Note that Stripe retains anonymised financial records for legal/tax compliance per their own data retention policies — this is permitted under GDPR legitimate interests for tax/legal obligations. The app's obligation is to delete personally identifiable data, which this change fulfils.

**Related:** PRD §4h (account deletion); DECISION-026 (hard delete v1); GDPR Article 17; `src/app/(app)/(main)/settings/actions.ts`

---

### [DECISION-039] Password reset does not invalidate other sessions in v1
**Date:** 2026-03-22
**Status:** Decided
**Decided by:** Security audit

**Decision:**
In v1, `supabase.auth.updateUser({ password })` is called from the client (new-password page) and does not invalidate other active sessions for the same user. This is a known limitation documented here rather than fixed pre-launch.

**Reasoning:**
Invalidating all other sessions after a password change requires calling `supabase.auth.admin.signOut(userId, 'others')` server-side via the admin client. Implementing this correctly requires a new server action invoked after the client-side password update completes — adding auth complexity close to launch. The practical risk is low for v1: the app processes immigration data but not payment card data; session tokens expire on their own; and most users are solo accounts with no concurrent sessions.

**Alternatives considered:**
- Implement session invalidation pre-launch — the correct long-term approach; deferred to v1.1
- Force a full sign-out and re-sign-in after password change — simpler than admin signOut but poor UX

**Consequences:**
A session that was active at the time of a password reset will remain valid until natural expiry. Post-launch: implement admin `signOut(userId, 'others')` server action called from the new-password success handler.

**Related:** OWASP A07 Identification and Authentication Failures; `src/app/(auth)/auth/new-password/page.tsx`

---

Copy this template when adding a new decision:

### [DECISION-XXX] Short title
**Date:** YYYY-MM-DD
**Status:** Decided / Superseded / Under review
**Decided by:** [name or role]

**Decision:**
[What was decided — one paragraph]

**Reasoning:**
[Why this option was chosen]

**Alternatives considered:**
- [Alternative] — [why rejected]

**Consequences:**
[What this means going forward]

**Related:**
[Links to PRD sections, other decisions, open questions]

---

## Revision History

| Date | Version | What changed |
|------|---------|--------------|
| 2026-03-21 | 1.0 | Initial decision log — 6 founding decisions documented |
| 2026-03-21 | 1.1 | Added DECISION-007 — wireframe folder structure |
| 2026-03-21 | 1.2 | Added DECISION-008 — Tailwind v4 CSS config; DECISION-009 — root layout fonts |
| 2026-03-21 | 1.3 | Added DECISION-010 — multi-leg trips as single record; DECISION-011 — Crown Dependencies vs BOTs; DECISION-012 — monthly summary email format |
| 2026-03-21 | 1.4 | Added DECISION-013 — database schema (3 tables); DECISION-014 — Supabase client strategy; DECISION-015 — middleware session + route protection |
| 2026-03-21 | 1.5 | Added DECISION-016 — auth screens architecture (route group, server/client split, callback handler) |
| 2026-03-21 | 1.6 | Added DECISION-017 — onboarding state persisted via onboarding_completed column |
| 2026-03-21 | 1.7 | Added DECISION-018 — absence engine as pure functions; DECISION-019 — (main) route group with sidebar |
| 2026-03-21 | 1.8 | Added DECISION-020 — trip flow pages as standalone routes; DECISION-021 — paywall modal placeholder; DECISION-022 — calculateWhatIf uses return_date as today |
| 2026-03-21 | 1.9 | Added DECISION-023 — PDF generation library (@react-pdf/renderer) and client-side execution pattern |
| 2026-03-21 | 2.0 | Added DECISION-024 — recent exports deferred; DECISION-025 — notes→Reason for Travel; DECISION-026 — hard delete in v1 |
| 2026-03-21 | 2.1 | Added DECISION-027 — Stripe integration pattern (API routes, client redirect, webhook raw body) |
| 2026-03-21 | 2.2 | Updated DECISION-027 — production URL is stayright.vercel.app; Added DECISION-028 — Resend email notifications, Vercel Cron Jobs |
| 2026-03-22 | 2.3 | Added DECISION-029 — PostHog analytics (consent-gated, typed wrapper, 11 events from PRD §4n) |
| 2026-03-22 | 2.4 | Added DECISION-030 — PWA manifest + service worker; push notifications deferred to v2 |
| 2026-03-22 | 2.5 | Added DECISION-031 — trip drawer paywall behaviour (skip drawer, fire PaywallModal on TripsClient) |
| 2026-03-22 | 2.6 | Added DECISION-032 — remove Recent Trips card from dashboard (status-only view) |
| 2026-03-22 | 2.7 | Added DECISION-033 — split name into first_name + last_name; defer last name to settings and PDF generation |
| 2026-03-22 | 2.8 | Added DECISION-034 — shared RISK_CONFIG and date formatting utilities extracted from component files |
| 2026-03-22 | 2.9 | Security audit: DECISION-035 HTTP security headers; DECISION-036 auth callback open-redirect guard; DECISION-037 RLS DELETE policies; DECISION-038 Stripe GDPR erasure on account deletion; DECISION-039 password reset session invalidation deferred to v1.1 |
| 2026-03-22 | 3.0 | Pentest fixes: DECISION-040 — server-side paywall quota (C-1/C-2), isPlanPro utility (H-1), trip input validation (M-1/M-2); DECISION-041 — known gaps M-3/L-1 deferred to v1.1 |
| 2026-03-23 | 3.1 | Absence engine audit: DECISION-042 — fix ongoing-trip count (BUG-1) and Crown Dependency exact matching (BUG-2); create absenceEngine.test.ts (40 tests) |
