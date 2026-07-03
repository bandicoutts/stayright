# StayRight — User Journeys

> A design-oriented map of every journey traceable through the StayRight codebase, written for paste-in use as design-tool context. Component names are included in brackets only as cross-reference handles — they are the real names in the code so designers and engineers can talk about the same thing.
>
> Generated from code analysis on 2026-06-12. Where the code was ambiguous or a flow appeared unreachable, it is flagged in **Section 6 — Ambiguities & Loose Ends** rather than presented as fact.

---

## 1. What StayRight is

StayRight is a **UK visa absence tracker**. Its single core job, in the product's own words:

> **"Can I book this trip without risking my ILR?"**

It is built for people on a UK Skilled Worker (and similar) visa who must stay under **180 days of absence in any rolling 12-month window** to qualify for Indefinite Leave to Remain (ILR). It replaces a spreadsheet with a live rolling-window calculator, a "what-if" trip simulator, and audit-ready PDF exports for the Home Office application.

The product promise on the landing page: *"Don't risk your right to stay on a spreadsheet."*

---

## 2. Application map

### 2.1 Route groups

The app is divided into four worlds, each with its own shell:

| World | Routes | Who sees it | Shell |
|---|---|---|---|
| **Marketing** (public) | `/`, `/about`, `/blog`, `/contact`, `/help`, `/terms`, `/privacy-policy`, `/cookie-policy` | Anyone, logged in or out | Marketing nav + footer [`Nav`, `Footer`] |
| **Auth** | `/login`, `/signup`, `/auth/verify-email`, `/auth/check-email`, `/auth/reset-password`, `/auth/new-password`, `/auth/callback` | Logged-out users | Minimal centred card [`(auth)/layout`] |
| **Onboarding** | `/onboarding`, `/onboarding/visa`, `/onboarding/trips` | Logged-in, not-yet-set-up users | Plain centred card with progress dots |
| **Main app** | `/dashboard`, `/trips`, `/reports`, `/settings` | Logged-in, onboarded users | Top navigation bar [`TopNav`, `MainLayoutClient`] |

A small set of API/background routes sit behind all of this and never render UI: Stripe checkout/portal/webhook, the PDF generator, and two notification cron jobs (daily / monthly).

### 2.2 Navigation structure (logged-in)

The live app uses a **single top navigation bar** [`TopNav`] across all screen sizes:

- **Logo** (left) → Dashboard
- **Primary links**: Dashboard · Trips · Reports · Settings
- **Right side**: theme toggle (light/dark) · user menu (avatar + name; shows a green **PRO** badge for Pro users)
- **User menu popover**: Settings · Sign out
- **Mobile**: links collapse into a hamburger drawer built into the same `TopNav`
- **Payment-failure banner**: a full-width red bar appears directly under the nav if a Pro subscription has gone `past_due`/`unpaid` — *"Your payment failed. Please update your payment method to keep Pro features."*

> ⚠️ Two alternative nav components exist in the code — a left **`Sidebar`** (Dashboard + Reports only, with a "Manage" section) and a **`MobileNav`** — but neither is rendered by the live layout. Treat them as **dead components**, not as a design the user actually sees. (See Section 6.)

### 2.3 Auth states

| State | What it means | Where they land |
|---|---|---|
| **Logged out** | No Supabase session | Marketing + auth routes only; any app route redirects to `/login` |
| **Logged in, not onboarded** | Session exists, `onboarding_completed = false` | Pushed into `/onboarding` |
| **Logged in, onboarded** | Full access | Dashboard and the rest of the main app |
| **Recovery session** | Mid password-reset | Only `/auth/new-password` is meaningful |

Auth is enforced centrally [`proxy.ts`]: app routes (`/dashboard`, `/trips`, `/reports`, `/settings`, `/onboarding`) bounce logged-out users to `/login`; logged-in users are bounced *away* from `/login` and `/signup` to `/dashboard`.

### 2.4 Plan tiers (the only "roles")

There are no admin/staff roles. The only differentiation is **Free vs Pro**.

