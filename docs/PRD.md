# StayRight v1 — Product Requirements Document

> **Status:** Final — v1.3
> **Last updated:** 2026-03-21
> **Author:** David Flynn-Coutts
> **Document authority:** When there is a conflict between this document and the Stitch wireframes, this document wins.

---

## Feature Status

Find your feature here, then jump directly to that section. Do not read the full PRD.

| Feature | Status | PRD Section |
|---|---|---|
| Landing page | Complete | 4k |
| Auth (email + Google OAuth, password reset) | Complete | 4a |
| Onboarding (3-step flow) | Partial — first_name not collected in VisaForm (Q11) | 4b |
| 180-day absence engine | Complete | 4c |
| Dashboard (quota ring, period bar, ILR timeline) | Complete | 4d |
| What-if simulator (plan a trip) | Complete | 4e |
| Trip log (log, edit, delete) | Complete | 4f |
| Reports + PDF export | Partial — export history list deferred (DECISION-024) | 4g |
| Settings (visa profile, notifications, account deletion) | Partial — last_name deferred (DECISION-033) | 4h |
| Email notifications (Resend + Vercel Cron) | Partial — routes built, not yet deployed end-to-end | 4i |
| Payments / Stripe (Checkout, Portal, Webhook) | Partial — webhook idempotency deferred (DECISION-041) | 4j |

---

## 1. Product Overview

### 1.1 What StayRight Is

StayRight is a web-based visa absence tracker that helps UK Skilled Worker visa holders stay compliant with the 180-day absence rule required for Indefinite Leave to Remain (ILR) eligibility. It replaces error-prone spreadsheets and mental arithmetic with a live rolling-window calculator, a "what-if" trip simulator, and audit-ready PDF exports — giving users the confidence to book international travel without risking their permanent residency application.

### 1.2 Core Job to Be Done

> "I want to book this trip — can I do it safely without risking my ILR?"

The primary use case is **decision support at the point of booking**, not daily monitoring. Users visit StayRight when they are planning a trip and need to know whether that trip will push them over the 180-day absence limit in any rolling 12-month window.

### 1.3 Target User

| Attribute | Detail |
|---|---|
| **Visa route** | Skilled Worker visa (formerly Tier 2 General) |
| **Qualifying period** | 5-year continuous lawful residence for ILR |
| **Travel pattern** | 2–4 longer trips per year, typically 2–4 weeks each |
| **Trip profile** | Trips home to non-European countries (India, Nigeria, Philippines, New Zealand, etc.) plus European holidays |
| **Risk profile** | More likely to be in warning territory than a casual traveller, which increases product value |
| **Logging behaviour** | Retroactively logs trips rather than logging at the airport. "Currently abroad" real-time state is a nice-to-have, not a core behaviour |
| **Decision moment** | When browsing flights or considering a trip — "Can I take this trip safely?" |

### 1.4 What Success Looks Like at 6 Months

| Metric | Target |
|---|---|
| Registered users | 1,000+ |
| Monthly active users | 400+ |
| Free → Pro conversion rate | 8–12% |
| Pro subscriber retention (month 3) | 60%+ |
| PDF exports generated | 200+ total |
| NPS | 40+ |
| Organic search traffic | 500+ monthly visits to landing page / blog |

---

## 2. V1 Scope

### 2.1 In Scope

| Area | What's Included |
|---|---|
| **Platform** | Responsive web app (desktop + mobile-optimised). No native mobile app. |
| **PWA** | Progressive Web App — the web app must be installable on mobile home screens and work offline for viewing existing trip data (read-only). Push notifications deferred to v2 (DECISION-030) — email notifications cover alert delivery in v1. |
| **Authentication** | Google OAuth + email/password signup, email verification, password reset |
| **Onboarding** | Visa route selection, visa start date entry, bulk past trip entry |
| **Dashboard** | Quota ring (days used / 180), qualifying period progress bar, "Plan a Trip" CTA, recent trip history, ILR eligibility timeline, amber alert card, compliance disclaimer |
| **What-if simulator** | Enter departure + return dates → live rolling window impact calculation → Safe / Warning / Danger verdict → option to save as trip |
| **Trip log** | Add, edit, delete trips. Retroactive entry. Trip detail view. |
| **Reports** | ILR Absence Table (PDF, Pro only), Rolling Window History (PDF, Pro only), Custom Date Range (PDF, Pro only) |
| **Settings** | Visa profile, notification preferences, account management (email, password, delete) |
| **Notifications** | Email-based threshold warnings (120 days, 150 days), monthly compliance summary email, ILR reminder 90 days before eligibility |
| **Payments** | Stripe integration. Free + Pro tiers. Monthly (£2.99), annual (£24.99), and lifetime (£49.99) billing. No trial period. |
| **Landing page** | Marketing site with hero, features, pricing, footer |
| **Accessibility** | All interactive elements must meet WCAG 2.1 AA. Colour is not the only indicator of status — icons and text must accompany all colour-coded status elements (e.g. SAFE/WARNING/DANGER chips must include both colour and label text). |
| **Browser support** | Latest two versions of Chrome, Safari, Firefox, and Edge. Responsive breakpoints: mobile (390px), tablet (768px), desktop (1280px+). |
| **Cookie consent** | GDPR-compliant cookie consent banner (see Section 4m). |
| **Analytics** | Privacy-friendly analytics (see Section 4n). |

### 2.2 Out of Scope for V1

| Feature | Reason |
|---|---|
| **Native mobile app (iOS/Android)** | Core use case (trip planning) happens on desktop. Responsive web + PWA covers mobile needs. Add in v2 once web is validated. |
| **Family / multi-profile** | Adds multi-tenancy complexity for marginal revenue. Validate demand first. |
| **Citizenship mode (450/90-day tracking)** | Different user, different calculation, different life stage. ILR market is sufficient for v1. |
| **Calendar view** | Trip list with dates covers the same information need. Added visual complexity without proportional value. |
| **CSV import** | Planned for v1.1. v1 uses manual bulk entry during onboarding. |
| **Real-time departure detection** | Founder research confirms users log retroactively. Not a core behaviour. |
| **Live chat support** | Unsustainable support commitment at £2.99/month. Use email + help centre. |
| **Referral system** | Premature before product-market fit is established. |
| **Calendar & email sync** | Integration complexity not justified for v1. Manual entry is sufficient. |
| **Real-time passport sync** | Does not exist as a viable integration. Remove from all marketing copy. |
| **14-day free trial** | The free tier (10 trips, full rolling window visibility) already lets users experience the product before paying. Trial adds engineering complexity (trial tracking, expiry logic, trial-to-paid conversion) for minimal incremental conversion benefit. Users upgrade when they hit the paywall, not after a time-limited trial. |
| **Any feature not explicitly listed in section 2.1** | If it's not listed above, it's not in v1. |

---

## 3. Pricing

> **This section is the single source of truth for pricing. All screens, copy, emails, and the landing page must match these numbers exactly.**
>
> **There is no free trial.** The Free tier serves as the try-before-you-buy experience. Users upgrade via the paywall when they need Pro features.

### 3.1 Free Tier

| Attribute | Value |
|---|---|
| **Price** | £0 forever |
| **Trips** | Up to 10 trips logged |
| **Rolling window status** | Visible (quota ring, days used) |
| **What-if simulator** | Available for the first 10 trips only; paywall after 10 saved trips |
| **PDF export** | Not available |
| **Email alerts** | Not available |
| **Platform** | Web (responsive) |

