# StayRight — Reskin Plan

**Status:** Draft for review. No code has been changed. Implement nothing until approved.
**Goal:** Reskin the existing StayRight app to match the new design prototype — a recompose, not a rewrite.

## Governing principle (non-negotiable)

The **existing code is the single source of truth for all numbers, logic and behaviour.**
The **prototype is the source of truth for look, layout and interaction only.**

Where they conflict:
- **Logic / numbers → code wins.** The plan *corrects the prototype* to match the code, never the reverse.
- **Look / layout / interaction → prototype wins.**

**Preserve (do not break):** the data model, server actions, `absenceEngine` calculations, Crown-Dependency logic, Stripe checkout/portal/webhooks, the daily/monthly cron, Supabase auth + RLS, PostHog events, and the existing test suites. Reuse existing calculations and actions wherever the prototype only changes presentation.

### Inputs read for this plan
- Code: `src/lib/calculations/absenceEngine.ts`, `src/lib/subscriptionUtils.ts`, `src/styles/tokens.css`, `src/app/globals.css`, route tree under `src/app`, components under `src/components`, `supabase/migrations/*`, test suites, `.impeccable.md`, `AGENTS.md`, `docs/DECISIONS-index.md`.
- Prototype: `StayRight Prototype (standalone).html`, `StayRight Dashboard/Trips/Reports/Settings.dc.html`, `StayRight.dc.html` (marketing), and `screenshots/*`.

---

## DECISIONS — RESOLVED (2026-06-30, approved by owner)

| # | Decision | Resolution |
|---|---|---|
| D1 | Free trip limit | **Keep `FREE_TRIP_LIMIT = 10`**; all copy says 10. Pure reskin, no logic change. |
| D2 | Planned-trip schema | **Derive** `planned = departure_date > today`. No migration. |
| D3 | Reports "Previous reports" | **Drop**; on-demand `@react-pdf` export only (honours DECISION-024). |
| D4 | Onboarding scope | **Light restyle** of the existing 2-step flow; no flow changes. |
| D5 | Sample-data story | Marketing/demo hero uses a **SAFE** value (≤120, proposed 108/180); verdict derives from `getRiskStatus`; all four states render correctly. |
| D6 | Fonts | **CHANGE the fonts** → adopt the prototype's **Bricolage Grotesque** (headings) + **Hanken Grotesk** (body); keep JetBrains Mono. Done in Phase 0. |
| D7 | Light-mode hue | **Prototype beige `#f4f0e8`.** |
| D8 | Marketing theming | **Themed** (light + dark); dark variant = prototype. |

> Detail on each below (kept for the record).

## DECISIONS NEEDED (original analysis — now resolved above)

> These are the points where the brief, the prototype, and the code disagreed, or where scope was open. Each has a recommendation; all are resolved in the table above.

### D1 — Free trip limit: **code says 10, your brief says 5** ⚠️ (blocking)
- **Reality:** `FREE_TRIP_LIMIT = 10` (`src/lib/subscriptionUtils.ts:15`), enforced server-side in `dashboard/actions.ts` and `onboarding/actions.ts`. `DECISION-004` and the prototype's Free card ("Up to 10 trips") *also* say 10. The only source for "5" is the reskin brief.
- **Conflict:** the brief's own governing principle is "code wins" — and the code says **10**, not 5. So "make the UI say 5" would mean *changing the code constant*, i.e. a **logic change, not a reskin**, and it would break `subscriptionUtils.test.ts` (which asserts 10).
- **Options:** (a) Keep `FREE_TRIP_LIMIT = 10`; all reskinned copy says "10 trips" — *pure reskin, code wins, recommended unless you intend a product change.* (b) Change the constant to `5`, update `subscriptionUtils.test.ts`, paywall copy, marketing/pricing copy, and add `DECISION-074` recording the change — *a deliberate product decision, out of scope for a pure reskin.*
- **Recommendation:** (a) keep 10 for the reskin; if you actually want 5, treat it as a separate one-line product change with its own ADR + test update. **Need your call.**

### D2 — Persistent "planned" trips: schema column vs derive
- **Reality:** `trips` has no `status` column. The plan/log flow (`TripFlowClient`) just inserts a trip; `return_date = null` means "currently abroad / no return yet". The engine already treats null returns as ongoing.
- **Options:** (a) **Derive** `planned = departure_date > today` (and `abroad-now = departure_date <= today && return_date is null`). No migration, consistent with `DECISION-005` (never store what you can compute). Trade-off: a planned trip auto-becomes "taken" once its departure date passes (arguably correct); the prototype's "Mark as a planned trip" checkbox becomes a derived hint, not persisted state; you can't mark a *past-dated* trip as still-just-a-plan. (b) **Add `trips.status` (`planned|taken`)** via migration + backfill, thread through the two write actions. Trade-off: touches the data model the brief says to preserve, status can drift from dates, more test surface, new RLS-safe write path.
- **Recommendation:** **(a) derive.** It is the smallest change, keeps the data model frozen, and matches existing behaviour. Revisit a `status` column only if product wants planned trips to persist independently of their dates. **Need your call** (the brief flags this as needing approval).