| | **Free** | **Pro** (Monthly / Annual / Lifetime) |
|---|---|---|
| Price | £0 forever | £2.99/mo · £24.99/yr · £49.99 once |
| Trips | **10 max** (hard limit) | Unlimited |
| Dashboard & rolling-window tracker | ✓ | ✓ |
| What-if / trip simulator | ✓ | ✓ |
| PDF export (Reports) | ✕ (paywalled) | ✓ |
| Email alerts (notifications) | ✕ (toggles locked) | ✓ |

The gate is a single function [`isPlanPro`]: a user is Pro only if their plan is non-free **and** their status is not `past_due`/`unpaid` — so a failed payment silently drops them back to Free-level access until they fix it.

### 2.5 Data model as the user experiences it

The user effectively owns three things:

1. **Their visa profile** — first name (and optional last name), visa route (Skilled Worker, Health & Care Worker, Intra-company Transfer, Global Talent, Graduate/Innovator Founder), and visa start date. From the start date the app derives an **ILR target date** (start + 5 years) and a **qualifying-period progress %**.
2. **Their trips** — a list of absences, each with a destination, a departure date, an optional return date (blank = "currently abroad"), and optional notes. The core number — **absence days = (return − departure) − 1** — is never stored; it's recomputed on every read. Crown Dependencies (Jersey, Guernsey, Isle of Man) count as **0 days**.
3. **Their subscription** — plan + status, and their notification preferences (five email-alert toggles).

Everything the dashboard shows — the rolling-window count, risk level, historical peak, ILR countdown — is calculated live from these three things.

---

## 3. Primary journeys (ranked by centrality)

These are the jobs the product exists to do. They are ordered from "the reason the app exists" outward.

---

### 🥇 P1 — Check whether a trip is safe ("Plan a trip" / what-if simulator)

**Goal:** Before booking travel, find out whether the trip would push the user over the 180-day line — *without committing to logging it.*

**Why it's #1:** This is the literal product promise. Everything else supports it.

**Entry points:**
- Dashboard → **"Plan trip"** button (outlined, top-right)
- Trips page → **"Plan a trip"** button

**Path:** A three-step right-side drawer opens [`TripModal` → `TripFlowClient`, mode = *plan*]:

1. **Where are you going?** — *"Where are you going?"* with a destination autocomplete [`DestinationAutocomplete`], placeholder *"e.g. Portugal, Dubai, New York."* If the user types a Crown Dependency, a green note appears: *"✓ Crown Dependencies count as UK presence. This trip will not affect your absence record."* → **Next →**
2. **When are you travelling?** — an inline calendar [`DateRangePicker`] on the left; a **live compliance panel** on the right. As soon as both dates are valid, the panel shows: *"This trip — N days,"* *"Days remaining after — N days,"* a progress bar (*"N / 180 days used"*), and a risk verdict (see risk states below). A breach shows a red warning: *"This trip would push you to X/180 days… You would breach the absence limit."* → **Next →**
3. **Review your trip** — a summary card with the verdict and rolling-window impact, plus an optional notes field. Two choices:
   - **"Just checking"** — closes without saving, returns to where they came from. *(This is what makes it a simulator.)*
   - **"Save this trip"** — promotes the simulation into a real logged trip.

**States:**
- *Empty / no dates:* right panel reads *"Enter dates to see your compliance impact."*
- *Safe (≤120 days):* "Compliant — Safe to travel."
- *Warning (121–150):* "Approaching Limit — plan carefully."
- *Danger (151–180):* "Near Breach — very close to the 180-day limit."
- *Breach (181+):* red callout, would breach.
- *Overlap:* if dates clash with an existing trip, a yellow warning appears and blocks progress.
- *Future-dated trips* are projected correctly (the calc treats the return date as "today").

**Exit:** Back to dashboard/trips (either dismissed or with the new trip saved and the dashboard updated).

---

### 🥈 P2 — Read your standing at a glance (Dashboard)

**Goal:** Open the app and immediately understand *"Am I OK right now?"*

**Entry points:** Default landing after login, onboarding completion, or logo click.