### 3.2 Pro Tier

| Attribute | Value |
|---|---|
| **Monthly price** | £2.99/month |
| **Annual price** | £24.99/year (save 30%) |
| **Lifetime price** | £49.99 one-time payment |
| **Trips** | Unlimited |
| **What-if simulator** | Unlimited |
| **PDF exports** | ILR Absence Table, Rolling Window History, Custom Date Range |
| **Email alerts** | Threshold warnings (120 days, 150 days) + monthly compliance summary |
| **Platform** | Web (responsive, mobile-optimised) |

**Lifetime plan details:** The £49.99 lifetime plan grants permanent Pro access including all future features added to the Pro tier. It is processed as a one-time Stripe Checkout payment (not a subscription). Lifetime users never see renewal prompts or payment failure banners. "Lifetime" effectively means "until the user no longer needs StayRight" — the product has a natural expiry when the user achieves citizenship (typically 6 years from visa start).

### 3.3 Paywall Triggers

The paywall appears when a Free user:
1. Attempts to log an 11th trip
2. Attempts to run a what-if simulation when they already have 10 saved trips
3. Attempts to generate a PDF export
4. Attempts to configure email alert thresholds

The paywall is a modal (see Section 4l for full spec).

---

## 4. Features

### 4a. Authentication

**What it does:** Users create an account or sign in to access their absence data.

**Supported flows:**
- Email + password signup (with email verification)
- Google OAuth signup/login
- Email + password login
- Password reset (request → check email → set new password)

**Acceptance criteria:**
- [ ] User can sign up with email + password and receives a verification email
- [ ] User cannot access the app until email is verified (redirect to verification prompt)
- [ ] User can sign up / log in with Google OAuth in a single click
- [ ] Google OAuth creates a new account if one doesn't exist, or logs in if it does
- [ ] User can request a password reset and receives an email with a reset link
- [ ] Reset link expires after 24 hours
- [ ] After reset, user is logged in automatically
- [ ] Session persists across browser restarts (remember me by default)
- [ ] Logout clears the session
- [ ] Auth endpoints are rate-limited: 5 failed attempts per 15 minutes per IP, then temporary lockout with message "Too many attempts. Please try again in 15 minutes."

**Edge cases:**
- User signs up with email, then later tries Google OAuth with the same email → link accounts, don't create a duplicate
- User signs up with Google OAuth, then tries to set a password → allow this (they may want email+password as a fallback)
- Email verification link clicked after expiry → show friendly "link expired" message with option to resend

**Wireframe references:** `web2/v3_onboarding_1_welcome`, `web2/v3_password_reset_1_request`, `web2/v3_password_reset_2_check_email`, `web2/v3_password_reset_3_new_password`

---

### 4b. Onboarding

**What it does:** After signup, walk the user through setting up their visa profile and entering past trips so they arrive at a populated dashboard, not an empty one.

**Flow:**
1. **Welcome screen** — "Welcome to StayRight" → "Let's go" / "Skip setup"
2. **Visa setup** — Enter first name (required), select visa route (Skilled Worker pre-selected), enter visa start date, confirm qualifying period (auto-calculated as 5 years from start date). **No last name field at this stage** — see DECISION-033.
3. **Bulk past trip entry** — "Add your travel history" — a streamlined form to quickly add multiple past trips (destination + departure date + return date). Show a running count such as "2 trips added". Allow "Add another" or "Done".
4. **Dashboard** — Arrive at a populated dashboard showing the quota ring based on entered trips

**Acceptance criteria:**
- [ ] Onboarding starts automatically after first login / email verification
- [ ] First name (required) is collected in the visa setup step and saved to `profiles.first_name`
- [ ] No last name field during onboarding — deferred to Settings and PDF generation (see §4g, §4h, DECISION-033)
- [ ] Visa start date is required; route defaults to "Skilled Worker"
- [ ] ILR target date auto-calculates as visa start date + 5 years
- [ ] Bulk trip entry allows adding 0 or more trips in sequence
- [ ] Each trip requires: destination (free text), departure date, return date
- [ ] Departure date must be before return date
- [ ] "Skip setup" bypasses onboarding and lands on empty dashboard with a prompt to set up visa profile
- [ ] Onboarding state is persisted — if user closes browser mid-flow, they resume where they left off
- [ ] After onboarding, user never sees the onboarding flow again (unless they reset their profile)

**Edge cases:**
- User enters a visa start date in the future → show validation error: "Visa start date must be in the past"
- User enters a trip with dates before their visa start date → allow it (they may want to track pre-visa travel for their own records), but do not count it in the rolling window calculation
- User enters overlapping trips → show warning but allow save (they may have crossed borders)

**Wireframe note:** The wireframes show onboarding steps 1–3 (welcome, visa setup, walkthrough) but **do not include a bulk trip entry step**. This step must be added between visa setup and the empty dashboard. The "walkthrough" step in the wireframes can be cut — users don't need a feature tour; they need their data entered.

---

### 4c. The 180-Day Calculation Engine

**What it does:** The core compliance engine that calculates how many days a user has been absent from the UK in any rolling 12-month period.

> [!IMPORTANT]
> This is the most critical business logic in the product. An incorrect calculation could lead a user to breach their visa conditions. The logic must be exact and thoroughly tested.

**The rule (canonical definition):**

To qualify for ILR under the Skilled Worker route, the applicant must not have been absent from the UK for more than 180 days in any rolling 12-month period during their qualifying period.

**How to count absence days:**

This follows the official Home Office position (Appendix Continuous Residence guidance, confirmed by immigration barristers):

- A "day of absence" is a full day spent entirely outside the UK
- **The day of departure from the UK is NOT counted** as a day of absence (the user is present in the UK that day)
- **The day of return to the UK is NOT counted** as a day of absence (the user is present in the UK that day)
- Only full days between departure and return are counted
- **Formula:** `absence_days = (return_date - departure_date) - 1`
- Example: Depart 1 March, return 8 March → 6 days of absence (2, 3, 4, 5, 6, 7 March)
- Example: Depart 1 March, return 2 March → 0 days of absence (no full days outside UK)

**Crown Dependencies — special case (0 absence days):**

Following the 2025 rule update, time spent in Jersey, Guernsey, and the Isle of Man counts toward UK continuous residence and must **not** be counted as absence.

- If a trip's destination is Jersey, Guernsey, or Isle of Man, the engine returns `absence_days = 0` regardless of dates entered
- These three are the only exceptions — all other destinations outside Great Britain and Northern Ireland count as absence
- British Overseas Territories (Gibraltar, Bermuda, Cayman Islands, Falkland Islands, etc.) are **not** Crown Dependencies and count as absence in full

**Multi-leg trips:**

A multi-leg trip (user travels to multiple destinations before returning to the UK) is recorded as a single trip using the first UK departure date and the final UK return date. Intermediate destinations and stopover dates are not tracked by the engine — only the full period outside the UK matters for compliance. Users may record multiple destinations in the trip notes field for their own reference.

> [!NOTE]
> Some immigration solicitors advise clients to count the departure day as an absence as an additional personal buffer. StayRight uses the official formula. Conservative buffers are applied through warning thresholds (120 and 150 days) rather than through a non-standard formula. This ensures calculations match what the Home Office uses while giving users a meaningful safety margin.

