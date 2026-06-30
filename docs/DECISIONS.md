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
| DECISION-046 | Dashboard & Trips Consolidation | Converge dashboard and trips views into a single workspace; convert drawer to modal | Decided |
| DECISION-060 | Design System Pivot (Gold to Green) | Revert to green-tinted Dark Luxury palette for better alignment with semantic compliance colors | Decided |
| DECISION-061 | Semantic Token Architecture | Implementation of a full suite of CSS variables in tokens.css to replace hardcoded hex values | Decided |
| DECISION-062 | Monthly cron entitlement aligned with isPlanPro() | Removed past_due from monthly cron subscription filter; now matches isPlanPro() which excludes past_due/unpaid | Decided |
| DECISION-063 | Monthly cron bulk-fetches trips to eliminate N+1 query | Single .in(user_id, profileIds) query + in-memory grouping, mirroring daily cron pattern | Decided |
| DECISION-064 | Two-tier E2E testing strategy — smoke on push, full suite nightly | Smoke (12 tests, every push) + full suite (~50 tests, nightly); 3 auth personas; axe-core removed from E2E (amends DECISION-043) | Decided |
| DECISION-065 | Nav structure unified: edge-to-edge, 64px height, lg breakpoint for dashboard | Both navs share h-[64px], px-6 md:px-14, no max-width; dashboard hamburger shifts to lg to prevent overflow | Decided |
| DECISION-066 | Dashboard stat card grid: no intermediate 2-column breakpoint | Cards go 1→3 at lg only; 2+1 split at md was semantically wrong and visually awkward | Decided |
| DECISION-067 | Trips table: footer as single stat source; progressive column hiding | Toolbar stat removed (duplicated footer); Departure/Return hidden below md, Window below lg | Decided |
| DECISION-068 | Typography normalisation: unified type scale and weight consistency | 8 corrections: font-black fix, not-italic conflict, tracking/line-height/eyebrow size unified | Decided |

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
**Status:** Superseded by DECISION-071 (2026-05-20)
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

### [DECISION-004] Freemium model — free tier limit raised from 3 to 10 trips
**Date:** 2026-03-21 (revised 2026-03-28)
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder); revised following CPO audit recommendation

**Decision:**
The free tier allows up to 10 trips logged. Pro is £2.99/month or £24.99/year. No family tier in v1. No 14-day free trial — the free tier itself serves as the trial experience.

**Reasoning:**
The original 3-trip limit was reached within minutes of onboarding for a typical Skilled Worker visa holder (2–5 years of history, 10–30 trips). Forcing a credit card before the user sees a single meaningful calculation is a conversion killer. The CPO audit identified this as a [CRITICAL] churn risk. Raising the limit to 10 gives users enough room to enter meaningful history and experience a real calculation result before the paywall triggers. 10 trips still leaves the majority of active users below the ceiling while preserving a strong upgrade incentive.

**Alternatives considered:**
- 14-day free trial — rejected. Adds Stripe trial period complexity. The free tier already serves this purpose with less engineering.
- Keep at 3 trips — rejected. Causes churn at the most critical conversion moment (first calculation).
- No free tier (paid only) — rejected. Creates too much friction for a new product with no brand recognition.
- Family tier at £4.99/month — rejected for v1. Multi-tenancy adds significant complexity for marginal revenue. Validate demand first.

**Consequences:**
The paywall triggers at exactly 10 saved trips. `FREE_TRIP_LIMIT` constant in `src/lib/subscriptionUtils.ts` is the single source of truth — all server-side enforcement and client-side UI derive from it. Users can run unlimited what-if calculations but can only save 10 trips on the free tier.

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

[...]

### [DECISION-060] Design System Pivot (Gold to Green)
**Date:** 2026-03-24
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
Replaced the "Obsidian Champagne" (gold/warm) palette with a "Dark Luxury" (green-tinted) palette across the entire application. All hardcoded gold gradients, borders, and backgrounds were replaced with semantic CSS variables tied to the new green palette.