### D3 — Reports "Previous reports" list
- **Reality:** the prototype's Reports screen shows a "Previous reports" list (downloadable PDFs). `DECISION-024` explicitly defers this — reports are on-demand, no storage table, PDF generated and streamed on click (`/api/reports/pdf`).
- **Options:** (a) **Drop it** from the reskin; keep on-demand generation; omit the "Previous reports" panel (or show a one-line "Reports are generated on demand" note). *Recommended — honours `DECISION-024`, no new storage/infra.* (b) Build storage (Supabase Storage bucket + a `reports` table + RLS + retention policy) — a real feature, well beyond a reskin.
- **Recommendation:** **(a) drop**, reskinning only what exists. **Need your call.**

### D4 — Onboarding scope
- **Reality:** a real 2-step onboarding exists (`/onboarding` → visa step → trips step) with its own forms (`VisaForm`, `TripForm`). The prototype never designed onboarding.
- **Options:** (a) **In-scope, light restyle** — apply the new tokens, shell, inputs, and the timeline/verdict styling so it stops looking unstyled, *without* redesigning the flow. *Recommended.* (b) Defer — leave onboarding on old styling (it will look inconsistent once the rest is reskinned). (c) Full redesign — out of scope.
- **Recommendation:** **(a)** — token + component restyle only, no flow changes. **Confirm scope.**

### D5 — Mock/sample-data story for the verdict states
- **The trap:** the prototype hero shows `124/180` with a green **"You're safe"** verdict. Per code, `getRiskStatus(124) = WARNING` (amber). The verdict word + colour must **derive from `getRiskStatus`**, so 124 must render amber, not green.
- **Decision:** for any place that ships *sample* data (marketing hero, empty-state previews, screenshots), pick numbers that tell a clean, truthful story — a **SAFE** hero uses ≤120 days (e.g. 108/180 → "72 days to spare", green). For the live app, the verdict always reflects the user's real data. The component must render **all four states** (SAFE ≤120 green / WARNING 121–150 amber / DANGER 151–180 red / BREACH >180 red) correctly and reachably.
- **Recommendation:** marketing/demo hero = SAFE sample (≤120); watch lines at 120 & 150; verdict derived. **Confirm the sample numbers** (proposed: 108/180).

### D6 — Fonts: prototype uses Bricolage Grotesque + Hanken Grotesk; app uses Manrope + Inter
- **Reality:** the prototype's type stack is **Bricolage Grotesque** (headings) + **Hanken Grotesk** (body) + JetBrains Mono. The app already loads **Manrope + Inter + JetBrains Mono** (+ Instrument Serif), and the brief says "fonts already present (Manrope/Inter/JetBrains Mono)".
- **Options:** (a) **Keep Manrope/Inter/JetBrains Mono** per the brief — both are geometric grotesques, the look transfers cleanly; zero font-loading changes. *Recommended.* (b) Adopt Bricolage/Hanken to match the prototype 1:1 — adds two font families, touches `src/app/layout.tsx` and `@theme`, and contradicts the brief.
- **Recommendation:** **(a) keep existing fonts.** Flagging because it's a visible deviation from the prototype. **Confirm.**
- **RESOLVED → (b): change the fonts.** Adopt **Bricolage Grotesque** (headings) + **Hanken Grotesk** (body), keep JetBrains Mono. Implementation: in `src/app/layout.tsx`, load Bricolage/Hanken via `next/font/google` into the existing `--font-manrope` / `--font-inter` variable slots so the ~150 existing `var(--font-manrope|inter)` usages inherit with zero component edits; rename those variables to semantic `--font-heading` / `--font-body` in the Phase 9 cleanup. Keep Instrument Serif (`--font-serif`) for now (marketing accent; revisit in Phase 6).

### D7 — Light-mode background hue
- **Reality:** the prototype's **light** mode is warm beige `#f4f0e8` (close to today's "Sage & Stone" taupe `#F5F0EA`). `.impeccable.md` instead describes a green-tinted `#F5FAF7`. The current `tokens.css` is taupe.
- **Options:** (a) **Follow the prototype** (`#f4f0e8` warm beige) — prototype wins on look, and it's barely a move from today's taupe. *Recommended.* (b) Follow `.impeccable.md` (`#F5FAF7`) — contradicts the prototype.
- **Recommendation:** **(a) prototype beige.** Note the `.impeccable.md` token table is stale vs the prototype; update it in Phase 0 to avoid future confusion. **Confirm.**

### D8 — Marketing dark-only vs themed
- **Reality:** the marketing prototype (`StayRight.dc.html`) is **dark-only** (`#08090c`). The app marketing today is themed (light/dark). 
- **Options:** (a) Keep marketing **themed** (light + dark), applying the prototype's dark look as the dark theme and deriving a light variant — consistent with the rest of the app. *Recommended.* (b) Force marketing dark-only to match the prototype exactly.
- **Recommendation:** **(a) themed**, dark variant = prototype. **Confirm.**

---

## Palette reconciliation (Phase 0 reference)

Map prototype values **onto the existing token names** so components inherit without edits. Translucent prototype surfaces get solid token approximations where a token must be opaque (borders/shadows); keep translucency in component-level styles where the prototype uses it.