**The rolling window:**
- The window is NOT a calendar year (Jan–Dec). It is any 12-month period.
- To check compliance, the engine must check **every possible 12-month window** that falls within the qualifying period
- In practice: for any date D, sum all absences in the 12-month period ending on D. If that sum exceeds 180, the user has breached.
- The dashboard displays the **current rolling window** (the 12-month period ending today) and the **peak rolling window** (the 12-month period with the highest absence count)

**Risk thresholds:**

| Status | Condition | Colour |
|---|---|---|
| **SAFE** | Current rolling window ≤ 120 days | Green (`#9ff4ca` badge) |
| **WARNING** | Current rolling window 121–150 days | Amber (`#fe932c` / secondary) |
| **DANGER** | Current rolling window 151–170 days | Red (`#ffdad5` / tertiary-fixed) |
| **BREACH** | Current rolling window > 180 days | Red (`#8e0009` / tertiary) with bold alert |

**Qualifying period calculation:**
- Starts on visa start date
- Ends 5 years after visa start date (the ILR eligibility date)
- Progress = (today − visa start date) / (5 years) as a percentage
- Display: "63% — Started 14 Jan 2023 → ILR eligible 14 Jan 2028"

**Acceptance criteria:**
- [ ] Absence days are calculated as `(return_date - departure_date) - 1`
- [ ] A same-day return (depart and return on same date) counts as 0 days
- [ ] A next-day return counts as 0 days (depart Monday, return Tuesday = 0 full days absent)
- [ ] The rolling window checks every possible 12-month period, not just the current one
- [ ] Dashboard shows the current rolling window count and the correct risk status
- [ ] The peak rolling window is surfaced in the Reports summary
- [ ] Trips with dates before the visa start date are stored but excluded from the calculation
- [ ] The engine handles trips that span the boundary of a 12-month window correctly (split the trip across windows)
- [ ] All calculations are performed server-side (not client-only) to ensure accuracy
- [ ] A trip to Jersey, Guernsey, or Isle of Man returns 0 absence days regardless of dates
- [ ] A trip to Gibraltar or any British Overseas Territory counts absence as normal

**Edge cases:**
- Trip spans the boundary of two 12-month windows → the days within each window are counted separately toward that window's total
- User has no trips logged → rolling window = 0, status = SAFE
- User changes their visa start date after logging trips → all calculations must recalculate
- Leap years → use actual calendar dates, not a fixed 365-day assumption
- Trips that overlap with each other → count each calendar day only once (de-duplicate overlapping ranges)
- Multi-leg trip (multiple destinations, single trip record) → calculate absence using first departure and final return dates only; intermediate stopovers are irrelevant to the engine
- Crown Dependency trip (Jersey / Guernsey / Isle of Man) → absence days = 0; trip is stored but contributes nothing to the rolling window

---

### 4d. Dashboard

**What it does:** The home screen after login. Shows the user's compliance status at a glance and provides quick access to trip planning.

**Components:**
1. **Quota ring** — Circular progress indicator showing days used / 180 in the current rolling window. Large central number. Risk status badge (SAFE/WARNING/DANGER/BREACH). Badge must include both colour and text label (WCAG: colour is not the only indicator).
2. **Qualifying period progress** — Linear progress bar showing how far through the 5-year qualifying period the user is. Shows start date, ILR eligibility date, and percentage.
3. **"Plan a Trip" CTA** — Primary action button. Opens the what-if simulator. Helper text: "See the impact before you book".
4. **"Log a Past Trip" CTA** — Secondary action. Opens the trip entry form in retroactive mode. Helper text: "Add trips you've already taken".
5. **Recent trip history** — A small set of recent trips with destination, dates, duration, and risk status chip.
6. **ILR eligibility timeline** — Vertical timeline showing target eligibility date and application window.
7. **Amber alert card** — Contextual warning when the user is approaching thresholds. Only shown when relevant.
8. **Compliance disclaimer** — Small text below the quota ring: "Calculations follow official Home Office guidance. Always verify with an immigration adviser if you are approaching the limit." Always visible.

**Acceptance criteria:**
- [ ] Quota ring displays the correct days count and risk status
- [ ] Quota ring animates on load (stroke-dashoffset transition)
- [ ] Qualifying period progress bar shows correct percentage and dates
- [ ] "Plan a Trip" button opens the what-if simulator modal
- [ ] "Log a Past Trip" button opens the trip entry form with dates defaulting to empty (not today)
- [ ] Recent history shows the most recent trips, sorted by departure date descending
- [ ] Each trip card shows country flag emoji, destination name, date range, duration, and risk chip
- [ ] Amber alert card appears when rolling window is between 121–150 days
- [ ] Red alert card appears when rolling window exceeds 150 days
- [ ] No alert card when status is SAFE
- [ ] Compliance disclaimer is always visible below the quota ring
- [ ] ILR Mode toggle renders as disabled/greyed when clicked, showing a "Coming soon" tooltip (citizenship mode is not in v1)

**Wireframe reference:** `web2/v3_dashboard_overview`

---

### 4e. What-If Simulator / Plan a Trip

**What it does:** The most important screen in the product. Allows the user to enter hypothetical trip dates and instantly see the impact on their rolling window — answering "Can I book this trip safely?"

**Flow:**
1. User clicks "Plan a Trip →" on the dashboard
2. Modal opens with a 3-step flow: Destination → Dates → Confirm
3. **Step 1 (Destination):** Free text destination field. If the user enters Jersey, Guernsey, or Isle of Man, the live calculation panel shows 0 absence days and a note: "Time in Crown Dependencies does not count as absence."
4. **Step 2 (Dates):** Departure date + Return date. As soon as both dates are entered, a **live calculation panel** appears showing:
   - "This trip: X days" (calculated using the absence formula)
   - "Y days remaining" after this trip
   - Rolling window progress bar showing usage after the hypothetical trip
   - Risk verdict: "SAFE TO TRAVEL" / "WARNING" / "DANGER — THIS TRIP WOULD BREACH THE 180-DAY LIMIT"
5. **Step 3 (Confirm):** Summary of the trip + the impact. Option to "Save this trip" (adds it to the trip log) or "Just checking" (discard).

**Acceptance criteria:**
- [ ] The live calculation panel updates in real-time as dates change (no submit button needed)
- [ ] The calculation shows the rolling window count **after** adding the hypothetical trip on top of existing trips
- [ ] The risk verdict badge uses the same thresholds as the dashboard (SAFE ≤120, WARNING 121–150, DANGER 151–170, BREACH >180)
- [ ] If the trip would cause a breach, show an explicit red warning: "This trip would push you to X/180 days in the rolling window ending [date]. You would breach the absence limit."
- [ ] "Save this trip" adds the trip to the trip log and returns to the dashboard with updated numbers
- [ ] "Just checking" closes the modal without saving
- [ ] The "I'm leaving today" toggle sets the departure date to today
- [ ] The "I'll log my return later" option allows saving a trip with departure date only (return date null), displayed as "Currently abroad" on the trip list
- [ ] Free users who already have 10 trips see the paywall modal (Section 4l) when trying to use the simulator
- [ ] The calculation API is rate-limited to 60 requests per minute per user to prevent abuse

**Edge cases:**
- Return date is before departure date → show validation error
- Trip dates overlap with an existing trip → show warning but allow (user may be entering a multi-leg trip stored as one record)
- User enters dates far in the future (e.g. 2 years) → the rolling window calculation should project forward correctly
- User enters a trip that starts in the past and ends in the future → treat as a valid trip
- Multi-leg trip (e.g. London → Dubai → Bangkok → London) → user enters the first UK departure date and final UK return date as a single trip; they may note destinations in the notes field; calculation uses only the UK-to-UK period