**Reasoning:**
While the gold palette felt premium, it created visual dissonance with immutable semantic colors (Safe/Safe+ badges are green). Using a green-tinted aesthetic allows the brand accent to feel coherent with the data-driven compliance status colors. The "Dark Luxury" variant (OLED black with #006948 accents) maintains the premium positioning while improving visual logic.

**Alternatives considered:**
- Keeping gold and changing semantic colors — rejected. Semantic colors (Green=Safe, Red=Breach) are industry standard and critical for speed-of-read in a compliance tool.
- Blue palette — rejected. Not the brand's original identity.

**Consequences:**
`tokens.css` is the source of truth. Any new components must use the semantic variables (e.g., `var(--color-green)`) instead of hardcoded hex values to ensure consistency and light/dark mode support.

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

### [DECISION-041] Security gaps: webhook idempotency (M-3) RESOLVED; rate limiting (L-1) still deferred
**Date:** 2026-03-22 (updated 2026-03-28)
**Status:** Partially resolved
**Decided by:** David Flynn-Coutts (founder) + Claude (agent)

**M-3 — Webhook replay idempotency: RESOLVED (DECISION-048)**
Implemented via `processed_webhook_events` table (migration `20260328000001`) and idempotency check in `src/app/api/stripe/webhook/route.ts`. See DECISION-048 for full detail.

**L-1 — Rate limiting: still deferred to v1.1**
No rate limiting exists on any endpoint. PRD §4o specifies 5/15min per IP on auth, 60/min per user on calculations, 10/hr per user on PDF generation. Supabase Auth has its own auth rate limits. The main gap is the Stripe checkout endpoint and scripted trip creation. Fix requires `@upstash/ratelimit` or Vercel edge rate limiting.

**Related:** DECISION-040; DECISION-048; PRD Section 4j, 4o; `src/app/api/stripe/webhook/route.ts`

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

### [DECISION-044] Core Web Vitals Optimization Architecture
**Date:** 2026-03-23
**Status:** Decided
**Decided by:** Performance Engineer

**Decision:**
To meet Core Web Vitals targets for mobile users on slow 4G connections, we:
1. Load PostHog analytics strictly after user consent (`localStorage.getItem('cookie_consent') === 'accepted'`), avoiding unused JS execution.
2. Implemented parallel data fetching (`Promise.all`) for Dashboard (`profile`, `trips`, `subscription`) to reduce TTFB and LCP.
3. Added a `useDebounce` hook to date inputs in `TripForm` and `TripFlowClient` to prevent expensive `calculateWhatIf` and `hasOverlappingTrip` executions on every keystroke, improving INP.

**Reasoning:**
Analytics scripts block the main thread and degrade INP/LCP; delaying them until consent solves both compliance and performance. Sequential Data fetching unnecessarily blocks rendering, parallelizing it optimizes FCP and LCP. Validating and checking overlaps synchronously on every character input causes micro-stutters; debouncing by 400-500ms keeps the UI responsive.

**Alternatives considered:**
- Server-side data prefetching — Not always possible for authenticated dynamic data per user without Vercel KV/Redis caching. Parallel component fetching is the Next.js App Router standard.
- Removing overlap warnings — Rejected. The UX value of live warnings is high, debouncing delivers the performance without sacrificing the feature.

**Consequences:**
Future data fetching in Server Components should use parallel `Promise.all` where queries do not depend on each other. Any intensive live calculations in Client Components based on user input must be wrapped in `useDebounce`. Third-party scripts must check consent before `import()`.

**Related:** PRD Section 6 (Performance)

---

### [DECISION-045] Visual Refinement: "Editorial Concierge" Aesthetic
**Date:** 2026-03-24
**Status:** Decided
**Decided by:** Lead Visual Designer

**Decision:**
The application UI has been deeply refactored away from a generic "SaaS template" look to a high-end "Editorial Concierge" aesthetic tracking to monotonic standards (e.g. Monzo, Linear, Wise). This involves:
1. **Typography**: Heavy contrast between precise Manrope display headers and readable Inter body text. Antialiased typography and manual letter-spacing scaling (`tracking-[-0.03em]`).
2. **Asymmetry & Layouts**: Landing page features use an asymmetric Bento Grid instead of uniform 3-columns. The Hero section uses variable width columns and dynamic height balancing.
3. **Tonal Layering & Materials**: Rigid borders have been eliminated across the sidebar and trip cards. Distinctions are made using `surface_container` level backgrounds (e.g., `#F8F9FA` canvas with `#FFFFFF` cards and `shadow-[0px_8px_32px_rgba(0,33,20,0.04)]` elevations).
4. **Micro-interactions**: Global `ease-[cubic-bezier(0.34,1.56,0.64,1)]` bouncy spring transitions and `active:scale-[0.98]` applied to all buttons, links, and drawers, respecting reduced-motion.

**Reasoning:**
StayRight manages high-stakes visa compliance; the UI must elicit absolute trust, permanence, and sophistication. A generic dashboard aesthetic signals cheapness, while an editorial aesthetic signals authority and care.

**Alternatives considered:**
- Strict standard implementation of Tailwind UI — Rejected due to the core brand requirement of establishing immense trust through bespoke layout and high-fidelity micro-interactions.

**Consequences:**
Future UI elements must refrain from using default 1px `#E2E8F0` borders and generic grays. They should instead use `#191C1D`/5 opacity rings and lush `#006948`/x tonal scales. Animations MUST respect spring dynamics defined in `globals.css`.

**Related:** `docs/DESIGN.md`, `src/app/globals.css`

**Decision:**
To meet Core Web Vitals targets for mobile users on slow 4G connections, we:
1. Load PostHog analytics strictly after user consent (`localStorage.getItem('cookie_consent') === 'accepted'`), avoiding unused JS execution.
2. Implemented parallel data fetching (`Promise.all`) for Dashboard (`profile`, `trips`, `subscription`) to reduce TTFB and LCP.
3. Added a `useDebounce` hook to date inputs in `TripForm` and `TripFlowClient` to prevent expensive `calculateWhatIf` and `hasOverlappingTrip` executions on every keystroke, improving INP.

**Reasoning:**
Analytics scripts block the main thread and degrade INP/LCP; delaying them until consent solves both compliance and performance. Sequential Data fetching unnecessarily blocks rendering, parallelizing it optimizes FCP and LCP. Validating and checking overlaps synchronously on every character input causes micro-stutters; debouncing by 400-500ms keeps the UI responsive.

**Alternatives considered:**
- Server-side data prefetching — Not always possible for authenticated dynamic data per user without Vercel KV/Redis caching. Parallel component fetching is the Next.js App Router standard.
- Removing overlap warnings — Rejected. The UX value of live warnings is high, debouncing delivers the performance without sacrificing the feature.

**Consequences:**
Future data fetching in Server Components should use parallel `Promise.all` where queries do not depend on each other. Any intensive live calculations in Client Components based on user input must be wrapped in `useDebounce`. Third-party scripts must check consent before `import()`.

**Related:** PRD Section 6 (Performance)

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
| 2026-03-23 | 3.2 | Core Web Vitals optimizations: DECISION-044 added for PostHog consent logic, parallel data fetching, and input debouncing |
| 2026-03-24 | 3.3 | Visual Refinement Project: DECISION-045 added to document the architectural rules for the "Editorial Concierge" aesthetic refactor |
| 2026-03-24 | 3.4 | UX Refinement: DECISION-046 added to document the consolidation of Dashboard and Trips screens and Modal conversion |

---

### [DECISION-046] Dashboard & Trips Consolidation
**Date:** 2026-03-24
**Status:** Decided
**Decided by:** UX Consultant

**Decision:**
The standalone `/trips` page has been removed. The full Trip Log is now rendered at the bottom of the `/dashboard` page. Additionally, the side-sliding Trip Drawer has been converted into a centered `TripModal`.

**Reasoning:**
Separating the trip log from the dashboard's Quota Ring created unnecessary friction for the core usecase: "Can I take this trip safely?". Users couldn't see the immediate impact of adding or editing a trip on the Quota Ring without navigating back and forth. Furthermore, a side-sliding drawer felt heavy and "SaaS-like", whereas a centered, glassmorphic modal feels like a lightweight calculation tool that fits the "Editorial Concierge" aesthetic perfectly.

**Alternatives considered:**
- Keeping the Trips page and adding a miniature Quota Ring to it — rejected as duplicating the primary dashboard UI unnecessarily.
- Using a side-drawer instead of a modal — rejected, the drawer animation and layout felt distinctly B2B/utilitarian compared to a focused, centered modal.

**Consequences:**
The `src/app/(app)/(main)/trips/page.tsx` route is deleted. The navigation sidebar no longer links to `/trips`. `DashboardDrawerWrapper` is renamed to `DashboardModalWrapper` and triggers a centered `TripModal`.

**Related:** PRD Section 4d, 4f; `docs/DESIGN.md`

---

### [DECISION-060] Design System Pivot (Gold to Green)
**Date:** 2026-03-24
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
The brand accent color is reverted from the previous gold/champagne (#A88730) to the original green-tinted "Dark Luxury" palette. This change is holistic, affecting the marketing site (Hero, Nav, Pricing) and the dashboard (Sidebar, QuotaRing, Status Chips).

**Reasoning:**
The previous switch to gold created a terminal visual conflict with compliance-critical colors that could not be changed — specifically the `#9FF4CA` "SAFE" green used in status badges and the QuotaRing's green arc. Gold and green in the same proximity felt visually cluttered and mismatched. Reverting to a deep OLED-black and vibrant green palette creates a high-end, editorial look while ensuring perfect coherence with all functional compliance indicators.

**Alternatives considered:**
- Redrawing all semantic compliance colors to match the gold palette — rejected. Immigration compliance has a deeply ingrained "green = safe" mental model that is dangerous to break for purely aesthetic reasons.

**Consequences:**
The application now uses a deep-green-tinted "Obsidian" surface (#080B08) and high-contrast green accents (#006948). All components have been refactored to use this new palette, ensuring a consistent premium feel across the entire user journey.

**Related:** `docs/DESIGN.md`, `tokens.css`, DECISION-061

---

### [DECISION-061] Semantic Token Architecture
**Date:** 2026-03-24
**Status:** Decided
**Decided by:** Design Engineering

**Decision:**
The design system's source of truth is migrated to a full semantic token architecture in `src/styles/tokens.css`. Direct hardcoded hex values are deprecated across the entire component tree and replaced with semantic CSS variables (e.g., `var(--color-bg)`, `var(--color-text-primary)`, `var(--color-green)`).

**Reasoning:**
StayRight requires a high-end "Editorial Concierge" aesthetic which is notoriously difficult to maintain manually across multiple screens. Using semantic tokens allows for:
1.  **Systemic Consistency:** Changes to the brand's primary green or surface obsidian can be made in a single file without chasing hex values.
2.  **Robust Theme Support:** Light and dark modes are handled automatically by swapping the values of the tokens within a single `@media (prefers-color-scheme: dark)` block.
3.  **Improved Contrast Auditing:** Semantic labels make it easier to verify that functional elements (like links or error states) have sufficient contrast against their background tokens.

**Alternatives considered:**
- Using utility-first Tailwind arbitrary values (`text-[#006948]`) — rejected. Leads to "hex drift" and makes maintaining a dual-mode high-end aesthetic extremely brittle.

**Consequences:**
Every new component must use semantic variables. The `tokens.css` file is the canonical reference for all styling. Global styles in `globals.css` are reduced to structural concerns, with all design identity residing in the tokens.

**Related:** `docs/DESIGN.md`, `tokens.css`, DECISION-060

---

### [DECISION-047] Absence engine window summation is de-duplicated against overlapping trips
**Date:** 2026-03-28
**Status:** Decided
**Decided by:** David Flynn-Coutts + CPO audit recommendation

**Decision:**
`getCurrentRollingWindow` and `getPeakRollingWindow` now collect per-trip absence intervals, merge any overlapping intervals, and count unique days — rather than summing raw per-trip day counts. The new private helpers `tripAbsenceInterval` (returns a clipped `{start, end}` pair or null) and `countDedupedDays` (merges and sums) implement this. The existing `tripDaysInWindow` is preserved for single-trip display calls (trip list row counts).

**Reasoning:**
The PRD (§4c) mandates that overlapping trips count each calendar day only once. While the UI's `hasOverlappingTrip` guard prevents overlaps at entry time, the engine had no defence against dirty data arriving via future bulk import, API bug, or admin DB edit. A CPO audit flagged this as a correctness risk: the calculation engine for a compliance tool must be idempotent regardless of data quality. The fix is O(T log T) per window evaluation — negligible cost.

**Consequences:**
If a user's data contains overlapping trips (which the UI would normally block), the engine now returns the correct, lower day count rather than an inflated one. No behaviour change for clean (non-overlapping) data. Any new function that sums days across multiple trips must use `countDedupedDays` rather than accumulating `tripDaysInWindow` directly.

**Related:** PRD §4c; DECISION-002; DECISION-018; `src/lib/calculations/absenceEngine.ts`

---

### [DECISION-048] Stripe webhook idempotency via processed_webhook_events table
**Date:** 2026-03-28
**Status:** Decided
**Decided by:** David Flynn-Coutts + CPO audit (M-3 finding)

**Decision:**
Idempotency is implemented for all Stripe webhook events via:
1. **Migration** `supabase/migrations/20260328000001_processed_webhook_events.sql` — adds `processed_webhook_events(stripe_event_id TEXT PRIMARY KEY, processed_at TIMESTAMPTZ)` with RLS enabled and no user-facing policies (service-role only).
2. **Handler check** — at the start of the `POST` handler in `src/app/api/stripe/webhook/route.ts`, after signature verification, the handler queries for `event.id`. If the row exists, it returns 200 immediately (idempotent replay). If not, it processes the event, then inserts `event.id` on success.

**Reasoning — the key property:** The insert happens *after* successful processing. This means:
- Stripe retry on handler failure (5xx) → event ID absent → retry is treated as new → correct behaviour.
- Stripe replay of already-processed event → event ID present → 200 returned without reprocessing → correct behaviour.
- Concurrent duplicate delivery (very rare with Stripe) → at most one will find the row absent and process; the other will either find it or also process (both paths result in the same idempotent DB write for most handlers).

The specific bug this closes: `handlePaymentFailed` previously issued an unconditional `UPDATE status = 'past_due'`. A replay after the user resolves payment would re-mark them as past_due, revoking Pro access incorrectly.

**Consequences:**
All 4 handled events are now guarded. The `processed_webhook_events` table will grow unbounded; a Postgres `pg_cron` or Supabase Edge Function cleanup job to purge rows older than 90 days is a v1.1 follow-up (Stripe does not retry events older than 3 days).

**Related:** DECISION-041; PRD §4j; `src/app/api/stripe/webhook/route.ts`; `supabase/migrations/20260328000001_processed_webhook_events.sql`

---

### [DECISION-049] Peak rolling window surfaced on dashboard
**Date:** 2026-03-28
**Status:** Decided
**Decided by:** David Flynn-Coutts + CPO audit recommendation

**Decision:**
`getPeakRollingWindow` is now called in `src/app/(app)/(main)/dashboard/page.tsx` and the result is displayed as a `PeakWindowCard` in the left column of the dashboard (below the quota ring, above the qualifying period bar). The card is only rendered when a `visaStartDate` is set and at least one completed (non-ongoing) trip exists.

**Reasoning:**
The dashboard previously showed only `getCurrentRollingWindow` — the 12-month window ending today. A user could be in a SAFE state today but have breached 6 months ago and be entirely unaware. For a compliance tool, the historical worst case is as important as the current status; surfacing it closes the information gap. The CPO audit flagged this as the most important compliance metric being buried in Reports.

**Consequences:**
`getPeakRollingWindow` is O(days × trips) — for a 5-year visa holder with 30 trips, ~54,750 date operations per page load. Profiling confirms this runs in <5ms on the server; no caching needed at current scale. If user count grows significantly, a caching layer can be added without API changes.

**Related:** CPO audit; DECISION-005; `src/app/(app)/(main)/dashboard/page.tsx`; `src/lib/calculations/absenceEngine.ts`

---

### [DECISION-062] Monthly cron entitlement aligned with isPlanPro()
**Date:** 2026-03-30
**Status:** Decided
**Decided by:** Developer audit recommendation

**Decision:**
The monthly summary cron (`src/app/api/cron/monthly/route.ts`) previously filtered subscriptions with `.in('status', ['active', 'past_due'])`, granting `past_due` users a monthly email. This was inconsistent with `isPlanPro()` in `src/lib/subscriptionUtils.ts`, which explicitly excludes `past_due` and `unpaid` from Pro access. The filter has been changed to `.in('status', ['active'])` only.

**Reasoning:**
`past_due` means a payment has failed and Stripe is in its retry window. The user's Pro features (PDF export, unlimited trips) are already gated at the server-action layer via `isPlanPro()` which excludes `past_due`. Sending a monthly summary email to a `past_due` user while their other Pro features are suspended is an inconsistent experience and creates support confusion. Aligning the cron with `isPlanPro()` makes entitlement uniform across all surfaces.

**Consequences:**
`past_due` users will not receive monthly summary emails. They will resume receiving them once their subscription returns to `active` (Stripe retries successfully). No data migration needed.

**Related:** DECISION-040; `src/lib/subscriptionUtils.ts`; `src/app/api/cron/monthly/route.ts`

---

### [DECISION-064] Two-tier E2E testing strategy — smoke on push, full suite nightly
**Date:** 2026-03-30
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Playwright E2E tests are split into two tiers:

1. **Smoke suite** (`tests/e2e/smoke.spec.ts`, `playwright.smoke.config.ts`) — 12 critical-path tests that run on every push to `main`. Chromium only, 1 worker serial. Covers auth redirects, dashboard load, calculation regression (TC1–TC4), and one DB roundtrip. Runs against a local Supabase instance in CI; completes in ~2 minutes.

2. **Full suite** (7 spec files, `playwright.config.ts`) — ~50 tests covering all major flows (auth, landing, onboarding guards, dashboard, trip CRUD, calculations, paywall, settings, reports). Runs nightly at 2am UTC via `.github/workflows/e2e-nightly.yml`.

**Auth personas:** Three dedicated test users are seeded via `supabase/seed.sql`:
- `testuser@stayright.test` — smoke user; low trip count so the paywall never triggers
- `e2e-free@stayright.test` — free plan, seeded with exactly 10 trips (= `FREE_TRIP_LIMIT`) so the PaywallModal is guaranteed to appear; used only for paywall tests
- `e2e-pro@stayright.test` — `pro_lifetime` plan; used for all tests that need to open the trip modal (calculations, CRUD, PDF download)

**`axe-core` removed from E2E (amends DECISION-043):** Accessibility axe-core scans were included in the original spec files but removed because they caused flaky CI failures unrelated to application behaviour (e.g., Next.js dev-mode style injection produced transient contrast violations). Accessibility compliance is now maintained via manual review against WCAG 2.2 AA before each release and static analysis. The axe-core decision in DECISION-043 is superseded by this policy for the E2E layer; the WCAG architectural commitments in DECISION-043 (focus states, reduced-motion, semantic HTML) remain in force.

**`redirectTo` fix in `TripsTableClient`:** The `TripModal` on the `/trips` page was not passing `redirectTo` to `TripFlowClient`, causing save to always redirect to `/dashboard` regardless of origin. Fixed by passing `redirectTo={returnTo}` (where `returnTo` defaults to `'/trips'`). The dashboard modal continues to redirect to `/dashboard` via `TripFlowClient`'s own default.

**Reasoning:**
- The previous full suite (~150 tests × 3 browsers) was removed from CI (`ea2a379`) due to runtime and reliability problems. A two-tier approach restores confidence on every push without the full cost.
- Chromium-only is sufficient for a server-rendered Next.js app where cross-browser divergence is minimal. Firefox/Safari are deferred to manual QA until the full suite is stable.
- Serial execution (`workers: 1`) is required because the DB roundtrip test and other CRUD tests must not race.
- The free/pro persona split is necessary because `FREE_TRIP_LIMIT = 10` means a free user with 10 seeded trips hits the paywall on any modal open — using the same user for both paywall and modal tests would make one set mutually exclusive.

**Consequences:**
- Any test that opens `/trips?modal=plan` or `/trips?modal=log` must use the pro auth state; using the default free state will show the PaywallModal and fail.
- The smoke user (`testuser@stayright.test`) accumulates one trip per smoke run (DB roundtrip test). If >10 trips accumulate, `supabase/seed.sql` will need a cleanup step or the smoke user will hit the paywall. Monitor and address if needed.
- `axe-core` is no longer a dev dependency for E2E tests.

**Related:** DECISION-043; `tests/e2e/smoke.spec.ts`; `playwright.smoke.config.ts`; `playwright.config.ts`; `supabase/seed.sql`; `.github/workflows/e2e.yml`; `.github/workflows/e2e-nightly.yml`; `docs/TESTING.md`; `src/components/app/trips/TripsTableClient.tsx`

---

### [DECISION-063] Monthly cron bulk-fetches trips to eliminate N+1 query
**Date:** 2026-03-30
**Status:** Decided
**Decided by:** Developer audit recommendation

**Decision:**
The monthly cron previously fetched trips with one `SELECT … WHERE user_id = ?` query per profile inside the processing loop (N+1 pattern). It now fetches all trips for all profiles in a single query with `.in('user_id', profileIds)` and groups them in-memory using a `Map<string, TripRow[]>` before the loop. This mirrors the existing pattern in the daily cron (`src/app/api/cron/daily/route.ts`).

**Reasoning:**
N+1 queries degrade linearly with user count. At 100 Pro users the monthly cron issued 100+ trip queries; at 1,000 users this would be a sustained DB load spike on the first of every month. The bulk-fetch pattern keeps the cron to a bounded number of queries regardless of scale, matching the already-proven approach in the daily cron.

**Consequences:**
The monthly cron now issues one trips query instead of N. The in-memory grouping is O(total trips), which is negligible. Trips are still ordered by `departure_date` ascending via the Postgres `ORDER BY` clause applied before grouping.

**Related:** DECISION-048; `src/app/api/cron/daily/route.ts`; `src/app/api/cron/monthly/route.ts`

---

### [DECISION-065] Nav structure unified: edge-to-edge, 64px height, lg breakpoint for dashboard
**Date:** 2026-03-31
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Both the marketing `Nav` and the authenticated `TopNav` now share the same structural rules:
- Height: `h-[64px]` (was 62px landing / 60px dashboard)
- Horizontal padding: `px-6 md:px-14` inside the header element; no `max-width` container — content is always edge-to-edge so the logo stays pinned left and user controls pinned right at all viewport widths
- Dashboard mobile breakpoint shifted from `md` (768px) to `lg` (1024px) — at 768px the dashboard nav carried too many items (4 links + plan badge + name + avatar) and cropped on screen

**Reasoning:**
The mismatch in height and padding caused a visible shift as users navigated from the landing page into the app. The no-max-width approach was preferred over a shared `max-w-[1320px]` container because users wanted the logo and controls to remain at the true edge rather than drifting toward the centre on large screens. The `lg` breakpoint for the dashboard hamburger was driven by the density of items in the authenticated nav, which the marketing nav does not share.

**Alternatives considered:**
- Shared `max-w-[1320px] mx-auto` container in both navs — rejected because on ultra-wide displays content drifted toward the centre, which felt inconsistent with the edge-pinned dashboard aesthetic
- Keeping `md` breakpoint for dashboard — rejected because at 768px the full desktop nav cropped, cutting off the user identity pill

**Consequences:**
Both navs are now structurally identical except for their content and the mobile breakpoint. The mobile drawer top offset in `TopNav` updated from `top-[60px]` to `top-[64px]` to match. The dashboard logo text (`Stayright`) is now always visible, matching the landing page — previously it was hidden below the `sm` breakpoint.

**Related:** `src/components/marketing/Nav.tsx`; `src/components/app/TopNav.tsx`

---

### [DECISION-066] Dashboard stat card grid: no intermediate 2-column breakpoint
**Date:** 2026-03-31
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
The three stat cards (Current Window, Historical Peak, Qualifying Period) use `grid-cols-1 lg:grid-cols-3` with no `md:grid-cols-2` intermediate state. Below 1024px all three stack vertically; at 1024px+ they sit in a row.

**Reasoning:**
The `md:grid-cols-2` layout placed two cards side by side and the third alone below them — "Current Window" and "Historical Peak" next to each other and "Qualifying Period" orphaned on its own row. The three cards are conceptually a peer group (each is a different view of the same compliance data) and should appear together or not at all. Stacking until all three fit is cleaner than an awkward 2+1 split.

**Alternatives considered:**
- `md:grid-cols-2` with third card full-width — rejected because it created a false visual hierarchy (two cards "paired", one special) that does not reflect the data model
- `sm:grid-cols-3` — rejected because the cards have enough content that at 640px they would be too narrow to be readable

**Consequences:**
At 768px–1023px (tablet) all three cards are stacked. This is more scrolling than the 2-column layout but is semantically correct and matches the decision to keep a single consistent `lg` breakpoint for the dashboard (DECISION-065).

**Related:** `src/app/(app)/(main)/dashboard/page.tsx`; DECISION-049; DECISION-065

---

### [DECISION-067] Trips table: footer as single stat source; progressive column hiding
**Date:** 2026-03-31
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Two related changes to the trips table information architecture:

1. **Remove stat from toolbar**: The `{count} trips · {days} days abroad` line that appeared to the right of the search input was removed. This data is already present in the table footer ("Showing X of Y trips" and "Total days abroad: Z"). Duplicating it next to search was redundant and made the toolbar feel cramped.

2. **Progressive column hiding**: The table columns are now responsive — Departure and Return columns are hidden below `md` (768px); the Window at Departure column is hidden below `lg` (1024px). Destination, Days, and Actions are always visible. The full data remains accessible via the expandable row detail panel.

**Reasoning:**
On narrow viewports (375–767px) the table's 7 columns caused the Return date cell to wrap to two lines and the Window column to be clipped entirely. Rather than making all columns fixed-width or adding horizontal scroll, progressive hiding was chosen because Destination + Days is the minimum useful reading of a trip row — the user can always expand a row to see dates and window data. The footer always-inline decision (no stacking) was made because the two footer strings are short enough to fit side by side even at 375px.

**Alternatives considered:**
- Horizontal scroll on the table — rejected because it obscures that the page has more content; scroll-jacking on mobile is a poor UX pattern for data tables in a compliance context
- Fewer columns by default with a column chooser — rejected as over-engineering for a table that rarely exceeds 30 rows
- Keeping toolbar stat — rejected because the same data in two places creates confusion when search is active (toolbar shows total, footer shows filtered count)

**Consequences:**
On mobile (< 768px), users see Destination and Days. All other data is one tap away via row expansion. The footer stat is the canonical summary of visible trips.

**Related:** `src/components/app/trips/TripsTableClient.tsx`; DECISION-031

---

### [DECISION-068] Typography normalisation: unified type scale and weight consistency
**Date:** 2026-03-31
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
Eight targeted corrections applied across the landing page and dashboard to establish a coherent type system:

1. **`font-black` → `font-extrabold`** (`Hero.tsx`) — Manrope weight 900 is not loaded (only 300, 700, 800); browser was silently substituting 800. Corrected to explicitly use `font-extrabold` (800).
2. **`not-italic` + inline `fontStyle: italic` conflict resolved** (`Hero.tsx`, `Features.tsx`, `Pricing.tsx`) — the `<em>` gradient spans had `className="not-italic"` overriding italic, then `style={{ fontStyle: 'italic' }}` re-applying it. Now uses `className="italic"` with no inline `fontStyle`, relying on CSS cascade correctly.
3. **Heading letter-spacing unified to `-0.04em`** — dashboard `<h1>` ("Good afternoon…") used `-0.03em` while all marketing headings used `-0.04em`. Corrected to match.
4. **Body line-height unified to `1.65`** — hero subheadline used `1.72`, pricing/features subheadlines used `1.6`. Standardised to `1.65` as the correct value for 17px Inter on dark backgrounds.
5. **Eyebrow labels raised from `0.625rem` to `0.6875rem`** — "FEATURES" and "PRICING" section labels were 10px, below comfortable readability. Raised to 11px.
6. **Peak ring number `font-bold` → `font-extrabold`** — the Historical Peak ring number used weight 700 while the Qualifying Period used 800. Both now use `font-extrabold` for consistency.
7. **Hero mockup dates → `font-mono`** — date strings in the landing page mockup card used Inter; the real app renders all dates in JetBrains Mono. Mockup now matches.
8. **Dashboard subtext explicit font family** — `"Here's your compliance status."` `<p>` had no `font-[...]` class, relying on inheritance. Now explicitly declares `font-[family-name:var(--font-inter)]`.

**Reasoning:**
These are corrections to existing intent, not changes to the typographic direction. The font pairing (Manrope / Inter / JetBrains Mono) and overall scale were correct; inconsistencies had accumulated from components being built at different times without cross-referencing each other.

**Consequences:**
No visual changes visible to users except subtle: slightly tighter body text rhythm (1.65 vs 1.72/1.6), slightly larger eyebrow labels, and the mockup dates now rendering in mono. The `not-italic` fix has no visible effect but removes a fragile CSS specificity dependency.

**Related:** `src/components/marketing/Hero.tsx`; `src/components/marketing/Features.tsx`; `src/components/marketing/Pricing.tsx`; `src/app/(app)/(main)/dashboard/page.tsx`; DECISION-009; `.impeccable.md`



---

### [DECISION-069] signOut must always use scope:'local'
**Date:** 2026-04-05
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
All calls to `supabase.auth.signOut()` in the codebase must pass `{ scope: 'local' }`. The default Supabase scope is `'global'`, which revokes every active session for that user across all devices.

**Reasoning:**
The default global scope caused a silent but severe bug in the E2E test suite: the `no-auth` Playwright project runs `auth.spec.ts`, which logs in as the free test user and then signs out. Because `signOut()` was called without a scope, Supabase revoked all sessions for that user — including the refresh token stored in `free.json` by the `setup-free` project. Every subsequent `[chromium]` project test using `free.json` was then redirected to `/login`, producing 21 unexplained failures.

Beyond the test impact, global sign-out is wrong product behaviour: if a user has the app open in two tabs or on two devices, clicking "Sign out" in one should not silently sign them out everywhere without warning.

**`scope: 'local'`** revokes only the current session's refresh token on the Supabase server and clears local storage. Other sessions remain unaffected.

**Alternatives considered:**
- `scope: 'global'` as a deliberate product choice (e.g. "sign out everywhere" button in Settings) — acceptable if explicitly labelled; the default sign-out button must remain `'local'`
- `scope: 'others'` — signs out all other sessions but keeps current; not needed for a standard sign-out flow

**Consequences:**
Users who sign out on one device remain signed in on others. This is the expected behaviour for a standard "Sign out" action. A future "Sign out of all devices" option in Settings could use `scope: 'global'` explicitly.



---

### [DECISION-070] CSP: unsafe-eval removed; unsafe-inline retained as known gap
**Date:** 2026-04-13
**Status:** Decided
**Decided by:** David Flynn-Coutts

**Decision:**
`'unsafe-eval'` has been removed from the `script-src` CSP directive. `'unsafe-inline'` is retained in both `script-src` and `style-src` as a known limitation.

**Reasoning:**
`'unsafe-eval'` permits `eval()` and `new Function()` — a genuine XSS escalation vector. Next.js production builds do not require it; only the dev HMR runtime does. Removing it eliminates a clear security red flag at no cost to production behaviour.

`'unsafe-inline'` in `script-src` cannot be removed without implementing nonce-based CSP, which requires Next.js middleware injection of a per-request nonce into every inline script tag. This is a significant architectural change and is deferred. The risk is lower than `unsafe-eval` because inline scripts cannot be injected purely via XSS without also controlling HTML structure.

`'unsafe-inline'` in `style-src` is standard for React-based apps that use inline styles and CSS-in-JS at render time.

**Alternatives considered:**
- Nonce-based CSP for `script-src` — closes the `unsafe-inline` gap entirely, but requires middleware nonce generation, passed through the React tree, and applied to every `<script>` tag including Next.js's own. Deferred to a future hardening pass.
- Hash-based allowlisting — fragile under Next.js build hash changes; not practical.

**Consequences:**
Production CSP is materially stronger. `unsafe-eval` is gone. `unsafe-inline` remains as a documented, accepted limitation until nonce-based CSP is implemented.

**Related:** `next.config.ts`; DECISION-035

**Related:** `src/components/app/TopNav.tsx`; `src/components/app/Sidebar.tsx`; `docs/TESTING.md` (Auth session isolation section)

---

### [DECISION-071] Mobile app architecture — Flutter + direct Supabase + Edge Function
**Date:** 2026-05-20
**Status:** Decided
**Decided by:** David Flynn-Coutts (founder)

**Decision:**
Build a native mobile app (iOS + Android) using Flutter. The app communicates directly with Supabase via the official `supabase_flutter` SDK — no Next.js server involvement. The 180-day calculation engine is exposed as a new Supabase Edge Function (`calculate-absence`) that both the mobile app and any future clients can call. The web app is not changed; it continues to run its own local TypeScript copy of the engine.

Key decisions within this scope:
- **Flutter** — one codebase for iOS and Android; Dart tooling isolated in a separate GitHub repo (`stayright-mobile`)
- **Direct Supabase** — Flutter SDK with the anon key + RLS; no new Next.js API routes
- **Edge Function** — `supabase/functions/calculate-absence/index.ts` ports `absenceEngine.ts` (349 lines, zero deps) to Deno TypeScript; accepts optional `hypothetical_trips` and `projection_date` for the what-if simulator
- **Web handoff for billing** — no in-app purchases; users tap "Manage account" → `url_launcher` opens `https://stayright.vercel.app/settings`; avoids Apple IAP requirement (App Store guideline 3.1.1)
- **Separate repo** — `stayright-mobile`; Flutter tooling (pubspec.yaml, android/, ios/, .dart_tool/) does not pollute the Next.js repo
- **State management** — Riverpod (StreamProvider wraps Supabase real-time streams)
- **Navigation** — go_router (required for magic link deep link handling)

Auth: email + password and magic link (email OTP) in v1. Google Sign-In deferred to v2.

**Reasoning:**
Flutter produces a single Dart codebase for both platforms with near-native performance and strong Supabase SDK support. Direct Supabase SDK access with RLS is the correct security boundary — the existing RLS policies on `trips`, `profiles`, and `subscriptions` already enforce per-user isolation. Adding Next.js REST API routes would create unnecessary infrastructure coupling; the mobile app should be independently deployable.

The Edge Function is additive: the web app is not disrupted. Maintaining the engine in two places (TypeScript + Deno) is an accepted tradeoff — the 180-day Home Office formula rarely changes and the Deno port is a near-verbatim copy of the original.

Web handoff for billing avoids the significant complexity of Apple In-App Purchase (30% platform commission, separate price management, App Store review requirements for IAP), while still allowing Pro users to manage their subscriptions. Pro status is read from the `subscriptions` table via the Flutter SDK, so users who subscribed on the web automatically see their Pro tier in the app.

**Alternatives considered:**
- React Native — rejected. Dart/Flutter is better supported by the Supabase Flutter SDK; stronger type safety for a compliance tool.
- PWA only — already in place (DECISION-030); native app adds home-screen presence, push notifications in v2, and a more polished mobile experience for a compliance-critical product.
- Next.js REST API layer for Flutter — rejected. Adds Next.js as a runtime dependency for the mobile app; RLS handles security at the DB level without additional server logic.
- Monorepo — rejected. Flutter tooling (Android Gradle, CocoaPods, `.dart_tool/`) would pollute the Next.js project root with no shared code benefit.
- In-app purchase — rejected. 30% commission on all Pro subscriptions; separate price management for Apple/Google vs web; significant additional review and approval complexity.

---

### [DECISION-072] TripModal desktop width raised to 600px
**Date:** 2026-05-21
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
`TripModal` desktop width increased from `w-[480px]` to `w-[600px]`. `md:max-h` raised from `85vh` to `90vh`. The `max-w-xl` constraint on the inner `TripFlowClient` wrapper div was removed — the modal itself controls the width; the inner constraint was redundant and would have clipped the wider modal's padding asymmetrically.

**Reasoning:**
480px is ~33% of a 1440px viewport. The modal appeared unusably small at full-screen. 600px (~42%) is the standard sweet spot for a focused multi-step form dialog — wide enough to be comfortable, narrow enough to stay focused. There is no case for making it wider than this; the 3-step form content does not benefit from extra width beyond 600px.

**Alternatives considered:**
- Responsive width (`min(90vw, 600px)`) — unnecessary; the mobile bottom-sheet already handles small screens via the existing `md:` breakpoint split.
- Right-side panel (full-height drawer) — considered as part of DECISION-046; centred modal was chosen for focus. This decision does not revisit that choice.

**Consequences:**
- `supabase/functions/calculate-absence/index.ts` — new Edge Function; must be kept in sync with `src/lib/calculations/absenceEngine.ts` if the Home Office formula ever changes
- DECISION-003 ("no native mobile app in v1") is superseded by this decision
- The Apple App Store submission must not show any in-app purchase UI; the billing section must use neutral language ("Manage your StayRight account") to avoid App Store review rejection under guideline 3.1.1
- MVP feature set: dashboard (quota ring, ILR timeline), trip log (CRUD), what-if simulator, settings (visa profile, notification prefs, account)
- Push notifications deferred to v2 (Firebase Cloud Messaging)
- Google Sign-In deferred to v2

**Related:** DECISION-002, DECISION-003 (superseded), DECISION-011, DECISION-018, DECISION-022, DECISION-042; `supabase/functions/calculate-absence/index.ts`; `src/lib/calculations/absenceEngine.ts`

---

### [DECISION-073] TripModal stable height: 680px width, CSS-grid step stacking, two-column Step 2
**Date:** 2026-05-21
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
Three coordinated changes to make TripModal stable-height across all steps:

1. **Width 600→680px, max-h→92dvh.** 680px gives the two-column Step 2 layout enough room for a usable inline calendar (~346px at 3fr) while remaining comfortably within a 900px viewport. `max-h` raised from `90vh` to `92dvh` to use more vertical space on smaller screens. Amends DECISION-072.

2. **CSS-grid step stacking.** All three steps are rendered simultaneously (`gridArea: '1 / 1'`). Inactive steps are hidden with `visibility: hidden`, `pointer-events: none`, `aria-hidden`, and `inert`. The container height locks to the tallest step (Step 2) and never changes as the user navigates — no modal resize, no layout shift. Focus trap in TripModal updated to filter out `inert` descendants.

3. **Two-column Step 2.** `DateRangePicker` occupies the left column (3fr); a live compliance panel occupies the right column (2fr). The compliance panel is always rendered: it shows CalcPanel when dates are valid, a Crown Dependency notice for Crown Dep destinations, and a placeholder ("Enter dates to see your compliance impact") otherwise. Validation errors for Step 2 appear in the right column, above the panel, so they do not push the calendar out of view. Back/Next buttons sit below the right column.

**Reasoning:**
The old layout had two bugs: (a) the validation error banner in Step 1 pushed the Next button below the modal's visible area; (b) Step 2 stacked the inline calendar (~400px) and CalcPanel (~154px) vertically, making the modal ~856px tall — too tall for a 900px screen. The two-column layout reduces Step 2's height to ~500px total (the calendar height sets the row height; the right column is shorter), which fits on a 900px screen.

Simply locking the modal to Step 2's old (tall) height was rejected: it would have overflowed a 900px screen. A compact date-input alternative was rejected as a UX regression. CSS-grid stacking was chosen over JS height measurement to avoid flicker and runtime dependency on DOM layout.

The two-column layout also improves UX: users see the compliance panel placeholder immediately on arriving at Step 2, signalling that picking dates will show a live impact calculation.

**Consequences:**
- Inner card padding reduced from `p-6 md:p-8` to `p-5 md:p-6` to recover horizontal space for the two-column layout.
- `TripModal.tsx` focus trap updated: `getFocusables()` now filters out elements inside `[inert]` containers so inactive steps' inputs are not included in the trap cycle.

**Related:** DECISION-031, DECISION-046, DECISION-072

---

### [DECISION-074] Reskin foundation — green-led/obsidian palette remap + Bricolage/Hanken fonts
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
First phase of the prototype reskin (full plan: `docs/RESKIN-PLAN.md`). Three foundation changes, values only — token and CSS-variable **names are unchanged** so every existing component inherits without edits:

1. **Palette remap (`src/styles/tokens.css`).** Retire the "Sage & Stone" taupe/forest values; adopt the prototype's green-led / obsidian palette: light bg `#F4F0E8`, dark bg `#08090C`; green leads (`#006948` light / `#1AA873` dark); status colours solid (amber/red per mode); green/status/safe tokens now overridden per theme in `.dark`. Added a new `--color-teal` token (`#0E7C8F` light / `#46C7D1` dark) — a **secondary accent only** (highlights, timeline, "planned").
2. **Fonts (`src/app/layout.tsx`).** Manrope→**Bricolage Grotesque** (headings), Inter→**Hanken Grotesk** (body); JetBrains Mono + Instrument Serif unchanged. Loaded into the existing `--font-manrope` / `--font-inter` variable slots so the ~150 existing usages inherit; variables to be renamed `--font-heading`/`--font-body` in the reskin cleanup phase.
3. **`globals.css`** exposes `--color-teal` (and the previously-missing `--color-text-3`) in the Tailwind `@theme` block.

**Reasoning:**
The prototype is the source of truth for look. Remapping token *values* (not names) lets the whole app re-skin by inheritance, keeping the diff small and reviewable. Verified: `tsc --noEmit` clean, ESLint clean, 124 unit tests pass, `next build` compiles and the new Google fonts resolve.

**Consequences:**
- `.impeccable.md` token table updated to match (was stale — described a `#F5FAF7` green-tint light bg never shipped).
- The legacy `--font-manrope`/`--font-inter` variable names now point at non-Manrope/Inter fonts until the cleanup-phase rename.
- The PDF engine (`src/lib/pdf/reportDocuments.tsx`) keeps its hardcoded print-targeted `#006948` — intentionally not token-driven.

**Related:** DECISION-006, DECISION-008, DECISION-009; `docs/RESKIN-PLAN.md`

---

### [DECISION-075] Reskin Phase 1 — app shell migrated from TopNav to a persistent left sidebar
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
Realises DECISION-019 (the shell was a top bar in practice). The authenticated `(main)` shell is now a persistent **left sidebar** on desktop and a **bottom nav + FAB** on mobile (reskin plan: `docs/RESKIN-PLAN.md`).

- `AppSidebar.tsx` (new): fixed 260px left sidebar (`hidden lg:flex`) — logo, four nav items (Dashboard/Trips/Reports/Settings) with icons + active state, footer with `ThemeToggle` and an account card whose popover holds Settings + Sign out.
- `AppMobileNav.tsx` (new): a slim sticky top bar (logo + theme + account menu) and a fixed bottom nav with a centered raised **FAB**. The FAB deep-links to `/trips?modal=log`, reusing TripsTableClient's existing `?modal=` URL-driven modal (no global modal needed).
- `MainLayoutClient.tsx`: renders both shells responsively; content wrapper is offset `lg:pl-[260px]` and padded `pb-24` on mobile for the bottom nav. Analytics trackers + payment-failed banner preserved.
- `TopNav.tsx` / `MobileNav.tsx` are now unused — retained until the Phase 9 cleanup to keep diffs reviewable.
- Sign-out keeps `signOut({ scope: 'local' })`.

**Reasoning:**
The prototype's signature shell is a left sidebar; a bottom-nav + FAB is the standard mobile pattern and surfaces "Log trip" as the primary action. Reusing the `?modal=` deep link avoids a global modal/context. Verified: `tsc --noEmit` clean, ESLint clean, `next build` compiles, 124 unit tests pass; `auth.spec.ts` logout selector updated (User menu → Account menu).

**Consequences:**
- E2E specs that drive nav by visible link text still work; only the account-menu label changed.
- Browser screenshot verification deferred — the preview/Chrome MCP tooling disconnected during a session reset.

**Related:** DECISION-019, DECISION-069 (signOut scope); DECISION-074; `docs/RESKIN-PLAN.md`

---

### [DECISION-076] Reskin Phase 2 — dashboard recompose: rolling-window timeline + bento
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
The dashboard is recomposed around the signature rolling-window timeline and a trimmed bento (reskin plan: `docs/RESKIN-PLAN.md`). The circular QuotaRing is retired as the hero.

- **`RollingWindowTimeline.tsx`** (new): hero verdict whose word + colour **derive from `getRiskStatus`** (so 124 days reads WARNING/amber, never a green "you're safe"); a 0–180 track with **watch lines at 120 and 150** (the prototype's 160/170 corrected to the real thresholds); a trailing-12-month trip span strip with a "today" marker. The verdict word carries the status — there is no separate "Compliant/Approaching" status chip in the window header (removed as redundant).
- **`AbsenceHeatmap.tsx`** (new): GitHub-style 7×52 daily-absence grid over the trailing year.
- **`PeakTrajectoryChart.tsx`** (new): SVG sparkline of the rolling-window value across the qualifying span with a dashed 180 line and the peak marked. Backed by a new pure engine helper **`getRollingWindowSeries`** (additive; 5 unit tests; existing exports unchanged).
- **`PlanTripSimulator.tsx`** (new): inline what-if reusing `calculateWhatIf` (projected to the trip's return date per DECISION-022) with **Save as planned** via the existing `addTripAction` (planned = future-dated trip, the derive approach from the reskin schema decision).
- Page bento: hero timeline → simulator → (heatmap + ILR countdown) → trajectory → recent trips. The header's "Plan trip" button is removed (the simulator covers planning); "Log trip" stays.

**Reasoning:**
The timeline is the brand's signature graphic and shows where absences fall against the limit — far more than a generic gauge. Deriving the verdict from `getRiskStatus` closes the prototype's incorrect "124 = safe/green" framing. The simulator reuses existing pure calculations and the existing server action, so no business logic changes. Verified: `tsc --noEmit` clean, ESLint clean, **129 unit tests pass**, `next build` compiles.

**Consequences:**
- `QuotaRing.tsx` / `PeakWindowCard` no longer referenced on the dashboard — retained until the Phase 9 cleanup.
- `dashboard.spec.ts` updated: ring tests → timeline/verdict; the "Plan trip" modal-link test → inline-simulator presence; "Log trip" + save round-trip unchanged.

**Related:** DECISION-002 (thresholds), DECISION-005 (compute don't store), DECISION-022 (what-if to return date), DECISION-074, DECISION-075; `docs/RESKIN-PLAN.md`

---

### [DECISION-077] Reskin Phase 3 — Trips recomposed to a list with badges, Crown chip, peak span + List/Timeline toggle
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
`TripsTableClient` is recomposed from a sortable table into the prototype's list (reskin plan: `docs/RESKIN-PLAN.md`).

- Header "Your travel history" with a **single header stat** (current rolling window N/180) plus mono meta chips (X abroad, Y planned).
- **Conditional row badges**, derived (no schema change, per the reskin schema decision): "Abroad now" (departed, no return — amber dashed), "Planned" (`departure_date > today` — teal dashed), "Crown Dependency" (neutral chip + tooltip).
- **Crown chip** shows the day count as `0d` with a "doesn't count" sub-label, value from `isCrownDependency`.
- **Peak-window-as-a-span**: an explainer banner (amber left edge) names the tightest 12-month window from `getPeakRollingWindow`; rows overlapping that window get an amber left edge.
- **List / Timeline toggle** — the Timeline is a NEW Gantt view (`TripsTimelineView.tsx`) plotting trips on a shared time axis with a today marker.
- Preserved: search, single delete (with the "Delete this trip?" dialog), edit, the trip modal, paywall, `?modal=` deep links, optimistic delete, and PostHog events.
- **Bulk delete retained** (per owner request): a hover-revealed per-row checkbox + a selection bar (select-all, Clear, "Delete N") with a confirmation dialog, calling the existing `bulkDeleteTripsAction`.
- **Dropped** (not in the prototype, not covered by tests): sortable column headers and the "window at departure" column.

**Reasoning:**
The prototype's list reads more like a travel record than a data grid, and surfaces the compliance-relevant signals (badges, peak window, day counts) directly. Planned/abroad/taken are derived from dates, keeping the `trips` schema frozen. Verified: `tsc --noEmit` clean, ESLint clean, `next build` compiles, 129 unit tests pass; confirmed both views visually.

**Consequences:**
- `trips.spec.ts` heading assertions updated ("Trip Log" → "Your travel history"); search + delete-dialog assertions unchanged.

**Related:** DECISION-005 (compute don't store), DECISION-011 (Crown Dependencies), DECISION-031 (trip modal), DECISION-074, DECISION-076; `docs/RESKIN-PLAN.md`

---

### [DECISION-078] Reskin Phase 4 — Reports restyled to an evidence pack (period selector + A4 live preview)
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
`ReportsClient` is recomposed from three download cards into the prototype's evidence-pack (reskin plan: `docs/RESKIN-PLAN.md`).

- Two-column layout: a left panel with a **period selector** (presets: Full qualifying period / Last 12 months / Calendar year / Custom range), a compliance chip, and the export controls; a right **A4 live preview** (`ReportPreview.tsx`).
- The live preview is an on-screen **mirror** of the `@react-pdf` absence record — letterhead, applicant + period meta, compliance statement, a 4-up summary (total days absent /180, rolling-window peak, days in period, compliance), the absence table, and footer. It derives the same figures from `absenceEngine` (not a second source of truth).
- **Same engine + route + Pro-gating preserved.** Presets map onto the existing report types: Full → `type=ilr`; Last 12 months / Calendar year / Custom → `type=custom` with computed `start`/`end`. The rolling-window history report is preserved as a secondary "Also export rolling-window history" action (`type=rolling`).
- **No "Previous reports" list** (D3 / DECISION-024 — reports are on-demand, no storage).
- `reports/page.tsx` now passes trips + profile (name, visa route, visa start) so the preview can render; `/api/reports/pdf` and `reportDocuments.tsx` are unchanged.

**Reasoning:**
A live A4 preview lets the user see exactly what they'll hand to the Home Office before exporting, which the three opaque download buttons did not. Reusing the existing PDF engine keeps a single export path and avoids divergence. Verified: `tsc --noEmit` clean, ESLint clean, `next build` compiles, 129 unit tests pass; confirmed visually at desktop width.

**Consequences:**
- `reports.spec.ts` rewritten for the new UI (heading "ILR evidence pack"; presets; "Upgrade to export" / "Export PDF"; custom-range validation). Paywall + download-event assertions preserved.

**Related:** DECISION-023 (client PDF), DECISION-024 (no export history), DECISION-025 (notes → reason), DECISION-074; `docs/RESKIN-PLAN.md`

---

### [DECISION-079] Reskin Phase 5 — Settings recomposed into six jump-nav sections
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
`SettingsClient` moves from three tabs to the prototype's six scrollable sections with a sticky jump nav + scrollspy (reskin plan: `docs/RESKIN-PLAN.md`).

- Sections: **Visa & ILR** (route, start date, ILR eligibility date shown once), **Account** (name, email, password), **Subscription & billing**, **Notifications & alerts**, **Appearance**, **Data & privacy**.
- Jump nav is a sticky left list with icons; an `IntersectionObserver` highlights the active section. All sections render on one page (anchor links scroll to each).
- **Subscription** shows **all four plans** (Free / Pro Monthly £2.99 / Pro Annual £24.99 / Pro Lifetime £49.99) as cards with the current plan marked; paid cards start Stripe Checkout (`/api/stripe/checkout`), recurring plans get a "Manage billing" portal link. Reuses existing Stripe wiring + `upgrade_clicked` event.
- **Notifications** maps onto the real five columns with corrected copy: **"Email me at 120 days"** / **"Email me at 150 days"** / return reminder / ILR reminder / monthly summary. Pro-gated.
- **Appearance** is a System / Light / Dark chooser backed by `next-themes` (mounted-guard to avoid hydration mismatch).
- **Data & privacy** holds export + the delete-account flow (confirmation text "delete my account" preserved).
- Server actions, the five notification columns, and Stripe routes are unchanged; name editing and visa editing both persist the full profile via `updateProfileAction`.

**Reasoning:**
A single scannable page with a jump nav matches the prototype and surfaces billing + appearance that were previously buried or absent. Verified: `tsc --noEmit` clean, ESLint clean, `next build` compiles, 129 unit tests pass; confirmed all six sections render (desktop).

**Consequences:**
- `settings.spec.ts` rewritten for the section nav (Visa & ILR / Account / Subscription / Notifications / Appearance / Data & privacy), four-plan prices, 120/150 copy; export + delete-confirmation assertions preserved.
- Added `CreditCard` + `Palette` to the Icons re-export.

**Related:** DECISION-017 (onboarding), DECISION-027 (Stripe checkout), DECISION-069 (signOut), DECISION-074 (pricing/plans), DECISION-078; `docs/RESKIN-PLAN.md`

---

### [DECISION-080] Reskin Phase 6 — Marketing landing reskin (hero timeline + comparison + how-it-works)
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
The landing is reskinned to the marketing prototype (`StayRight.dc.html`; reskin plan `docs/RESKIN-PLAN.md`).

- **Hero** (`Hero.tsx`): new headline "Travel freely. / Stay under 180. / Reach ILR." and the `QuotaRingMockup` is replaced with the app's **`RollingWindowTimeline`** as the signature graphic (consistent app↔marketing). It uses a **SAFE sample** (three sample trips → ~106/180, well under 120) so the verdict derives to a truthful green "You're safe"; watch lines render at **120 · 150** (the prototype's 160/170 corrected).
- **`Comparison.tsx`** (new): "spreadsheet vs StayRight" two-column ✕/✓.
- **`HowItWorks.tsx`** (new): three steps (Log your trips / We check every window / Know you're safe), anchored at `#how` for the hero's "See how it works".
- Page order: Nav → Hero → Comparison → Features → How-it-works → Pricing → Trust → Footer.
- **Features / Pricing / Nav / Footer / TrustBar kept** — they already inherit the Phase-0 palette/fonts and the pricing copy is already correct: Free shows "Up to 10 trips" (matches `FREE_TRIP_LIMIT`), all four plans are reachable (monthly/annual toggle + £49.99 lifetime), and there are no incorrect threshold numbers. No invented testimonials/credentials (`.impeccable.md` copy rule).

**Reasoning:**
The signature timeline is the brand's core graphic and now appears identically on marketing and in-app. The SAFE sample + 120/150 watch lines apply the reskin's "code wins" corrections to the marketing surface. The existing Features/Pricing were already on-brand and numerically correct, so they were left rather than rebuilt. Verified: `tsc --noEmit` clean, ESLint clean, `next build` compiles; hero + comparison + features confirmed rendering; `landing.spec` (h1 / £2.99 / cookie banner) unaffected.

**Related:** DECISION-002 (thresholds), DECISION-074 (palette/fonts), DECISION-076 (RollingWindowTimeline), DECISION-079; `docs/RESKIN-PLAN.md`

---

### [DECISION-081] Reskin Phase 7 — Onboarding restyled to the new design system (flow unchanged)
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
The existing 2-step onboarding flow is restyled to the reskin tokens/idioms; the flow, server actions, and analytics are untouched (reskin plan `docs/RESKIN-PLAN.md`, D4).

- Files restyled: `onboarding/layout.tsx`, `onboarding/page.tsx` (welcome), `onboarding/visa/VisaForm.tsx`, `onboarding/trips/TripForm.tsx`. All hardcoded hex (`#F8F9FA`, `#191C1D`, `#3D4A42`, `#006948`, `#00855D`, `bg-white`, `red-50`/`amber-50`, etc.) replaced with semantic tokens (`--color-bg`, `--color-surface`, `--color-text-*`, `--gradient-green`, `--color-danger-*`, `--color-warning-*`, `--color-green-pale`). The flow was previously light-only; it now **themes** (light + dark) like the rest of the app.
- Cards use the shared idiom (`bg-[var(--color-surface)] rounded-2xl border + var(--shadow-card)`); primary buttons use `var(--gradient-green)` + `var(--shadow-button)`; inputs use the surface-warm/border-strong field style; step labels and trip date ranges adopt the JetBrains-Mono eyebrow/data voice.
- **No flow change:** 2-step structure, progress dots, `saveVisaProfileAction`/`saveTripAction`/`deleteTripAction`/`completeOnboardingAction`, the `FREE_TRIP_LIMIT` quota guard, overlap detection, pre-visa note, mid-flow resume, and every PostHog event (`onboarding_visa_setup_completed`, `onboarding_trips_added`, `onboarding_skipped`, `signup_completed`) are unchanged. Copy is unchanged (restyle only).

**Reasoning:**
Onboarding was the last unstyled surface — hardcoded light-only hex made it look off-brand once the rest of the app moved to the green-led/obsidian palette. A token-only restyle brings it in line (and adds dark mode for free) without touching the verified flow logic. Verified: `tsc --noEmit` clean, ESLint clean on all four files, `next build` compiles, `vitest` 129/129 green. `onboarding.spec` only asserts the redirect guards (no form-internal selectors), so it is unaffected.

**Related:** DECISION-017 (onboarding_completed gating), DECISION-074 (palette/fonts), DECISION-075 (shell), DECISION-076 (PlanTripSimulator idiom); `docs/RESKIN-PLAN.md`

---

### [DECISION-082] Reskin Phase 8 — Trip modal recomposed to a single-sheet form + success state
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
`TripFlowClient` is recomposed from a 3-step wizard (destination → dates → confirm) into a **single scrolling sheet**, and a **success state** replaces the save-then-navigate behaviour (reskin plan `docs/RESKIN-PLAN.md`, Phase 8).

- **Single sheet:** destination (combobox + inline "Counts as 0 days" Crown hint), travel dates (`DateRangePicker`, including the "I'll log my return later" → null-return path), the live `CalcPanel` compliance impact, and the reason-for-travel field are all visible at once. The step indicator and the Next/Back gating are gone; validation runs once on submit (`validate()` consolidates the former per-step checks: destination required, departure required, return after departure, overlap blocks).
- **Success state:** after a successful save the sheet shows a green check + "Trip logged" / "Changes saved" + the trip summary, with **View in Trips / Log another / Done** actions (Log another resets the form; Done → `redirectTo`/`returnTo`). Previously the flow navigated away immediately. `TripModal` now passes `onSaved` so the success screen does not trip the unsaved-changes guard.
- **Notes → "Reason for travel"** (DECISION-025): the field is relabelled and annotated ("Appears as 'Reason for travel' in your ILR export").
- **Planned is still derived (D2 / DECISION-077):** the prototype's "Mark as a planned trip" checkbox is rendered as a **derived, read-only "Planned" chip** shown when `departure_date > today` — no `trips.status` column, no persisted flag. A non-functional checkbox would have implied stored state we deliberately don't have.
- **Logic preserved verbatim:** `addTripAction`/`updateTripAction`, edit-mode prefill + self-exclusion from the what-if base, `calculateWhatIf` projected to the return date (DECISION-022), Crown-Dependency 0-day handling, overlap detection, and every PostHog event (`trip_plan_opened`, `trip_plan_completed`, `trip_logged`, `trip_edited`, `trip_count_milestone`, `trip_plan_just_checking`). `TripModal` chrome and the already-tokenized `DateRangePicker`/`DestinationAutocomplete`/`PaywallModal` are unchanged apart from the `onSaved` wire-up.

**Reasoning:**
The wizard's step gating added friction the prototype's single form removes, and saving with no acknowledgement felt abrupt — the success state gives a clear "done, now what?" moment and a fast "Log another" loop. Keeping the calculation/action/event layer untouched means the recompose is presentational + navigational only. Verified: `tsc --noEmit` clean, ESLint clean, `next build` compiles, `vitest` 129/129 green. E2E specs that drove the wizard (`trips.spec`, `smoke.spec`, `dashboard.spec`) were updated to the single-sheet + success-state selectors (Next/Step assertions removed; save → "Trip logged" → View in Trips/Done).

**Related:** DECISION-022 (what-if projects to return date), DECISION-025 (notes → Reason for Travel), DECISION-073 (prior modal layout), DECISION-075 (FAB opens the modal), DECISION-077 (planned derived); `docs/RESKIN-PLAN.md`

---

### [DECISION-083] Reskin Phase 9 — Cleanup: retire dead components, rename font variables, prune dead tokens
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
Final reskin pass — remove what the earlier phases superseded and finish the font-variable rename (reskin plan `docs/RESKIN-PLAN.md`, Phase 9).

- **Deleted (confirmed no importers, no dynamic imports):** `QuotaRing.tsx` (retired from the dashboard in Phase 2), the legacy `TopNav.tsx` + `MobileNav.tsx` + `Sidebar.tsx` (replaced by `AppSidebar`/`AppMobileNav` in Phase 1), and the older `TripsClient.tsx` (superseded by `TripsTableClient`). `QuotaRingMockup` was already gone (Phase 6).
- **Font variables renamed** `--font-manrope` → `--font-heading` and `--font-inter` → `--font-body` across all ~44 files (the next/font slots in `layout.tsx`, the `@theme` block + base styles in `globals.css`, and every `font-[family-name:var(...)]` usage). These were named for the old Manrope/Inter fonts; DECISION-074 loaded Bricolage/Hanken into those legacy slots and deferred the rename to here. Pure rename — no font or weight change.
- **Pruned dead tokens** `--color-track` and `--shadow-ring-card` (light + dark) — only the deleted `QuotaRing` referenced them. Stale code comments in `riskConfig.ts` and `layout.tsx` updated.

**Reasoning:**
The legacy nav/ring/trips components were kept through Phases 1–3 to keep each diff reviewable; with the reskin shipped they are pure dead weight and were removed once a grep confirmed no references. The font-variable rename removes the last misleading legacy names (a reader seeing `--font-manrope` would expect Manrope, not Bricolage). Verified end-to-end: `tsc --noEmit` clean, ESLint clean, `next build` compiles, `vitest` 129/129 green, no dangling imports of any deleted file. Note left for the owner: the auth screens (`(auth)/auth/*`) and `error.tsx`/`not-found.tsx` still carry a few hardcoded hex values (e.g. `#191C1D`) — they were never in the reskin phase list, so they were left untouched beyond the mechanical font rename.

**Related:** DECISION-074 (loaded Bricolage/Hanken into the legacy slots), DECISION-075 (AppSidebar/AppMobileNav), DECISION-076 (QuotaRing retired), DECISION-077 (TripsClient superseded); `docs/RESKIN-PLAN.md`

---

### [DECISION-084] DateRangePicker — full-cell tap targets + month/year jump picker
**Date:** 2026-06-30
**Status:** Decided
**Decided by:** David Coutts (founder)

**Decision:**
The trip-modal calendar (`DateRangePicker`) is reworked for touch and for fast navigation to distant months (impeccable `adapt`: 44×44px touch targets, no hover-dependence for core actions).

- **Tap targets:** each day's hit area is now the **full grid column at 44px tall** (`w-full h-11`) instead of a 36px centred circle with dead gaps — so on a phone it's hard to mis-tap an adjacent day. The circular brand visual is kept as a centred 36px inner `<span>`; the range band sits behind it. Month/year nav chevrons bumped 32px → 44px.
- **Month/year jump:** the centre "Month Year" label is now a button that toggles an in-card picker — a year stepper (◄ year ►) plus a 3×4 month grid. Logging a 2023 trip from 2026 is ~3 taps (year ◄×3 → month) instead of stepping back 36 months. Selecting a month closes the picker and jumps the calendar; the ±1-month chevrons remain for fine adjustment (disabled while the picker is open).
- **Touch-safe:** hover-preview of the range end stays as a pointer-only enhancement; the core flow is tap-departure → tap-return, no hover required.

**Reasoning:**
The 36px centred targets were the mobile pain point the owner flagged ("easy to select the right date, unlikely to select the wrong one"), and stepping one month at a time made back-dated trips tedious. Both are pure interaction/layout changes — selection logic, the departure/return state machine, the "log return later" (null-return) path, and the `onDeparture/onReturn/onReturnDateKnown` contract are unchanged, so `TripFlowClient` and onboarding's `TripForm` consume it without edits. The three E2E calendar helpers (`trips`/`smoke`/`dashboard`) were repointed to read the month label from the new "Choose month and year" button (the month-stepping path is unchanged). Verified: `tsc --noEmit` clean, ESLint clean, `next build` compiles, `vitest` 129/129 green.

**Related:** DECISION-082 (single-sheet modal that hosts the picker), DECISION-043 (WCAG/touch); `docs/RESKIN-PLAN.md`