| Existing token | New light value | New dark value | Prototype source |
|---|---|---|---|
| `--color-bg` | `#f4f0e8` | `#08090c` | bg |
| `--color-bg-tinted` | `#efeae0` | `#0c0e13` | bg-2 (sidebar) |
| `--color-surface` | `#ffffff` | `#101319` (solid ≈ surface over bg) | surface |
| `--color-surface-warm` / `-raised` | `#fbf8f2` | `#151922` | surface-2 |
| `--color-surface-dark` | `#0c0e13` | `#0c0e13` | sidebar |
| `--color-text-primary` | `#1c1f25` | `#e9ebef` | text |
| `--color-text-2` | `#3a4049` | `#aab0ba` | text-2 |
| `--color-text-3` / `-muted` | `#5b616b` | `#7a808a` | text-3 |
| `--color-text-faint` | `#7a808a` | `#6b717b` | — |
| `--color-green` (leading accent) | `#006948` | `#1aa873` | acc-b / acc-a |
| `--color-green-dark` | `#004f35` | `#0b7d50` | acc-b |
| `--color-green-light` | `#0a7d54` | `#2ed18f` | acc-a / safe |
| `--color-teal` **(ADD)** | `#0e7c8f` | `#46c7d1` | accent2 (secondary only) |
| `--color-safe-*` | green `#006948` | `#2ed18f` | safe |
| `--color-status-amber` | `#a96209` | `#f6b94d` | warn |
| `--color-status-red` | `#c92a3a` | `#fb7185` | danger |
| `--color-border` | `rgba(28,26,22,0.10)` | `rgba(255,255,255,0.08)` | border |
| `--color-border-strong` | `rgba(28,26,22,0.16)` | `rgba(255,255,255,0.13)` | border-2 |
| `--gradient-green` | `linear-gradient(100deg,#0a7d54,#006948)` | `linear-gradient(100deg,#1aa873,#0b7d50)` | CTA gradient |

**Rules locked in:** green leads; teal is a secondary accent only (highlights, the "planned" badge, the timeline secondary); **status numbers are solid, never gradient-filled**; radii 8/11/13/18/20px map onto existing `--radius-md/lg/xl`; keep the green-tinted card shadow.

---

## Phasing overview

Each phase is independently shippable and ends green (`tsc --noEmit` clean, lint clean, unit tests pass, affected e2e specs updated). Suggested ADRs start at **DECISION-074** (latest is 073) — claim numbers at implementation time per `CLAUDE.md` (`git fetch` first; never number off the last one you wrote).

| Phase | Title | Ships |
|---|---|---|
| 0 | Foundation — token remap | New palette inherited everywhere |
| 1 | App shell — Sidebar + mobile nav | Left sidebar, mobile bottom-nav |
| 2 | Dashboard — timeline + bento | Signature timeline, trimmed modules, inline simulator |
| 3 | Trips — list recompose | Badges, Crown chip, peak span, List/Timeline toggle |
| 4 | Reports — evidence pack | Period selector + A4 live preview |
| 5 | Settings — sections | 6 jump-nav sections incl. Appearance |
| 6 | Marketing — landing reskin | Hero timeline, comparison, features, 4-plan pricing |
| 7 | Onboarding — restyle | Consistent styling on existing 2-step flow |
| 8 | Log-trip modal restyle | New modal/sheet over existing 3-step flow |
| 9 | Cleanup | Retire QuotaRing, legacy nav, dead code; final pass |

---

## Phase 0 — Foundation: token remap

**What exists today:** `src/styles/tokens.css` ("Sage & Stone", warm taupe light / deep-forest dark). `src/app/globals.css` imports tokens, runs Tailwind 4 `@theme`, defines focus/hover/animation utilities. Fonts loaded in `src/app/layout.tsx`. Components reference `var(--color-*)` exclusively (no hardcoded hex except the Hero SVG mockup and the PDF engine).

**What changes:** remap the existing token *values* (light + dark) per the palette table above; **add `--color-teal`** (light/dark); ensure `--gradient-green` reads green-led; verify status tokens are solid for numbers. **Also swap the fonts (D6):** Bricolage Grotesque + Hanken Grotesk into the existing `--font-manrope` / `--font-inter` slots.

**New work:**
- Update `src/styles/tokens.css` values only (names unchanged so components inherit).
- Add `--color-teal` to `:root` and `.dark`, and expose it in `globals.css` `@theme` if Tailwind utility access is wanted.
- Swap font loaders in `src/app/layout.tsx` (Manrope→Bricolage Grotesque, Inter→Hanken Grotesk; keep the `--font-manrope`/`--font-inter` variable names so usages inherit; keep JetBrains Mono + Instrument Serif).
- Update the stale token table in `.impeccable.md` to match (D7) — keep design docs honest.

**Files touched:** `src/styles/tokens.css`, `src/app/layout.tsx` (fonts), `src/app/globals.css` (only if adding a `@theme` entry for teal), `.impeccable.md`.

**New components:** none.

**Risks:** contrast regressions in light mode (beige surfaces vs green text) — eyeball both themes on every screen after this lands; the PDF engine hardcodes `#006948` etc. (`src/lib/pdf/reportDocuments.tsx`) and is intentionally *not* token-driven — leave it (PDF brand colour is stable and print-targeted).