**Wireframe reference:** `web2/v3_log_new_trip_modal`

---

### 4f. Trip Log

**What it does:** A complete list of all logged trips with the ability to add, edit, and delete entries.

**Display:**
- List view, sorted by departure date descending (most recent first)
- Each entry shows: destination, departure date, return date, duration (X days), risk chip
- Trips with no return date show "Currently abroad" status
- Multi-leg trips are shown as a single row using the first departure date and final return date. The trip's destination field shows whatever the user entered (e.g. "Dubai, Bangkok").
- Trip detail: clicking a trip opens a detail view showing all trip data + its contribution to the rolling window at the time. For Crown Dependency trips, the contribution is shown as 0 days with a note explaining why.

**Crown Dependencies note in trip detail:**

All trip detail views must include the following note (in small text, always visible):
> "Time in Crown Dependencies (Jersey, Guernsey, Isle of Man) does not count as absence. Time in British Overseas Territories (Gibraltar, Bermuda etc.) does count as absence. If you are unsure, consult an immigration adviser."

**Actions:**
- **Add trip** — same modal as the what-if simulator but with a "Save" action (no "Just checking" option)
- **Edit trip** — opens the trip in an edit modal with pre-filled data. Changes trigger recalculation.
- **Delete trip** — confirmation dialog, then remove. Triggers recalculation.

**Acceptance criteria:**
- [ ] Trip list shows all trips, ordered by departure date descending
- [ ] Each trip displays destination, dates (formatted as "12–19 May 2026"), duration, and risk chip
- [ ] Add trip flow is identical to the what-if simulator but skips the "Just checking" option
- [ ] Edit trip pre-fills all fields and shows the updated live calculation
- [ ] Delete trip shows a confirmation dialog: "Delete this trip? This will recalculate your absence record."
- [ ] After any add/edit/delete, the dashboard quota ring and all calculations update immediately
- [ ] Free users see the paywall modal (Section 4l) when attempting to add a 4th trip
- [ ] Crown Dependency trips (Jersey, Guernsey, Isle of Man) show 0 absence days in the trip detail with an explanatory note
- [ ] Trip detail always displays the Crown Dependencies / BOT disclaimer note
- [ ] Multi-leg trips display as a single row; the destination field shows the user's entered text

**Edge cases:**
- Deleting a trip that was causing a breach → status should recalculate to SAFE/WARNING as appropriate
- Editing a trip's dates to overlap with another trip → show warning but allow
- Trip list is empty → show empty state (see Copy section)
- Crown Dependency trip edited to a non-Crown-Dependency destination → recalculate absence days using the actual date range

**Wireframe references:** `web2/v3_trip_history`, `web2/v3_trip_detail`

---

### 4g. Reports & PDF Export

**What it does:** Generate formatted PDF documents suitable for inclusion in an ILR application (SET(O) or SET(M) form). **Pro only.**

**Report types:**

| Report | What It Contains |
|---|---|
| **ILR Absence Table** | A chronological table of all absences from the UK during the qualifying period. Columns: Departure date, Return date, Destination, Days absent, Reason for travel. Matches the format requested by the Home Office on the SET(O) form. |
| **Rolling Window History** | Month-by-month breakdown showing the rolling window count at the start of each month throughout the qualifying period. Highlights any months where the count exceeded thresholds. |
| **Custom Date Range** | Same as the ILR Absence Table but filtered to a user-specified date range. |

**Acceptance criteria:**
- [ ] Reports are generated as downloadable PDFs
- [ ] Before generating, check `profiles.last_name`. If absent: show an inline prompt — "What name should appear on this document?" with a pre-filled editable first name field and a required last name field, and the note "This will be saved to your profile." On confirm, save both fields to the profile and proceed to generate. If `last_name` is already set, skip the prompt and generate immediately. See DECISION-033.
- [ ] PDFs include the StayRight logo, user's full name (`first_name last_name`), visa route, and qualifying period dates in a header
- [ ] ILR Absence Table lists all trips in chronological order with all required columns
- [ ] ILR Absence Table shows a summary row at the bottom: "Total absence days: X"
- [ ] Rolling Window History calculates the window count at the 1st of each month
- [ ] Custom Date Range validates that start date is before end date
- [ ] All reports are gated behind the Pro paywall — Free users see the report list but get the paywall modal (Section 4l) when they click "Generate" or "Download"
- [ ] Recent exports are shown in a sidebar list with date, type, and re-download option
- [ ] PDF file naming convention: `StayRight_ILR_Absence_Table_2026-03-21.pdf`

**Edge cases:**
- User has no trips → PDF generates with an empty table and a note: "No absences recorded during this period"
- Custom date range spans outside the qualifying period → allow it (user may want a record for other purposes)
- User deletes a trip after generating a report → the report is now stale. Show a note on the report list: "Your travel data has changed since this report was generated"

**Wireframe reference:** `web2/v3_reports_exports`

---

### 4h. Settings

**What it does:** Manage visa profile, notification preferences, account details, and subscription.

**Sections:**

1. **Visa Profile** — displays and allows editing of: **First name** (required), **Last name** (optional — helper text: "Used in PDF exports"), visa route, visa start date, qualifying period, ILR target date (auto-calculated). ILR Mode toggle (renders as disabled/greyed in v1 — clicking it shows a "Coming soon" tooltip since citizenship mode is out of scope). See DECISION-033 for name field rationale.
2. **Notifications** — toggle on/off for each alert type: warn at 120 days, warn at 150 days, log return reminder, ILR reminder 90 days before, renewal reminder.
3. **Account** — email address (editable), password change, delete account.
4. **Subscription** — displays current plan (Free, Pro Monthly, Pro Annual, or Pro Lifetime), price, renewal date (or "Lifetime — no renewal" for lifetime users), and "Manage subscription" button (links to Stripe Customer Portal). For lifetime users, "Manage subscription" is hidden.
5. **Data & Privacy** — GDPR badges, "Export my data" button (immediate JSON download of all user data), privacy policy link.
6. **Help & Support** — email address (help@stayright.co.uk), link to help centre.

**Data retention policy:**
- On account deletion, all user data is soft-deleted and retained for 30 days to allow for accidental deletion recovery
- After 30 days, all personal data is permanently and irreversibly deleted from the database
- Stripe customer records are cancelled but retained by Stripe per their own data retention policy (not under our control)
- Anonymised, aggregated analytics data (e.g. "a user generated a PDF") is retained indefinitely — no PII is stored in analytics

**Help centre:**
The help centre is a static set of FAQ pages hosted at `/help` within the app. Content to be written post-launch. For v1, the help centre link points to a single page with the contact email (help@stayright.co.uk) and a basic FAQ covering: how the 180-day rule works, how to add trips, how to upgrade, how to export data, and how to delete your account.

