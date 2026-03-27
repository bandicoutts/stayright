# StayRight — Decisions Quick Reference

This file contains only the Quick Reference table from `docs/DECISIONS.md`.
Read this file first (~650 tokens). Open `docs/DECISIONS.md` only for the full entry of a specific decision.

**When adding a new decision:** update the table in BOTH this file and `docs/DECISIONS.md`.

---

Scan this table to find relevant decisions. Read the full entry in `DECISIONS.md` only if the summary suggests it is relevant to your task. Decisions marked **Superseded** must not be implemented — read the superseding decision instead.

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