**Tests:** unit suites unaffected (no logic). Run the full Playwright suite as a visual smoke; `axe` checks in e2e may catch contrast — fix tokens, not components. No spec edits expected in Phase 0.

**Suggested ADR:** "Palette remap to prototype green-led / obsidian-dark; add `--color-teal`; retire taupe."

---

## Phase 1 — App shell: TopNav → left Sidebar + mobile nav

**What exists today:** `MainLayoutClient` renders `TopNav` (sticky 64px top bar with desktop links + mobile hamburger drawer + user popover + theme toggle). `Sidebar.tsx` and `MobileNav.tsx` exist but are **unused** (legacy). `ThemeToggle` uses `next-themes`. `DECISION-019` already states the shell *should* be a sidebar — so this realigns code to that decision.

**What changes:** introduce a **left sidebar** (258px, sticky, full height) as the desktop shell: logo, 4 nav items (Dashboard, Trips, Reports, Settings) with icons + active state, footer with theme toggle + user/plan card. On mobile (<920px): hide the sidebar; show a **fixed bottom nav** with a centered raised FAB ("Log trip") plus a slim sticky top bar (logo + theme toggle), per the prototype.

**New work:**
- Either revive/replace `Sidebar.tsx` to match the prototype, or build a fresh `AppSidebar.tsx`; wire it into `MainLayoutClient` in place of `TopNav`.
- Build `MobileBottomNav.tsx` (bottom nav + FAB) and a slim `MobileTopBar.tsx` (or fold into the sidebar component with responsive rendering).
- Keep `ThemeToggle`, `MainLayoutClient` analytics trackers, and the payment-failed banner intact; just relocate them into the new shell.
- The FAB "Log trip" opens the existing TripModal (Phase 8 restyles the modal itself).

**Files touched:** `src/components/app/MainLayoutClient.tsx`, `src/app/(app)/(main)/layout.tsx` (if layout slots change), `src/components/app/Sidebar.tsx` (revive or replace), `src/components/app/ThemeToggle.tsx` (reuse). Retire-later: `TopNav.tsx`, `MobileNav.tsx` (removed in Phase 9, not now, to keep the diff reviewable).

**New components:** `AppSidebar` (or restyled `Sidebar`), `MobileBottomNav`, optional `MobileTopBar`.

**Risks:** layout shift across every authenticated page (content max-width and left offset change); focus order / skip-link target moves; active-route detection must use the App Router pathname. Keep the existing `MainLayoutClient` analytics wrappers mounted.

**Tests:** `tests/e2e/dashboard.spec.ts`, `trips.spec.ts`, `settings.spec.ts`, `reports.spec.ts`, `smoke.spec.ts` — **nav selectors will move** from a top bar to a sidebar; update locators (nav links, user menu, theme toggle, mobile nav). `auth.spec.ts` mostly unaffected. No unit test changes.

**Suggested ADR:** "Shell = persistent left sidebar (realises DECISION-019); mobile = bottom-nav + FAB; TopNav/MobileNav retired."

---

## Phase 2 — Dashboard: QuotaRing → rolling-window timeline + trimmed bento

**What exists today:** `dashboard/page.tsx` computes current rolling window, qualifying period, and peak window (all via `absenceEngine`) and renders `QuotaRing` (circular gauge) + three stat cards (current / peak / qualifying) + `DashboardAnalytics` banner + `DashboardTripsPreview` + `SetupNudge` + `DashboardWelcome` + `AlertCard`. `PeakWindowCard` also uses a small quota ring. The what-if calc (`calculateWhatIf`) exists and is currently used inside `TripFlowClient` step 2 — **there is no inline dashboard simulator today.** Peak number comes from `getPeakRollingWindow`; **no time-series chart exists.**

**What changes (recompose to ~6 modules):**
1. **Hero verdict + RollingWindowTimeline** (signature): big solid number = current window days, verdict word + colour **derived from `getRiskStatus`** (≤120 SAFE green / 121–150 WARNING amber / 151–180 DANGER red / >180 BREACH red). Horizontal track 0→180 with **watch lines at 120 and 150** (NOT 160/170), "180-day limit" marker, and a trailing-12-months span strip showing each trip as a bar (logged / currently-abroad / today marker). Retire `QuotaRing`.
2. **Inline "Plan a trip" simulator** reusing `calculateWhatIf` — two date inputs + destination, live projected `X/180` with delta and derived status colour, and a **"Save as planned"** action that calls the existing `addTripAction` (planned = future-dated trip per D2). Remove duplicated "plan a trip" messaging that now lives here.
3. **AbsenceHeatmap** (NEW): 7×~52 cell grid of daily absence over the trailing year.
4. **PeakTrajectoryChart** (NEW): SVG sparkline of the rolling-window value over the qualifying span with a dashed 180 line and the peak point marked. The peak *number* exists (`getPeakRollingWindow`); the **time-series does not** — needs a small pure helper (e.g. `getRollingWindowSeries(trips, visaStart, today)`) added to `absenceEngine.ts` (additive, fully unit-tested, no change to existing exports).
5. **ILR countdown** module (reuse `getQualifyingPeriod`): days-to-go + thin progress + eligibility date.
6. **Recent trips** (reuse `DashboardTripsPreview`, restyled).