**Acceptance criteria:**
- [ ] All visa profile fields are editable
- [ ] First name is required; last name is optional with helper text "Used in PDF exports"
- [ ] Changing the visa start date triggers recalculation of all rolling windows and the ILR target date
- [ ] Notification toggles persist and control email delivery
- [ ] Email address change requires re-verification
- [ ] Password change requires current password
- [ ] Delete account shows a confirmation dialog with the text "This will permanently delete your account and all travel data. This cannot be undone."
- [ ] Delete account requires typing "DELETE" to confirm
- [ ] After deletion, data is soft-deleted and retained for 30 days, then permanently purged
- [ ] Subscription card shows the correct plan and price from Section 3
- [ ] "Manage subscription" opens Stripe Customer Portal (hidden for lifetime users)
- [ ] "Export my data" generates an immediate JSON file download with all user data (profile + trips)
- [ ] ILR Mode toggle is visible but disabled — clicking shows "Coming soon" tooltip

**Wireframe note:** The v1 wireframe (`web/v1_settings`) shows a "concierge chat" feature in Help & Support. **Do not build this.** The v3 wireframe (`web2/v3_settings`) correctly shows email + help centre link only. Use the v3 version.

**Wireframe note:** The v3 settings wireframe shows £2.99/month in the subscription card. This is **correct** — use this price.

**Wireframe reference:** `web2/v3_settings`

---

### 4i. Email Notifications

**What it does:** Proactive email alerts to keep users informed about their compliance status. **Pro only** (except welcome email).

**Email types:**

| Email | Trigger | Subject Line | Free? |
|---|---|---|---|
| **Welcome** | After signup + email verification | "Welcome to StayRight — let's set up your profile" | Yes |
| **Threshold: 120 days** | Rolling window reaches 120 days | "Heads up — you've used 120 of 180 absence days" | Pro only |
| **Threshold: 150 days** | Rolling window reaches 150 days | "⚠️ Warning — 150 of 180 absence days used" | Pro only |
| **Monthly summary** | 1st of each month | "Your March absence summary — 42/180 days used" | Pro only |
| **ILR reminder** | 90 days before ILR eligibility date | "Your ILR application window opens in 90 days" | Pro only |
| **Log return reminder** | 3 days after a trip's planned return date if no return logged | "Welcome back — don't forget to log your return" | Pro only |

**Monthly summary email — detailed spec:**

Format: HTML email via Resend with StayRight brand styling. A plain text fallback must always be generated alongside the HTML version.

Sent on the 1st of each month to all Pro users with monthly summary notifications enabled.

Subject line: `"Your {month} absence summary — {daysUsed}/180 days used"`

Email sections in order:

1. **Header** — StayRight logo + wordmark. Headline: "Your {month} Absence Summary". Subheadline: "Here's where you stand this month." Background: `#006948`.
2. **Status card** — Large number "{daysUsed} / 180". Risk badge (SAFE / WARNING / DANGER) in the appropriate status colour. Label: "In your current rolling 12-month window." Linear progress bar in the status colour.
3. **Key stats** — Three items inline: Days remaining: `{daysRemaining}` · Trips this month: `{tripsThisMonth}` · Qualifying period: `{percentComplete}% complete`.
4. **Recent trips** (only if trips occurred in the past month) — Simple table: Destination | Dates | Days. Maximum 3 rows. If more than 3, show "View all trips →" link to the app.
5. **Next known trip** (if a future trip is logged) — "{destination} · {departureDate}". Note: "This trip will use {days} of your remaining {daysRemaining} days." If no future trip logged: "No upcoming trips logged. Plan a trip →" link to `/dashboard`.
6. **CTA button** — "View your full compliance dashboard →". Filled `#006948` gradient button. Links to `/dashboard`.
7. **Footer** — "You're receiving this because you have monthly summaries enabled. [Manage preferences] · [Unsubscribe]". Small text disclaimer: "Not legal advice. Always verify with UKVI."

**Acceptance criteria:**
- [ ] Welcome email is sent to all users after email verification
- [ ] Threshold emails fire once per threshold crossing, not repeatedly
- [ ] Monthly summary is sent on the 1st of each month to Pro users with the toggle enabled
- [ ] Monthly summary renders correctly in HTML with all 7 sections
- [ ] Monthly summary has a plain text fallback version
- [ ] Monthly summary subject line uses the dynamic pattern: "Your {month} absence summary — {daysUsed}/180 days used"
- [ ] Recent trips table shows a maximum of 3 rows; shows "View all trips" link if more
- [ ] If no future trip is logged, the next trip section shows "No upcoming trips logged"
- [ ] All emails include an unsubscribe link and match the StayRight brand (botanical green, Manrope headers)
- [ ] Email delivery is controlled by the toggles in Settings
- [ ] Emails are not sent to Free users (except welcome email)

**Edge cases:**
- User crosses 120 days and 150 days on the same day (large trip) → send both emails
- User's rolling window drops below a threshold after being above it → do not re-trigger the alert if it rises again within the same rolling window
- Monthly summary sent on 1st February for a user with no trips in January → recent trips section is omitted; show "No trips in {month}" instead

---

### 4j. Payments (Stripe)

**What it does:** Handle subscription management via Stripe Checkout and Customer Portal.

**There is no free trial.** The Free tier serves as the try-before-you-buy experience. Users upgrade when they hit a paywall trigger (see Section 3.3).

**Flows:**
- **Upgrade to Pro:** User hits a paywall → paywall modal (Section 4l) → select plan → Stripe Checkout session → redirect back to app on success → unlock Pro features immediately
- **Manage subscription:** Settings → "Manage subscription" → Stripe Customer Portal → user can change plan, update payment method, cancel
- **Cancel:** Handled via Stripe Customer Portal. On cancellation, Pro features remain active until the end of the billing period, then revert to Free.
- **Annual plan:** Offered as an option in the paywall modal and during Stripe Checkout (£24.99/year, displayed as "save 30%")
- **Lifetime plan:** Offered as an option in the paywall modal (£49.99, one-time Stripe Checkout payment). Lifetime users never see renewal prompts. "Manage subscription" is hidden for lifetime users.

**Acceptance criteria:**
- [ ] Stripe Checkout opens with the correct price for the selected plan
- [ ] On successful payment, the user's plan updates instantly (webhook)
- [ ] On cancellation, Pro features remain until the end of the billing period
- [ ] After billing period ends, user reverts to Free tier restrictions (10 trips, no exports, no alerts)
- [ ] User's existing data (trips, settings) is preserved on downgrade — they just can't add more trips beyond 10 or generate exports
- [ ] Annual plan shows annual price and "save 30%" on Stripe Checkout
- [ ] Lifetime plan shows one-time price on Stripe Checkout and never recurs
- [ ] Lifetime users are never shown renewal prompts, payment failure banners, or "Manage subscription" links
- [ ] Stripe webhooks handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] On payment failure, show a banner in the app: "Your payment failed. Please update your payment method to keep Pro features."
- [ ] All webhooks are idempotent — processing the same event twice has no side effects
- [ ] All webhook events are logged for debugging
- [ ] Failed webhooks are retried up to 3 times before alerting

**Edge cases:**
- User is on Free, has 5 trips from a cancelled Pro subscription → they can view all 5 trips but cannot add new ones until they re-subscribe or delete trips to get back to 3
- User subscribes via annual, then requests refund within 14 days → handle via Stripe Dashboard (manual)
- User upgrades mid-month → Stripe prorates (use Stripe default proration)
- Lifetime user requests a refund → handle via Stripe Dashboard (manual). On refund, revert to Free tier.

---

### 4k. Landing Page

**What it does:** The marketing site at the root URL. Converts visitors into signups.

