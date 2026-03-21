# StayRight — Decision Log

This file records significant decisions made during the design and build of StayRight. Each entry explains what was decided, why, what alternatives were considered, and the date it was made.

When there is a conflict between this file and other documentation, use this file to understand the intent behind the decision, then defer to PRD.md for what to build.

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

## Template for new entries

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