Keep `SetupNudge` (visa date missing), `DashboardWelcome`, the currently-abroad warning, and `DashboardAnalytics` (analytics-only banner) — restyled into the bento, not duplicated as competing big numbers (one hero metric per screen).

**New work / files touched:** `src/app/(app)/(main)/dashboard/page.tsx` (recompose), new `src/components/app/dashboard/RollingWindowTimeline.tsx`, `AbsenceHeatmap.tsx`, `PeakTrajectoryChart.tsx`, `PlanTripSimulator.tsx`; restyle `DashboardTripsPreview.tsx`, `DashboardAnalytics.tsx`, `dashboard/loading.tsx`. Add `getRollingWindowSeries` to `src/lib/calculations/absenceEngine.ts` (+ tests). `dashboard/actions.ts` unchanged (simulator reuses `addTripAction`/`calculateWhatIf`).

**New components:** `RollingWindowTimeline`, `AbsenceHeatmap`, `PeakTrajectoryChart`, `PlanTripSimulator`.

**Risks:** the **verdict-vs-thresholds correctness** (D5) is the highest-stakes detail — verify SAFE/WARNING/DANGER/BREACH each render the right word+colour at boundary values (120/121/150/151/180/181). The new series helper must not alter existing engine outputs. Don't let the simulator and trip modal diverge in what-if logic — both call `calculateWhatIf`.

**Tests:** new unit tests for `getRollingWindowSeries` and a verdict-derivation test (boundary days → status+colour). `dashboard/actions.test.ts` unchanged. `tests/e2e/dashboard.spec.ts` — **QuotaRing assertions removed**, replaced with timeline + verdict + simulator selectors; update "plan trip" path to the inline simulator.

**Suggested ADRs:** "QuotaRing retired; rolling-window timeline is the signature dashboard graphic"; "Inline what-if simulator on dashboard reuses `calculateWhatIf` + `addTripAction` (Save as planned)"; "`getRollingWindowSeries` added for PeakTrajectoryChart".

---

## Phase 3 — Trips: list recompose

**What exists today:** `trips/page.tsx` → `TripsTableClient` (table/list; add/log/edit/delete via `TripModal`+`TripFlowClient`). `TripsClient.tsx` also exists (older variant). Crown-Dependency handled in `absenceEngine`/flow. No List/Timeline toggle; no explicit peak-window span; badges minimal.

**What changes:**
- **Row layout** per prototype: flag tile · destination + conditional badges · day count (solid status colour) + sub-label · conditional status badge · edit/delete.
- **Conditional badges:** "Abroad now" (dashed teal, when `return_date` null and departure ≤ today), "Planned" (dashed teal, when departure > today — D2 derive), "Crown Dependency" (neutral chip + tooltip "Time in Crown Dependencies doesn't count toward the 180-day limit") with the day count shown as **"Xd · doesn't count"** (0 absence days, from `isCrownDependency`).
- **Peak-window-as-a-span:** an amber left-edge highlight across the rows that fall inside the peak 12-month window (`getPeakRollingWindow`) + a one-line explainer ("Your tightest 12-month window: NNN/180").
- **Single header stat** (current window `NNN/180`) — not several competing numbers; secondary counts (currently abroad, planned, year filter) as small mono chips.
- **List / Timeline toggle** — Timeline/Gantt view is **NEW** (trips as bars on a time axis, reusing the trailing-window visual language from Phase 2).
- **Planned-vs-taken visual distinction** (dashed/teal for planned, solid for taken), derived per D2.

**New work / files touched:** `src/components/app/trips/TripsTableClient.tsx` (recompose to list + badges + header stat + toggle), new `TripsTimelineView.tsx` (Gantt), small presentational `TripRow.tsx`/`TripBadges.tsx` if it keeps the client lean. Reuse `isCrownDependency`, `getPeakRollingWindow`, `calculateTripAbsenceDays`. Decide whether `TripsClient.tsx` is dead (retire in Phase 9 if so).

**New components:** `TripsTimelineView`, optional `TripRow`/`TripBadges`.

**Risks:** the **planned/abroad/taken derivation** must be exactly consistent with the dashboard and the engine (null return = abroad now if departure ≤ today; future departure = planned). Crown-Dependency "doesn't count" must read 0 from `isCrownDependency`, not a re-implementation. Peak-span highlight must use the engine's window, not a guess.

**Tests:** `tests/e2e/trips.spec.ts` — list/row selectors change; add coverage for the List/Timeline toggle, Crown chip, planned vs taken. `src/__tests__/tripValidation.test.ts` unchanged (validation logic untouched).

**Suggested ADRs:** "Trips list recompose: conditional badges, neutral Crown chip, peak-window span"; "Trips List/Timeline (Gantt) toggle; planned/taken derived from dates".

---

## Phase 4 — Reports: evidence-pack styling

**What exists today:** `reports/page.tsx` (Pro check) → `ReportsClient` with **three buttons** (ILR table / rolling-window history / custom range), each POSTing to `/api/reports/pdf?type=...`; free users see the paywall. PDFs built with `@react-pdf/renderer` (`src/lib/pdf/reportDocuments.tsx`). No period selector, no live preview, **no stored history** (`DECISION-024`).