**Sections:**
1. **Navigation** — Logo, anchor links (Features, Pricing), "Start Free Tracker" CTA
2. **Hero** — Headline, sub-copy, primary CTA ("Start Free Tracker"), secondary CTA ("See how it works"), device mockup showing the quota ring
3. **Features bento grid** — 6 feature cards (see Copy section for correct titles and descriptions)
4. **Pricing** — Free vs Pro comparison (must match Section 3 exactly — £2.99/month, £24.99/year, £49.99 lifetime)
5. **Trust bar** — "Built by a Skilled Worker visa holder" + "GDPR compliant · Data stored in the UK"
6. **Footer** — Logo, tagline, links (Privacy Policy, Terms of Service, Help Center, Contact), copyright (dynamic year)

**Acceptance criteria:**
- [ ] All pricing matches Section 3 exactly (£2.99/month, £24.99/year, £49.99 lifetime)
- [ ] Hero CTA "Start Free Tracker" links to signup
- [ ] No fabricated trust signals (no "10,000+ users", no fake brand logos)
- [ ] Features listed match what is actually being built in v1 (no passport sync, no calendar sync)
- [ ] Page loads in under 3 seconds on 4G connection
- [ ] Page is responsive (mobile, tablet, desktop)
- [ ] Page has proper meta title and description for SEO
- [ ] Navigation links are anchor links scrolling to the relevant section on the same page (no separate Visa Rules page in v1)
- [ ] Copyright year is rendered dynamically (not hardcoded)
- [ ] Cookie consent banner appears on first visit (see Section 4m)

**Wireframe note:** The landing page wireframe contains several discrepancies with this PRD. See Section 6 for the full list.

**Wireframe reference:** `landingpage2/`

---

### 4l. Paywall Modal

**What it does:** An in-app modal that appears when a Free user attempts to access a Pro feature. Its purpose is to convert Free users to Pro subscribers.

**When it appears:** See Section 3.3 for the complete list of paywall triggers.

**Layout:**
1. **Header** — "Unlock Pro" with a close (×) button
2. **Benefit list** — 4 bullet points with checkmark icons:
   - "Unlimited trip logging"
   - "What-if planning simulator"
   - "Smart risk & breach alerts"
   - "Audit-ready PDF exports"
3. **Plan selection** — Three options presented as selectable cards:
   - **Monthly:** "£2.99/month" (default selected)
   - **Annual:** "£24.99/year" with a "Save 30%" badge
   - **Lifetime:** "£49.99 one-time" with a "Best value" badge
4. **CTA button** — "Upgrade to Pro" (primary gradient button). Clicking this opens Stripe Checkout with the selected plan pre-loaded.
5. **Dismiss link** — "Not now" text link below the CTA

**Acceptance criteria:**
- [ ] Modal appears on all paywall trigger events (Section 3.3)
- [ ] Modal can be dismissed via the × button or "Not now" link
- [ ] Default plan selection is Monthly
- [ ] Selecting a plan updates the CTA text: "Upgrade to Pro — £2.99/month" / "Upgrade to Pro — £24.99/year" / "Upgrade to Pro — £49.99"
- [ ] Clicking the CTA opens Stripe Checkout with the correct plan
- [ ] After successful Stripe Checkout, user is redirected back to the app and the modal does not reappear
- [ ] Modal is accessible: keyboard-navigable, focus-trapped, screen-reader-friendly

**Wireframe note:** No wireframe exists for this modal. Build to this spec.

---

### 4m. Cookie Consent

**What it does:** GDPR-compliant cookie consent banner shown to all users on first visit.

**Cookies used by StayRight:**

| Cookie | Type | Purpose |
|---|---|---|
| **Session cookie** | Strictly necessary | Maintains the user's login session. Required for the app to function. Cannot be declined. |
| **Analytics cookie** | Performance | Tracks anonymous usage patterns via PostHog (see Section 4n). Can be declined. |

**Banner design:**
- Position: fixed to the bottom of the viewport
- Copy: "We use cookies to keep you logged in and to understand how StayRight is used. You can manage your preferences."
- Buttons: "Accept all" (primary), "Necessary only" (secondary), "Cookie settings" (text link)
- If "Necessary only" is clicked, analytics cookies are not set and PostHog is not initialised
- If "Accept all" is clicked, both session and analytics cookies are set
- Preference is stored in `localStorage` and the banner does not reappear

**Acceptance criteria:**
- [ ] Banner appears on first visit before any non-essential cookies are set
- [ ] "Necessary only" prevents analytics cookies from being set
- [ ] "Accept all" sets all cookies and initialises analytics
- [ ] Cookie preference persists across sessions
- [ ] Banner does not reappear once a choice is made
- [ ] Banner is accessible and does not obstruct critical CTAs on mobile

---

### 4n. Analytics

**What it does:** Privacy-friendly product analytics to measure the success metrics defined in Section 1.4.

**Tool:** PostHog (self-hosted or Cloud EU, for GDPR compliance). Alternative: Plausible.

**Important:** No personally identifiable information (PII) should be sent to analytics. Track user IDs, not names or emails.

**Events to track:**

| Event | When It Fires |
|---|---|
| `signup_completed` | User completes signup (email verified or OAuth) |
| `onboarding_completed` | User finishes onboarding flow |
| `onboarding_skipped` | User clicks "Skip setup" |
| `first_trip_logged` | User logs their first trip |
| `trip_logged` | Any trip is logged (with property: `trip_number`) |
| `what_if_used` | User opens the what-if simulator |
| `paywall_shown` | Paywall modal appears (with property: `trigger_reason`) |
| `upgrade_started` | User clicks "Upgrade to Pro" in paywall modal |
| `upgrade_completed` | Stripe Checkout succeeds (with property: `plan_type`) |
| `pdf_generated` | User generates a PDF report (with property: `report_type`) |
| `account_deleted` | User deletes their account |

**Acceptance criteria:**
- [ ] PostHog (or Plausible) is integrated and only initialised if the user accepts analytics cookies
- [ ] No PII (name, email, IP) is sent to analytics
- [ ] All events listed above fire correctly
- [ ] A basic dashboard exists in PostHog showing signup funnel, paywall conversion rate, and PDF generation count

---

### 4o. Security

**Rate limiting:**

| Endpoint | Limit |
|---|---|
| Auth endpoints (login, signup, password reset) | 5 attempts per 15 minutes per IP |
| Calculation API (what-if simulator) | 60 requests per minute per user |
| PDF generation | 10 requests per hour per user |
| All other API endpoints | 100 requests per minute per user |

**Input sanitisation:** All user input must be sanitised before storage. Use parameterised queries (Supabase handles this). Sanitise free-text fields (destination, notes) against XSS.

**Row Level Security (RLS):** Supabase Row Level Security must be enabled on all tables. Users can only read and write their own data. No user can access another user's trips, profile, or reports.

**Acceptance criteria:**
- [ ] Rate limits are enforced on all specified endpoints
- [ ] Rate limit exceeded returns HTTP 429 with a friendly message
- [ ] RLS is enabled on all Supabase tables
- [ ] All user input is sanitised
- [ ] No user can access another user's data

---

## 5. Copy — Single Source of Truth

> All UI text must match this section. Where the wireframes differ, this section wins.

### 5.1 Navigation

| Item | Label |
|---|---|
| Nav item 1 | Dashboard |
| Nav item 2 | Trips |
| Nav item 3 | Reports |
| Nav item 4 | Settings |

There is **no Calendar** nav item in v1.

### 5.2 Dashboard