**Path:** `/dashboard` [`page` + `DashboardGreeting`, `QuotaRing`, `DashboardTripsPreview`]. A time-aware greeting (*"Good morning, Priya"*) sits above two persistent CTAs — **"Plan trip"** and **"Log trip."**

The hero is three stat cards:
- **Current window** — a large coloured ring [`QuotaRing`] showing *N / 180 days* used in the live rolling window, plus *"N days remaining,"* and a status badge.
- **Historical peak** — a second ring showing the worst rolling window the user has ever hit, with its date range.
- **Qualifying period** — a progress bar showing *"X% of qualifying period complete"* with visa-start → ILR-date endpoints.

Below that, a **Recent trips** preview (up to 3, newest first) with per-trip day badges, linking to the full log via **"View all →."**

**States:**
- *Brand-new (just onboarded, `?onboarded=1`):* a dismissible welcome card [`DashboardWelcome`] explains the three cards ("You're all set up"), with a **"Got it →"** dismissal.
- *Empty / no trips:* rings and cards show placeholders — *"Log your first trip and we'll track your peak rolling window here."*
- *Visa date missing (e.g. skipped onboarding):* a **setup nudge** [`SetupNudge`] — *"Finish setting up your profile to see your compliance status. Complete setup →"* (dismissible, remembered in local storage), and the qualifying-period card reads *"Set your visa start date in Settings to track progress."*
- *Currently abroad (a trip with no return date):* a non-dismissible banner — *"Your absence days are still counting. Log your return date as soon as you're back in the UK."*
- *Risk escalation:* once over 120 days, a coloured alert card appears above the rings — Warning (⚠️), Danger (🚨), or Breach (🚫, with a link to *"Find an immigration solicitor →"*).
- *Loading:* full skeleton of the three-card grid [`dashboard/loading`].

**Exit:** Into Plan trip, Log trip, the full trip log, or Settings (via the nudge).

---

### 🥉 P3 — Log a real trip

**Goal:** Record an actual past or booked absence so the rolling window stays accurate.

**Entry points:** **"Log trip"** on the dashboard or trips page; *"Log your first trip"* on any empty state.

**Path:** Same three-step drawer as Plan-a-trip [`TripFlowClient`, mode = *log*], with two differences: there is **no "Just checking"** escape on step 3, and the final button reads **"Save trip."** Step 2 includes an **"I'll log my return later"** option, which saves the trip as open-ended / "Abroad."

**States:** identical risk/overlap/Crown-Dependency states as P1, plus:
- *Free user at 10 trips:* the drawer is replaced by the **paywall** (see P4).
- *Save error:* server-side validation messages surface in a red box (overlap, date format, missing destination, quota).
- *Pre-visa trip:* a trip dated before the visa start date is saved but flagged *"won't count toward your 180-day window."*

**Exit:** Trip saved, dashboard + trip log revalidated, returns to origin.

---

### P4 — Hit the limit and upgrade (Paywall → Checkout)

**Goal:** A Free user who needs more than the product gives them converts to Pro.

**Why it sits here:** It's the business-critical conversion moment and is wired into three primary surfaces.

**Entry points (all triggers for the same modal [`PaywallModal`]):**
- Trying to log/plan an **11th trip** as a Free user.
- Trying to **download a PDF** on Reports as a Free user.
- Trying to enable an **email notification** as a Free user.
- Any *"Upgrade to Pro"* / *"View plans"* link scattered through Settings and Reports.

**Path:**
1. The modal opens: 👑 **"Unlock StayRight Pro"** — *"You've reached the free plan limit. Upgrade to track unlimited trips and protect your ILR application."*
2. A Free-vs-Pro feature grid, then three selectable plans: **Monthly £2.99/mo · Annual £24.99/yr (Save 30%) · Lifetime £49.99 (Best value).**
3. **"Upgrade to Pro — £[price]"** → redirects to **Stripe-hosted checkout**.
4. On success Stripe returns the user to `/dashboard?upgraded=1`; on cancel, back to `/dashboard`. A background webhook flips their subscription to Pro.

**States:** loading (*"Redirecting to checkout…"*); error (*"Could not connect to payment provider. Please try again."*); dismiss via **"Not now"** or Esc.