**What changes (presentation only):**
- Two-column "evidence pack" layout: left = **period selector** (presets: Visa year / Calendar year / Last 12 months / Custom + custom range), a compliance-status chip, and the export button (Pro-gated, "Upgrade to Pro" for free); right = an **A4 live preview** of the report (letterhead, applicant + period, compliance statement box, 4-up summary grid, absence table, footer).
- Keep the **same `@react-pdf` engine and `/api/reports/pdf` route**; the live preview is an HTML mirror of the PDF layout (not a second source of truth) — the actual export still streams the existing PDF.
- **Map presets onto existing report types:** Visa year / Custom → `type=custom` with computed `start`/`end`; Last 12 months → rolling; "ILR" full → `type=ilr`. No new report semantics.
- **"Previous reports" → D3** (recommend drop; show on-demand note).

**New work / files touched:** `src/components/app/reports/ReportsClient.tsx` (restyle to selector + preview), new `ReportPreview.tsx` (HTML A4 mirror) and `PeriodSelector.tsx`. `reports/page.tsx` unchanged except passing what the selector needs. `/api/reports/pdf/route.ts` and `reportDocuments.tsx` unchanged. Keep Pro-gating and `reports_viewed`/`pdf_generated` events.

**New components:** `ReportPreview`, `PeriodSelector`.

**Risks:** preview/PDF drift — the HTML preview must derive the same numbers from `absenceEngine` that the PDF does; do not duplicate calculations. Pro-gating must stay server-trustworthy (the page already checks subscription).

**Tests:** `tests/e2e/reports.spec.ts` — button-per-type selectors become preset + export; preserve the free-paywall and Pro-download assertions; assert the export still downloads a PDF.

**Suggested ADR:** "Reports reskinned to evidence-pack (period selector + A4 live preview); same `@react-pdf` engine; previous-reports list dropped per DECISION-024."

---

## Phase 5 — Settings: tabbed → six jump-nav sections

**What exists today:** `settings/page.tsx` fetches profile (+ the **5 real notification columns**: `notifications_120_day`, `notifications_150_day`, `notifications_return_reminder`, `notifications_ilr_reminder`, `notifications_monthly`) and subscription, renders `SettingsClient` as **three tabs** (Visa / Account / Notifications). Subscription plan label/price + appearance(theme) live elsewhere (theme is in the nav). Actions: `updateProfileAction`, `updateNotificationsAction`, `updateEmailAction`, `updatePasswordAction`, `exportDataAction`, `deleteAccountAction`.

**What changes:** recompose into the prototype's **six sections with a sticky jump nav**:
1. **Visa & ILR** — visa route + visa start date; ILR eligibility date shown **once** (computed via `getQualifyingPeriod`), no duplicate ILR dates.
2. **Account** — name, email, password ("change password").
3. **Subscription & Billing** — current plan, renew/period info, plan cards — **show all four plans** (Free / Pro Monthly £2.99 / Pro Annual £24.99 / Pro Lifetime £49.99); reuse existing plan labels/prices already in `SettingsClient` and the Stripe checkout/portal wiring.
4. **Notifications & Alerts** — map the prototype's toggles onto the **real 5 columns**, with correct copy: **"Email me at 120 days"** and **"Email me at 150 days"** (NOT 150/170), return reminder, ILR reminder, monthly summary. Preserve Pro-gating where it exists.
5. **Appearance** — System / Dark / Light theme control (move/expose the `next-themes` toggle here).
6. **Data & privacy** — export data + delete account (reuse `exportDataAction`, `deleteAccountAction`).

**New work / files touched:** `src/components/app/settings/SettingsClient.tsx` (tabs → sections + jump nav; add Appearance + Data&privacy sections; relabel notification toggles 120/150). `settings/page.tsx` unchanged (already provides the data). `settings/actions.ts` unchanged. Reuse `ThemeToggle` logic for the Appearance control.

**New components:** `SettingsSectionNav` (jump nav), optional `ThemeChooser` (System/Dark/Light) wrapping `next-themes`.

**Risks:** the notification toggles must bind to the exact existing columns — **do not rename or add columns** (no migration). Toggle labels are the only copy fix (120/150). Ensure the four-plan billing block uses the existing Stripe plan keys.

**Tests:** `tests/e2e/settings.spec.ts` — tab selectors → section selectors; assert notification labels read **120/150**; profile/email/password/export/delete flows unchanged in behaviour. `src/__tests__/subscriptionUtils.test.ts` untouched (unless D1 chooses to change the limit).

**Suggested ADR:** "Settings recomposed into six jump-nav sections; notification copy corrected to 120/150; Appearance + Data&privacy surfaced."

---

## Phase 6 — Marketing: landing reskin + copy-number corrections

**What exists today:** `(marketing)/page.tsx` → `Nav`, `Hero` (uses `QuotaRingMockup`), `Features` (bento), `Pricing` (monthly/annual toggle + Free/Pro-monthly/Pro-annual/Pro-lifetime; Free says "10 trips"), `TrustBar`, `Footer`, `CookieBanner`.