| Element | Copy |
|---|---|
| **Greeting** | "Good morning/afternoon/evening, {firstName}" |
| **Subtitle** | "Skilled Worker → ILR" |
| **Quota ring centre** | "{daysUsed}" (large number) |
| **Quota ring sublabel** | "/ 180 days" |
| **Days remaining** | "{daysRemaining} days remaining" |
| **Risk badge — SAFE** | "SAFE" |
| **Risk badge — WARNING** | "WARNING" |
| **Risk badge — DANGER** | "DANGER" |
| **Risk badge — BREACH** | "BREACH" |
| **Compliance disclaimer** | "Calculations follow official Home Office guidance. Always verify with an immigration adviser if you are approaching the limit." |
| **Qualifying period title** | "Qualifying Year Progress" |
| **Qualifying period subtitle** | "Period monitoring since {visaStartDate}" |
| **Qualifying period left label** | "Started {visaStartDate}" |
| **Qualifying period right label** | "ILR eligible: {ILRDate}" |
| **Plan a trip CTA** | "Plan a Trip →" |
| **Plan a trip helper** | "See the impact before you book" |
| **Log past trip CTA** | "Log a Past Trip" |
| **Log past trip helper** | "Add trips you've already taken" |
| **Section header** | "PLAN YOUR NEXT TRIP" |
| **Recent history title** | "Recent History" |
| **View all link** | "View All Activity" |
| **Amber alert title** | "Plan ahead" |
| **Amber alert body** | "Your next trip could push your rolling window to {projected} days. You have {remaining} days of safe travel remaining." |
| **ILR Mode toggle (disabled)** | Tooltip on click: "Coming soon" |

### 5.3 What-If Simulator

| Element | Copy |
|---|---|
| **Modal title** | "Log New Trip" |
| **Step 1 label** | "Destination" |
| **Step 2 label** | "Dates" |
| **Step 3 label** | "Confirm" |
| **Departure date label** | "DEPARTURE DATE" |
| **Return date label** | "RETURN DATE" |
| **Today toggle** | "I'm leaving today" |
| **Return later link** | "I'll log my return later" |
| **Trip duration** | "This trip: {days} days" |
| **Days remaining** | "{remaining} days remaining" |
| **Safety badge — safe** | "✓ SAFE TO TRAVEL" |
| **Safety badge — warning** | "⚠ PLAN CAREFULLY" |
| **Safety badge — danger** | "✕ THIS TRIP RISKS YOUR ILR" |
| **Rolling window bar label** | "Rolling window after trip: {used} / 180 days" |

### 5.4 Pricing (Landing Page & Paywall)

| Element | Copy |
|---|---|
| **Section headline** | "Simple, transparent pricing." |
| **Section subheadline** | "Choose the plan that fits your visa journey." |
| **Free tier name** | "Free" |
| **Free tier price** | "£0" |
| **Free tier price suffix** | "/forever" |
| **Free tier feature 1** | "Up to 10 trips logged" |
| **Free tier feature 2** | "Basic rolling window tracker" |
| **Free tier blocked feature** | "Risk alerts" (shown greyed out with block icon) |
| **Free tier CTA** | "Get Started" |
| **Pro tier name** | "Pro" |
| **Pro tier badge** | "Most Popular" |
| **Pro tier price** | "£2.99" |
| **Pro tier price suffix** | "/month" |
| **Pro tier feature 1** | "Unlimited trip logging" |
| **Pro tier feature 2** | "What-if planning simulator" |
| **Pro tier feature 3** | "Smart risk & breach alerts" |
| **Pro tier feature 4** | "Audit-ready PDF exports" |
| **Pro tier CTA** | "Upgrade to Pro" |
| **Annual option** | "£24.99/year (save 30%)" |
| **Lifetime option** | "£49.99 one-time (best value)" |

### 5.5 Trust Signals

**Use these:**
- "Built by a Skilled Worker visa holder"
- "GDPR compliant · Data stored in the UK"

**Do NOT use:**
- ~~"Trusted by 10,000+ UK Visa Holders"~~
- ~~Any fabricated brand logos (LHR.TRIP, GLOBAL MOVE, etc.)~~
- ~~Any user counts until they are real~~

### 5.6 CTA Buttons (Global)

| Context | CTA Text |
|---|---|
| Landing page hero — primary | "Start Free Tracker" |
| Landing page hero — secondary | "See how it works →" |
| Dashboard — primary | "Plan a Trip →" |
| Dashboard — secondary | "Log a Past Trip" |
| Paywall modal — default | "Upgrade to Pro — £2.99/month" |
| Paywall modal — annual selected | "Upgrade to Pro — £24.99/year" |
| Paywall modal — lifetime selected | "Upgrade to Pro — £49.99" |
| Report generation | "Generate Report" |
| Report download | "Download PDF" |
| Settings — save | "Save changes" |
| Onboarding — continue | "Let's go" |
| Onboarding — skip | "Skip setup" |

### 5.7 Empty States

| Screen | Empty State Copy |
|---|---|
| **Dashboard (no trips)** | "No trips logged yet. Plan your first trip or add your travel history to get started." |
| **Trip list (no trips)** | "Your trip history is empty. Add a trip to start tracking your absences." |
| **Reports (no trips)** | "No absence data to report yet. Log your trips first, then come back to generate your ILR absence table." |
| **Reports (no exports)** | "No reports generated yet." |

### 5.8 Error Messages

| Context | Error Message |
|---|---|
| **Invalid email** | "Please enter a valid email address." |
| **Password too short** | "Password must be at least 8 characters." |
| **Departure after return** | "Departure date must be before the return date." |
| **Visa start date in future** | "Visa start date must be in the past." |
| **Email already registered** | "An account with this email already exists. Try logging in instead." |
| **Reset link expired** | "This link has expired. Request a new password reset." |
| **Payment failed** | "Your payment failed. Please update your payment method to keep Pro features." |
| **Rate limit exceeded** | "Too many attempts. Please try again in 15 minutes." |
| **Generic error** | "Something went wrong. Please try again." |

### 5.9 Email Subject Lines

| Email | Subject |
|---|---|
| **Welcome** | "Welcome to StayRight — let's set up your profile" |
| **Email verification** | "Verify your email to get started with StayRight" |
| **Password reset** | "Reset your StayRight password" |
| **120-day threshold** | "Heads up — you've used 120 of 180 absence days" |
| **150-day threshold** | "⚠️ Warning — 150 of 180 absence days used" |
| **Monthly summary** | "Your {month} absence summary — {daysUsed}/180 days used" |
| **ILR reminder** | "Your ILR application window opens in 90 days" |
| **Log return reminder** | "Welcome back — don't forget to log your return" |

### 5.10 Cookie Consent

| Element | Copy |
|---|---|
| **Banner text** | "We use cookies to keep you logged in and to understand how StayRight is used. You can manage your preferences." |
| **Accept button** | "Accept all" |
| **Decline button** | "Necessary only" |
| **Settings link** | "Cookie settings" |

---

## 6. Wireframe Discrepancies

> When the wireframe and this PRD conflict, **this PRD wins**.