**Exit:** Pro unlocked everywhere (badge appears, paywalls lift, toggles enable), or modal dismissed and the user stays Free.

---

### P5 — First-run setup (Onboarding)

**Goal:** Get a brand-new user from "just signed up" to "dashboard that means something" in ~2 minutes.

**Entry point:** Automatic immediately after first signup (email or Google); also re-entered any time a logged-in, un-onboarded user hits an app route.

**Path:** Three steps with progress dots:
1. **Welcome** [`/onboarding`] — *"Know exactly where you stand… In 2 minutes you'll have a live view of your 180-day window and ILR timeline."* → **"Let's go →"**. A returning, half-finished user instead sees *"Welcome back… Continue where you left off →."* A quiet **"Skip setup"** link is the only way out without finishing.
2. **Visa details** [`/onboarding/visa`, `VisaForm`] — first name, visa route (dropdown), visa start date (must be in the past). On entering a date, a live box previews *"ILR eligibility: [date]"* (start + 5 years). → **"Continue →"**.
3. **Travel history** [`/onboarding/trips`, `TripForm`] — *"Add your travel history."* Add trips one at a time (destination autocomplete + date picker, return date required here). Live overlap and pre-visa warnings. At the free limit, a celebratory *"You've added N trips — great start!"* box appears. Finish with **"Go to dashboard →"** (or *"Skip and go to dashboard →"* if none added).

**States:** empty / resuming / per-field validation / overlap warning / pre-visa warning / quota-reached / saving. *Skipping* lands on the dashboard with the setup nudge showing instead of a populated view.

**Exit:** `/dashboard?onboarded=1` with the first-run welcome card. Onboarding is marked complete and never auto-shows again.

---

### P6 — Manage the trip log (edit / delete / search)

**Goal:** Keep the record correct over time — log a return, fix a date, remove a mistake, find an old trip.

**Entry points:** Trips nav item → `/trips` [`TripsClient`, `TripsTableClient`]; *"View all"* from the dashboard preview.

**Path:** A searchable, sortable table — *"Trip Log / Your complete absence record."* Columns: Destination · Departure · Return · Days · Window at departure. Rows expand for detail. Per-row hover reveals **edit** (pencil) and **delete** (trash); checkboxes enable **bulk delete**.
- **Edit** → reopens the three-step drawer pre-filled (mode = *edit*, button *"Save changes"*); closing with unsaved changes prompts *"Discard this trip? … Keep editing / Discard."*
- **Delete** → optimistic fade-out, confirmed server-side.
- **Bulk delete** → *"Delete N trip(s)?"* browser confirm, then batch removal.

**States:** empty (*"No trips logged yet — Log your travel history to track your 180-day compliance window"* + *"Log your first trip"*); abroad/ongoing badges; Crown-Dependency *0d* badges; loading skeleton.

**Exit:** Stays on the log; dashboard recalculates.

---

## 4. Secondary journeys (settings, account, billing, exports)

---

### S1 — Export an ILR PDF (Reports)

**Goal:** Produce a Home-Office-ready absence document for an ILR application.

**Entry:** Reports nav → `/reports` [`ReportsClient`]. *"Reports & Exports — Generate PDF documents suitable for inclusion in an ILR application."*

**Path:** Three report cards — **ILR Absence Table** (SET(O)-format), **Rolling Window History** (month-by-month), **Custom Date Range** (with From/To inputs). Pro users get a green **"Download PDF"** that streams a file (`StayRight_…_YYYY-MM-DD.pdf`); Free users get **"Upgrade to Download"**, which opens the paywall.

**States:** Pro gate is enforced both in UI and server-side; empty (*"No absence data to report yet. Log your trips first…"*); loading (*"Generating…"*); client-side date-validation errors. **No export history** is shown (deferred).

---

### S2 — Edit visa profile (Settings → Visa Details)

**Goal:** Correct or update the details that drive every calculation.

**Entry:** User menu → Settings → **Visa Details** tab [`SettingsClient`].