**What changes (per `StayRight.dc.html`):**
- **Hero:** replace `QuotaRingMockup` with the **window-timeline hero card** (reuse/adapt `RollingWindowTimeline` from Phase 2). Headline "Travel freely. / **Stay under 180.** / Reach ILR." with the middle line green. Sample data = **SAFE** (D5: ≤120, proposed 108/180 → "72 days to spare", green "You're safe"); **watch lines at 120 & 150**, label "120 · 150 thresholds" (NOT "160 · 170").
- **Comparison section (NEW):** "spreadsheet vs StayRight" two-column ✕/✓ list.
- **How it works (NEW or from existing):** three steps (Log your trips / We check every window / Know you're safe).
- **Features:** restyle to the six-tool grid with mono eyebrows (Rolling-window calculation, What-if simulator, Live 180-day tracker, Quick trip logging, At-a-glance status, One-click ILR export).
- **Pricing:** reskin; **keep all FOUR plans** — the prototype only shows three (no annual), so **add the annual plan** to match the code (£24.99/year). Keep the existing monthly/annual toggle + lifetime card. **Fix Free-tier trips copy** to match the code constant (D1: "10 trips" unless you change the constant to 5).
- **Trust:** the prototype's Trust/Testimonials + Final-CTA are empty placeholders — **do not invent testimonials or credentials** (`.impeccable.md` copy rule: no false trust signals). Reskin the existing `TrustBar` honestly, or keep the footer's "Not affiliated with the Home Office" disclaimer.
- **Nav/Footer:** restyle to the prototype (links, CTA "Start tracking free", footer columns + disclaimer).

**New work / files touched:** `src/components/marketing/Hero.tsx` (timeline mockup), `Features.tsx` (six-tool grid), `Pricing.tsx` (reskin, keep 4 plans, fix Free copy), `Nav.tsx`, `Footer.tsx`, `TrustBar.tsx` (honest reskin or repurpose as comparison), new `Comparison.tsx` and `HowItWorks.tsx`. `(marketing)/page.tsx` (section order). Retire `QuotaRingMockup` (Phase 9 with QuotaRing).

**New components:** `Comparison`, `HowItWorks`, marketing timeline mockup (or shared `RollingWindowTimeline` in a marketing variant).

**Risks:** **copy-number correctness** is the whole point here — watch lines 120/150, threshold-alert copy 120/150, verdict derived (SAFE sample), free-trips count matching the code, and all four prices present and correct. Don't add unverifiable trust claims.

**Tests:** `tests/e2e/landing.spec.ts` — section/pricing-toggle/feature selectors change; assert all four plan prices render, Free-trips copy matches the constant, and no "160/170" appears.

**Suggested ADR:** "Marketing reskin to prototype; hero = window timeline (SAFE sample); added comparison + how-it-works; corrected watch-line/threshold copy to 120/150; annual plan retained in pricing."

---

## Phase 7 — Onboarding restyle (D4)

**What exists today:** `/onboarding` (welcome + 2-step progress dots) → visa step (`VisaForm`) → trips step (`TripForm`), with `OnboardingStartedTracker`, `SignupTracker`, `SkipButton`. Prototype never designed onboarding.

**What changes (restyle only, no flow change):** apply the new tokens, shell, inputs, buttons, and the verdict/timeline styling so it matches the app; keep the 2-step structure, the same server actions (`onboarding/actions.ts`), and all PostHog events.

**Files touched:** `src/app/(app)/onboarding/layout.tsx`, `page.tsx`, `visa/VisaForm.tsx`, `trips/TripForm.tsx`. No action/logic changes.

**New components:** none (reuse restyled inputs from the design system).

**Risks:** keep `onboarding_completed` gating and the trip-limit guard (`FREE_TRIP_LIMIT`) in `onboarding/actions.ts` intact; restyle ≠ rewire.

**Tests:** `tests/e2e/onboarding.spec.ts` — selectors may shift; the 2-step flow + skip + completion behaviour must stay green.

**Suggested ADR:** "Onboarding restyled to the new design system; flow unchanged."

---

## Phase 8 — Log-trip flow: restyle TripModal to the new modal/sheet

**What exists today:** `TripModal` wraps `TripFlowClient` — a **3-step** flow (1 destination/`DestinationAutocomplete` → 2 dates/`DateRangePicker` + live what-if → 3 confirm/notes), modes `plan|log|edit`, calling `addTripAction`/`updateTripAction`, firing the full event set (`trip_plan_opened`, `trip_logged`, `trip_edited`, milestone events…).

**What changes:** restyle the modal to the prototype's **single-sheet form + success state** look (destination combobox with flag + "Counts as 0 days" Crown hint, departure, return-or-"log later", "Mark as a planned trip" checkbox, then a success screen with "View in Trips" / "Log another" / "Done"). The prototype's single-form look maps onto the existing steps — **keep the underlying 3-step logic and the same server actions**; the redesign is presentational (the steps can become sections within one sheet, or keep step transitions behind the new chrome). Reuse the existing what-if calc and overlap guard.

**Files touched:** `src/components/app/trips/TripModal.tsx`, `TripFlowClient.tsx` (presentational restyle), `DestinationAutocomplete.tsx`, `DateRangePicker.tsx` (restyle), `PaywallModal.tsx` (restyle, keep gating). No action/engine changes. The FAB (Phase 1) and Trips/Dashboard entry points all open this modal.

**New components:** optional `TripSuccess.tsx` (success state) if it keeps `TripFlowClient` lean.

**Risks:** preserve overlap detection, the what-if/risk panel, the "log return later" (null return) path, edit-mode prefill, and every PostHog event. The prototype is a single form — don't drop the confirm/notes step's behaviour (notes → "Reason for travel" in the ILR PDF, `DECISION-025`).

**Tests:** `tests/e2e/trips.spec.ts` (add/edit/delete/overlap) and `dashboard.spec.ts` (plan path) — modal selectors change; behaviour must hold. `src/__tests__/tripValidation.test.ts` unchanged.

**Suggested ADR:** "Trip modal restyled to single-sheet + success state; 3-step logic and server actions unchanged."

---

## Phase 9 — Cleanup

**What changes:** remove now-dead code and do the final pass.
- Delete `QuotaRing.tsx`, `QuotaRingMockup` usage, `PeakWindowCard`'s ring, and any retired ring CSS/tokens (`--shadow-ring-card`, `--color-track`) if unreferenced.
- Delete `TopNav.tsx`, `MobileNav.tsx`, and `TripsClient.tsx` / `Sidebar.tsx` if confirmed unused after Phases 1/3.
- Grep for dangling `--color-*` tokens and stale taupe references; prune `.impeccable.md`/`docs/DESIGN.md` drift.
- Full pass: `tsc --noEmit` clean, `eslint` clean, `vitest run` green, full Playwright suite green, both themes eyeballed on every screen, reduced-motion respected.

**Files touched:** deletions + `docs/DESIGN.md` / `.impeccable.md` token sync. 

**Risks:** deleting a component still imported somewhere — grep before each removal.

**Tests:** whole suite green; no spec should still reference removed components.

**Suggested ADR:** "Retired QuotaRing + legacy nav/components post-reskin."

---

## Corrections applied (every prototype↔code number resolves in favour of the code)

| # | Prototype says | Code/PRD truth | Resolution in the reskin |
|---|---|---|---|
| 1 | Dashboard/hero **watch lines 160 & 170** | Thresholds **120 / 150** (`getRiskStatus`: ≤120 SAFE, 121–150 WARNING, 151–180 DANGER, >180 BREACH) | Timeline watch lines drawn at **120 & 150**; label "120 · 150 thresholds". |
| 2 | Hero verdict **green "You're safe" at 124/180** | `getRiskStatus(124) = WARNING` (amber) | Verdict word + colour **derived from `getRiskStatus`**; sample hero uses a **SAFE (≤120)** value so green is truthful (D5). All four states reachable + correct. |
| 3 | Notification toggles **"150 days" & "170 days"** | Columns/thresholds **120 / 150** | Settings toggles relabelled **"120 days" & "150 days"** (bound to `notifications_120_day` / `_150_day`). |
| 4 | Free tier **"10 trips"** (prototype) / brief says **5** | `FREE_TRIP_LIMIT = 10` in code | Copy matches the **code constant** (10) — code wins. Changing to 5 is a separate product decision (**D1**), not a reskin. |
| 5 | Pricing shows **3 plans** (no annual) | Code supports **4**: free / pro_monthly £2.99 / pro_annual £24.99 / pro_lifetime £49.99 | Reskinned pricing/settings **show all four**; annual (£24.99/yr) added back. |
| 6 | Prices £2.99 / £49.99 (annual absent) | £2.99 / £24.99 / £49.99 | All three paid prices shown, matching code/Stripe wiring. |
| 7 | "Previous reports" stored list | `DECISION-024`: no storage, on-demand only | Previous-reports list **dropped** (D3); on-demand `@react-pdf` export preserved. |
| 8 | "Planned" via a checkbox (implies stored status) | No `trips.status` column | Planned/taken **derived from dates** (D2); no schema change unless approved. |
| 9 | Fonts **Bricolage + Hanken** | App loads **Manrope + Inter** (+ JetBrains Mono) | Existing fonts kept per brief (**D6**). |
| 10 | Crown Dependency time (visual only) | `isCrownDependency` → **0 absence days** | Neutral Crown chip + tooltip + **"Xd · doesn't count"**, value from the engine. |

---

## Schema decision (explicit, needs approval) — see **D2**

**Recommendation: derive `planned = departure_date > today`** (no migration; consistent with `DECISION-005`). Alternative: add `trips.status (planned|taken)` via migration + backfill + write-action changes (more faithful to the prototype's checkbox, but mutates the data model the brief says to preserve and adds drift risk). **Do not implement either until you choose.**

---

## What this plan deliberately does **not** do
- No changes to `absenceEngine` calculation semantics (only an **additive** `getRollingWindowSeries` helper for the trajectory chart).
- No changes to Stripe checkout/portal/webhooks, cron, Supabase auth/RLS, or PostHog event names — only their surrounding presentation.
- No new persistence (no reports storage, no trips.status) unless D2/D3 approve it.
- No new fonts, no testimonials/credentials that aren't verifiably true.

**STOP — awaiting approval before any implementation.**
