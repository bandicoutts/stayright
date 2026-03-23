# StayRight — Project Context

> **STOP.** Do not read `docs/PRD.md` or `docs/DECISIONS.md` in full under any circumstances.
> Reading these files in full will exhaust your token budget before you write a single line of code.
>
> `docs/PRD.md` — read the **Feature Status table** at the top only, then pull the specific section for your task.
> `docs/DECISIONS.md` — read the **Quick Reference table** at the top only, then pull specific entries if relevant.

---

## What this is

StayRight is a UK visa absence tracker for Skilled Worker visa holders. The core job: **"Can I book this trip without risking my ILR?"** It replaces spreadsheets with a live rolling-window calculator, a what-if trip simulator, and audit-ready PDF exports.

## Current build status

| Feature | Status |
|---|---|
| Landing page | Complete — deployed |
| Auth (email + Google OAuth, password reset) | Complete |
| Onboarding (3-step flow) | Partial — first_name missing from VisaForm (Q11 in PRD §8) |
| 180-day absence engine | Complete |
| Dashboard (quota ring, period bar, ILR timeline) | Complete |
| What-if simulator (plan a trip) | Complete |
| Trip log (log, edit, delete — drawer-based) | Complete |
| Reports + PDF export | Partial — export history deferred |
| Settings (visa profile, notifications, account deletion) | Partial — last_name deferred |
| Email notifications (Resend + Vercel Cron) | Partial — routes built, not yet deployed |
| Payments (Stripe Checkout, Portal, Webhook) | Partial — webhook idempotency deferred |
| Test suite (Vitest unit + Playwright e2e) | Partial — actively being built |

## The rule that cannot be broken

```
absence_days = (return_date − departure_date) − 1
```

Neither departure nor return day counts as absence. **Never store calculated values — always compute on read.** See DECISION-002 and DECISION-005.

## Tech stack (key constraints)

- **Next.js 16** — `params` and `searchParams` are `Promise<>` — always `await` them
- **Auth guard** — `src/proxy.ts` exports `proxy()`. Do NOT create or reference `middleware.ts`
- **Tailwind v4** — `@theme` blocks in CSS. No `tailwind.config.ts`
- **Supabase SSR** — `createBrowserClient` (client components), `createServerClient` + `await cookies()` (server), `createAdminClient` (service role, server only)
- **Server Actions** (`'use server'`) for all DB writes — no API routes for mutations
- **TypeScript strict** — run `tsc --noEmit` before every commit

## Where things live

```
src/lib/calculations/absenceEngine.ts   — the 180-day engine (pure functions)
src/lib/subscriptionUtils.ts            — isPlanPro(plan, status)
src/lib/riskConfig.ts                   — RISK_CONFIG thresholds
src/proxy.ts                            — session refresh + route protection
src/app/(marketing)/                    — landing page
src/app/(auth)/                         — login, signup, verify, reset
src/app/(app)/onboarding/               — onboarding flow
src/app/(app)/(main)/dashboard/         — dashboard
src/app/(app)/(main)/trips/             — trip log + drawer flow
src/app/(app)/(main)/reports/           — PDF export
src/app/(app)/(main)/settings/          — user settings
src/app/api/stripe/                     — checkout, portal, webhook
src/app/api/cron/                       — daily + monthly notification crons
docs/PRD.md                             — what to build
docs/DECISIONS.md                       — why things are the way they are
```

## Key patterns (read before writing code)

- **Server Action pattern**: `src/app/(app)/onboarding/actions.ts`
- **Server page + Client component pattern**: `src/app/(app)/(main)/trips/page.tsx` + `src/components/app/trips/TripsClient.tsx`
- **Supabase server client**: `src/lib/supabase/server.ts`

## Commit rules

1. `tsc --noEmit` must pass before every commit
2. For any architectural decision, update `docs/DECISIONS.md` in the **same commit** as the code
3. Commit format: `feat: <what>` — push immediately to `main` (no branches, no PRs)