**Path:** *"Visa Profile"* form — first name (required), last name (optional, *"Used in PDF exports"*), visa route, visa start date, plus a read-only **ILR target date**. **"Save changes"** → *"Profile saved."* A **"Redo visa setup"** link re-enters onboarding. A disabled **"Citizenship Mode (450/90 rule)"** toggle is marked *"Coming soon."*

---

### S3 — Account management (Settings → Account)

**Goal:** Manage email, password, subscription, data, and deletion.

**Entry:** Settings → **Account** tab.

**Sub-flows:**
- **Email** — change address → *"Confirmation sent to your new address."*
- **Password** — current + new + confirm (min 8, must match) → *"Password updated."*
- **Subscription** — shows current plan + price + next-payment date. Pro (non-lifetime) get **"Manage subscription"** → Stripe Billing Portal (update card, change cadence, cancel). Lifetime shows *"Lifetime — no renewal."* Free see an upgrade teaser.
- **Data & Privacy** — *GDPR compliant · Data stored in EU* badges; **"Export my data"** downloads JSON of profile + trips.
- **Help & Support** — links to `help@stayright.app` and the Help Centre.
- **Danger Zone → Delete account** — reveals a confirmation requiring the user to type **"delete my account"** exactly; deletes everything and redirects to `/login`. *(Hard delete; soft-delete retention is deferred.)*

---

### S4 — Notification preferences (Settings → Notifications)

**Goal:** Choose which compliance emails to receive.

**Entry:** Settings → **Notifications** tab.

**Path:** Five toggles — 120-day warning · 150-day warning · log-return reminder · ILR reminder (90 days before) · monthly summary. **Pro-only**: Free users see all toggles locked at 50% opacity with a *"🔒 Email notifications are a Pro feature — Upgrade to Pro to enable alerts"* box. Pro users toggle and **"Save changes"** → *"Preferences saved."*

> Note: the *sending* side (cron + email delivery) exists in code but is **not yet deployed end-to-end** — so toggling preferences may not yet produce real emails.

---

### S5 — Manage billing (Stripe Portal)

**Goal:** A paying user updates their card, switches cadence, or cancels.

**Entry:** Settings → Account → **"Manage subscription."** Opens the Stripe Billing Portal and returns to `/settings`. Cancelling reverts to Free but keeps the user's data. Lifetime users have nothing to manage.

---

### S6 — Logged-out marketing → signup

**Goal:** A visitor understands the product and creates an account.

**Entry:** `/` (landing) [`Hero`, `Features`, `Pricing`, `TrustBar`, `Footer`].

**Path:** Scroll narrative — Hero (*"Don't risk your right to stay on a spreadsheet"* + **"Start tracking free"**) → Features (*"Built for the 'any 12-month' rule"*) → Pricing (Free vs Pro, monthly/annual toggle, lifetime link) → Trust bar (*Home Office aligned · GDPR compliant*) → Footer. Every CTA (**Try free · Start tracking free · Get Started · Start Pro Trial**) routes to `/signup`. A first-visit **cookie banner** [`CookieBanner`] offers *"Necessary only"* / *"Accept all."*

**Exit:** `/signup`, or `/login` for returning users.

---

### S7 — Authentication (sign up, log in, verify, reset)

**Goal:** Get into (or back into) the account.

**Entry:** Any CTA, the nav *"Sign in,"* or a redirect from a protected route.

**Sub-flows** [`LoginForm` and the `/auth/*` pages]:
- **Sign up** — email + password (or **Sign up with Google**) → email-verification screen (*"Check your email"*) → magic link → onboarding. The verification screen offers **"Resend verification email."**
- **Log in** — email + password (or Google) → dashboard. Wrong credentials → *"Incorrect email or password."*
- **Forgot password** — request screen → *"Check your email"* → reset link → **"Set new password"** → dashboard.
- **OAuth/callback** — `/auth/callback` exchanges the code, sends a one-time welcome email to brand-new users, and routes new users to onboarding, returning users to the dashboard.

**Edge states:** validation (passwords match, min 8 chars), expired sessions, OAuth failure (*"Something went wrong with your login link"*). Two expiry dead-ends are flagged in Section 6.

---

### S8 — Theme & device adaptation (ambient)