| Screen | Wireframe Shows | Build Instead | Why |
|---|---|---|---|
| **Landing page — Features** | "Real-time Passport Sync — Connect your calendar or flight confirmations for zero-effort absence logging." | **"Retroactive Trip Logging — Add your full travel history in minutes with quick-entry mode."** | Passport sync does not exist. This feature describes manual bulk entry which is what we're building. |
| **Landing page — Features** | "Historical Backlog — Import data from Google Maps, travel apps, or flight emails to rebuild your history in minutes." | **"Bulk Trip Import — Quickly log multiple past trips during onboarding setup."** | Google Maps / email import is not in v1. Manual bulk entry is the v1 feature. |
| **Landing page — Pro features** | "Calendar & Email sync" | **"Audit-ready PDF exports"** | Calendar/email sync is out of scope for v1. PDF exports are the actual Pro feature. |
| **Landing page — Pricing** | "£4.99 /month" | **"£2.99 /month"** | Pricing was finalised at £2.99/month per Section 3. |
| **Landing page — Pro CTA** | "Start 14-Day Trial" | **"Upgrade to Pro"** | No free trial in v1 (see Section 2.2). The free tier is the try-before-you-buy experience. |
| **Landing page — Trust bar** | "Trusted by 10,000+ UK Visa Holders" + fake brand logos | **"Built by a Skilled Worker visa holder" + "GDPR compliant · Data stored in the UK"** | Fabricated social proof damages credibility. Use authentic trust signals. |
| **Landing page — Badge** | "Updated for 2024 Rules" | **"Updated for 2026 Rules"** | Outdated year reference. |
| **Landing page — Hero copy** | "for professionals and families" | **"for Skilled Worker visa holders"** | Family plan is cut from v1. Target the specific audience. |
| **Landing page — Nav** | "Timeline, Absences, Visa Rules, Insights" | **"Features, Pricing" (anchor links) + "Start Free Tracker" CTA** | Nav should reflect actual landing page sections. No separate Visa Rules page in v1. |
| **Landing page — Nav CTA** | "Add Absence" | **"Start Free Tracker"** | Landing page CTA should drive signup, not in-app actions. |
| **Sidebar nav (v1)** | Dashboard, Trips, Calendar, Reports, Settings | **Dashboard, Trips, Reports, Settings** | Calendar view cut from v1. |
| **Reports (v1)** | Includes "Citizenship Absence Report" | **Remove. Only show: ILR Absence Table, Rolling Window History, Custom Date Range.** | Citizenship mode cut from v1. |
| **Settings (v1)** | "Our concierge team is available 24/7" + "Chat Now" | **Email (help@stayright.co.uk) + "Visit Help Centre" link** | Chat support cut from v1. v3 wireframe is correct. |
| **Onboarding** | Welcome → Visa Setup → Walkthrough → Empty Dashboard | **Welcome → Visa Setup → Bulk Trip Entry → Populated Dashboard** | Walkthrough step replaced with bulk trip import. Users need data entered, not a feature tour. |
| **No wireframe exists** | — | **Paywall modal (Section 4l)** | Build to the spec in Section 4l. |
| **No wireframe exists** | — | **Cookie consent banner (Section 4m)** | Build to the spec in Section 4m. |

---

## 7. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend + API** | Next.js (App Router) | TypeScript, strict mode throughout |
| **Styling** | Tailwind CSS | Utility-first CSS framework for all styling |
| **Database + Auth** | Supabase (Postgres) | Row Level Security enabled on all tables. Supabase Auth for email/password + Google OAuth. |
| **Hosting** | Vercel | Connected to GitHub for auto-deploys on push to `main` |
| **Version Control** | GitHub | Repository: `bandicoutts/stayright` |
| **Payments** | Stripe | Checkout + Customer Portal. Integration added during build. |
| **Email** | Resend | Transactional + marketing emails. Integration added during build. |
| **Analytics** | PostHog (Cloud EU) | Privacy-friendly, GDPR-compliant. See Section 4n. |
| **Domain** | stayright.app | Email sending domain: stayright.app |

---

## 8. Open Questions

### Active

| # | Question | Status |
|---|---|---|
| 11 | first_name collection in onboarding | **Open.** DECISION-033 specifies that first_name is collected at the onboarding visa setup step, but `VisaForm.tsx` does not currently include a first_name input. The DB column exists and is NOT NULL, but is only populated via Settings after onboarding. Until this is built, users who sign up via email (not OAuth) will have an empty first_name until they visit Settings. **Flag before next build session.** |

<details>
<summary>Resolved questions (10)</summary>

All previously open questions are now resolved. No outstanding questions block the v1 build.

| # | Question | Resolution |
|---|---|---|
| ~~1~~ | ~~Multi-leg trip planning~~ | **Resolved.** Multi-leg trips are stored as a single trip record using the first UK departure date and final UK return date. Intermediate destinations are not tracked by the engine. Users may note them in the notes field. See Section 4c and 4f. |
| ~~2~~ | ~~Monthly summary email format~~ | **Resolved.** HTML email via Resend with plain text fallback. 7-section format defined in Section 4i. |
| ~~3~~ | ~~British Overseas Territories~~ | **Resolved.** All time outside the UK counts as absence, including BOTs (Gibraltar, Bermuda, etc.). Exception: Crown Dependencies (Jersey, Guernsey, Isle of Man) count as UK presence following the 2025 rule update — engine returns 0 absence days for these destinations. See Section 4c. |
| ~~4~~ | ~~Tech stack~~ | **Resolved.** Next.js + Supabase + Vercel + Stripe + Resend. See Section 7. |
| ~~5~~ | ~~Email delivery~~ | **Resolved.** Resend for all transactional and marketing emails. |
| ~~6~~ | ~~14-day trial~~ | **Resolved.** No trial. Free tier serves as try-before-you-buy. See Section 2.2. |
| ~~7~~ | ~~Domain~~ | **Resolved.** stayright.app |
| ~~8~~ | ~~Departure day counting~~ | **Resolved.** Follows official Home Office guidance — departure and return days count as presence. Formula: `absence_days = (return_date - departure_date) - 1`. See Section 4c. |
| ~~9~~ | ~~Export my data format~~ | **Resolved.** Immediate JSON download. See Section 4h. |
| ~~10~~ | ~~Copyright year~~ | **Resolved.** Dynamic, not hardcoded. |

</details>

---

## 9. Revision History

| Date | Version | Author | What Changed |
|---|---|---|---|
| 2026-03-21 | v1.0 | PM | Initial PRD |
| 2026-03-21 | v1.1 | PM | Removed 14-day trial (free tier is try-before-you-buy). Added lifetime plan (£49.99) to Section 3. Added Sections 4l (Paywall Modal), 4m (Cookie Consent), 4n (Analytics), 4o (Security). Added PWA, WCAG 2.1 AA, and browser support to scope. Added data retention policy and help centre spec to Settings. Added compliance disclaimer to dashboard. Added tech stack (Section 7). Resolved all open questions except 3 deferred. Changed landing page nav from "Visa Rules" to anchor links. Updated Pro CTA from "Start 14-Day Trial" to "Upgrade to Pro". Added webhook idempotency and rate limiting specs. Added ILR Mode toggle "Coming soon" behaviour. |
| 2026-03-21 | v1.2 | PM | Added Tailwind CSS to tech stack. |
| 2026-03-21 | v1.3 | PM | Resolved all remaining open questions. Added Crown Dependencies exception to Section 4c (Jersey, Guernsey, Isle of Man = 0 absence days). Added multi-leg trip model to Sections 4c, 4e, 4f. Added Crown Dependencies note to Section 4f trip detail. Replaced monthly summary email stub in Section 4i with full 7-section HTML email spec including plain text fallback requirement. Marked open questions 1, 2, 3 as resolved in Section 8. |