Not a destination journey, but present everywhere: a **light/dark theme toggle** [`ThemeToggle`] in every nav, and responsive collapse of the top nav into a hamburger drawer on mobile. The trip drawer becomes a bottom sheet on mobile.

---

## 5. Journey-to-journey flow (the spine)

```
Landing (S6) ──► Sign up (S7) ──► Onboarding (P5) ──► Dashboard (P2)
                                                          │
                        ┌─────────────────────────────────┼───────────────────────────┐
                        ▼                 ▼                ▼                ▼            ▼
                  Plan a trip (P1)   Log a trip (P3)   Trip log (P6)   Reports (S1)  Settings (S2–S5)
                        │                 │                                  │            │
                        └──► (Free + limit/PDF/alert) ──► Paywall (P4) ──► Stripe ──► Pro unlocked
```

---

## 6. Ambiguities & loose ends

These are flows that exist in code but look unreachable, contradictory, incomplete, or where intent had to be inferred. They are listed separately so they aren't mistaken for confirmed design.

### Unreachable / dead in the running app
- **`Sidebar` and `MobileNav` components are not rendered.** The live shell uses only `TopNav`. The `Sidebar` exposes a different nav model (a "Manage" section with only Dashboard + Reports, a bottom user-card popover) that **no user actually sees**. If a designer references "the sidebar," it does not exist in the product. Decide whether to delete it or adopt it.
- **Two auth expiry dead-ends:** if the session expires on the *verify-email* screen (resend fails) or the *set-new-password* screen, there is no forward path on the page — the user must manually navigate back to `/login`. Worth a "start over" affordance.

### Placeholder / incomplete pages (shippable-blocking)
- **`/about`, `/blog`, `/contact`, `/help` are placeholders** — literal *"Placeholder for…"* copy, no content, no forms. They are linked from the footer, so users *can* reach them and hit a dead end. Notably, `/contact` has **no contact form** despite being the implied support path; support actually lives at the `help@stayright.app` email referenced in Settings.
- **`/terms` and `/privacy-policy` contain visible `[LEGAL REVIEW REQUIRED]` callouts** — real legal text is unfinished.
- **Footer social links** point at bare `twitter.com` / `linkedin.com`, not real StayRight accounts.

### Behaviour worth a design decision
- **No "approaching the limit" UI for the Free trip cap.** The 10-trip limit is enforced only at save time; there's no running counter or "2 trips left" warning, so the paywall arrives as a hard stop on trip #11. Consider a visible quota meter.
- **Setup nudge dismissal is permanent** (local storage). A user who dismisses it before setting their visa date may never be reminded again, leaving the dashboard permanently half-empty.
- **The 5-year ILR period is hard-coded for every visa route.** The visa-route dropdown offers six options, but ILR date is always *start + 5 years* and the UI implies it's *"based on your route."* For routes with different qualifying periods this could mislead. The route field is collected but doesn't change any calculation.
- **"Currently abroad" banner is non-dismissible** by design (it should nag), but there's no in-banner shortcut to actually log the return beyond a link to the trip log.
- **Plan-mode analytics fire `trip_plan_completed` even on "Just checking"** (no save) — an analytics/intent nuance, not a user-facing bug, but it means "plan completed" ≠ "trip saved."
- **Pro upsell appears *inside* onboarding** (the quota celebration box mentions Pro before the user has finished setup) — intentional, but a place to check tone.

### Built-but-not-live (not user-reachable yet)
- **Email notifications**: cron routes (`/api/cron/daily`, `/api/cron/monthly`) and templates exist, but delivery is *"not yet deployed end-to-end"* — so the Notifications tab currently configures emails that may not send.
- **Reports export history** and **soft-delete account retention** are referenced as deferred — not present in the UI.

### Naming nuance for designers
- The product calls the same engine output four risk levels — **Compliant / Approaching Limit / Near Breach / Breach** — but several surfaces also use shorthand copy ("Safe to travel," "plan carefully"). Keep the four canonical labels [`RISK_CONFIG`] as the source of truth and treat the prose as supporting microcopy.

---

*End of document.*
