# StayRight v1 — Product Requirements Document

> **Status:** Final Draft
> **Last updated:** 2026-03-21
> **Author:** David Flynn-Coutts
> **Document authority:** When there is a conflict between this document and the Stitch wireframes, this document wins.

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
| **Authentication** | Google OAuth + email/password signup, email verification, password reset |
| **Onboarding** | Visa route selection, visa start date entry, bulk past trip entry |
| **Dashboard** | Quota ring (days used / 180), qualifying period progress bar, "Plan a Trip" CTA, recent trip history, ILR eligibility timeline, amber alert card |
| **What-if simulator** | Enter departure + return dates → live rolling window impact calculation → Safe / Warning / Danger verdict → option to save as trip |
| **Trip log** | Add, edit, delete trips. Retroactive entry. Trip detail view. |
| **Reports** | ILR Absence Table (PDF, Pro only), Rolling Window History (PDF, Pro only), Custom Date Range (PDF, Pro only) |
| **Settings** | Visa profile, notification preferences, account management (email, password, delete) |
| **Notifications** | Email-based threshold warnings (120 days, 150 days), monthly compliance summary email, ILR reminder 90 days before eligibility |
| **Payments** | Stripe integration. Free + Pro tiers. Monthly (£2.99) and annual (£24.99) billing. |
| **Landing page** | Marketing site with hero, features, pricing, footer |

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
| **Any feature not explicitly listed in section 2.1** | If it's not listed above, it's not in v1. |

---

## 3. Pricing

> **This section is the single source of truth for pricing. All screens, copy, emails, and the landing page must match these numbers exactly.**

### 3.1 Free Tier

| Attribute | Value |
|---|---|
| **Price** | £0 forever |
| **Trips** | Up to 3 trips logged |
| **Rolling window status** | Visible (quota ring, days used) |
| **What-if simulator** | Available for the first 3 trips only; paywall after 3 saved trips |
| **PDF export** | Not available |
| **Email alerts** | Not available |
| **Platform** | Web (responsive) |

### 3.2 Pro Tier

| Attribute | Value |
|---|---|
| **Monthly price** | £2.99/month |
| **Annual price** | £24.99/year (save 30%) |
| **Lifetime price** | £49.99 one-time |
| **Trips** | Unlimited |
| **What-if simulator** | Unlimited |
| **PDF exports** | ILR Absence Table, Rolling Window History, Custom Date Range |
| **Email alerts** | Threshold warnings (120 days, 150 days) + monthly compliance summary |
| **Platform** | Web (responsive, mobile-optimised) |

### 3.3 Paywall Triggers

The paywall appears when a Free user:
1. Attempts to log a 4th trip
2. Attempts to run a what-if simulation when they already have 3 saved trips
3. Attempts to generate a PDF export
4. Attempts to configure email alert thresholds

The paywall is a modal that shows the Pro plan benefits, price, and a CTA to upgrade via Stripe Checkout.

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
2. **Visa setup** — Select visa route (Skilled Worker pre-selected), enter visa start date, confirm qualifying period (auto-calculated as 5 years from start date)
3. **Bulk past trip entry** — "Add your travel history" — a streamlined form to quickly add multiple past trips (destination + departure date + return date). Show a running count: "3 trips added". Allow "Add another" or "Done".
4. **Dashboard** — Arrive at a populated dashboard showing the quota ring based on entered trips

**Acceptance criteria:**
- [ ] Onboarding starts automatically after first login / email verification
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
- A "day of absence" is a full day spent outside the UK
- **The day of departure from the UK is NOT counted** as a day of absence (the user is still in the UK that morning)
- **The day of return to the UK is NOT counted** as a day of absence (the user is back in the UK that day)
- Only full days between departure and return are counted
- **Formula:** `absence_days = (return_date - departure_date) - 1`
- Example: Depart 1 March, return 8 March → 6 days of absence (2, 3, 4, 5, 6, 7 March)
- Example: Depart 1 March, return 2 March → 0 days of absence (day trip)

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

**Edge cases:**
- Trip spans the boundary of two 12-month windows → the days within each window are counted separately toward that window's total
- User has no trips logged → rolling window = 0, status = SAFE
- User changes their visa start date after logging trips → all calculations must recalculate
- Leap years → use actual calendar dates, not a fixed 365-day assumption
- Trips that overlap with each other → count each calendar day only once (de-duplicate overlapping ranges)

---

### 4d. Dashboard

**What it does:** The home screen after login. Shows the user's compliance status at a glance and provides quick access to trip planning.

**Components:**
1. **Quota ring** — Circular progress indicator showing days used / 180 in the current rolling window. Large central number. Risk status badge (SAFE/WARNING/DANGER/BREACH).
2. **Qualifying period progress** — Linear progress bar showing how far through the 5-year qualifying period the user is. Shows start date, ILR eligibility date, and percentage.
3. **"Plan a Trip" CTA** — Primary action button. Opens the what-if simulator. Helper text: "See the impact before you book".
4. **"Log a Past Trip" CTA** — Secondary action. Opens the trip entry form in retroactive mode. Helper text: "Add trips you've already taken".
5. **Recent trip history** — Last 2–3 trips with destination, dates, duration, and risk status chip.
6. **ILR eligibility timeline** — Vertical timeline showing target eligibility date and application window.
7. **Amber alert card** — Contextual warning when the user is approaching thresholds. Only shown when relevant.

**Acceptance criteria:**
- [ ] Quota ring displays the correct days count and risk status
- [ ] Quota ring animates on load (stroke-dashoffset transition)
- [ ] Qualifying period progress bar shows correct percentage and dates
- [ ] "Plan a Trip" button opens the what-if simulator modal
- [ ] "Log a Past Trip" button opens the trip entry form with dates defaulting to empty (not today)
- [ ] Recent history shows the most recent 3 trips, sorted by departure date descending
- [ ] Each trip card shows country flag emoji, destination name, date range, duration, and risk chip
- [ ] Amber alert card appears when rolling window is between 121–150 days
- [ ] Red alert card appears when rolling window exceeds 150 days
- [ ] No alert card when status is SAFE

**Wireframe reference:** `web2/v3_dashboard_overview`

---

### 4e. What-If Simulator / Plan a Trip

**What it does:** The most important screen in the product. Allows the user to enter hypothetical trip dates and instantly see the impact on their rolling window — answering "Can I book this trip safely?"

**Flow:**
1. User clicks "Plan a Trip →" on the dashboard
2. Modal opens with a 3-step flow: Destination → Dates → Confirm
3. **Step 1 (Destination):** Free text destination field
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
- [ ] Free users who already have 3 trips see the paywall when trying to use the simulator

**Edge cases:**
- Return date is before departure date → show validation error
- Trip dates overlap with an existing trip → show warning but allow (user may be entering a multi-leg trip)
- User enters dates far in the future (e.g. 2 years) → the rolling window calculation should project forward correctly
- User enters a trip that starts in the past and ends in the future → treat as a valid trip

**Wireframe reference:** `web2/v3_log_new_trip_modal`

---

### 4f. Trip Log

**What it does:** A complete list of all logged trips with the ability to add, edit, and delete entries.

**Display:**
- List view, sorted by departure date descending (most recent first)
- Each entry shows: destination, departure date, return date, duration (X days), risk chip
- Trips with no return date show "Currently abroad" status
- Trip detail: clicking a trip opens a detail view showing all trip data + its contribution to the rolling window at the time

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
- [ ] Free users see a paywall when attempting to add a 4th trip

**Edge cases:**
- Deleting a trip that was causing a breach → status should recalculate to SAFE/WARNING as appropriate
- Editing a trip's dates to overlap with another trip → show warning but allow
- Trip list is empty → show empty state (see Copy section)

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
- [ ] PDFs include the StayRight logo, user name, visa route, and qualifying period dates in a header
- [ ] ILR Absence Table lists all trips in chronological order with all required columns
- [ ] ILR Absence Table shows a summary row at the bottom: "Total absence days: X"
- [ ] Rolling Window History calculates the window count at the 1st of each month
- [ ] Custom Date Range validates that start date is before end date
- [ ] All reports are gated behind the Pro paywall — Free users see the report list but get a paywall modal when they click "Generate" or "Download"
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

1. **Visa Profile** — displays and allows editing of: name, visa route, visa start date, qualifying period, ILR target date (auto-calculated). ILR Mode toggle (always on in v1 — visible but non-functional since citizenship mode is out of scope).
2. **Notifications** — toggle on/off for each alert type: warn at 120 days, warn at 150 days, log return reminder, ILR reminder 90 days before, renewal reminder.
3. **Account** — email address (editable), password change, delete account.
4. **Subscription** — displays current plan (Free or Pro), price, renewal date, and "Manage subscription" button (links to Stripe Customer Portal).
5. **Data & Privacy** — GDPR badges, "Export my data" button (JSON download of all user data), privacy policy link.
6. **Help & Support** — email address (help@stayright.co.uk), link to help centre.

**Acceptance criteria:**
- [ ] All visa profile fields are editable
- [ ] Changing the visa start date triggers recalculation of all rolling windows and the ILR target date
- [ ] Notification toggles persist and control email delivery
- [ ] Email address change requires re-verification
- [ ] Password change requires current password
- [ ] Delete account shows a confirmation dialog with the text "This will permanently delete your account and all travel data. This cannot be undone."
- [ ] Delete account requires typing "DELETE" to confirm
- [ ] Subscription card shows the correct plan and price from Section 3
- [ ] "Manage subscription" opens Stripe Customer Portal
- [ ] "Export my data" generates a JSON file with all user data (profile + trips)
- [ ] ILR Mode toggle is visible but does not switch to citizenship mode (future feature)

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

**Acceptance criteria:**
- [ ] Welcome email is sent to all users after email verification
- [ ] Threshold emails fire once per threshold crossing, not repeatedly
- [ ] Monthly summary includes: rolling window count, risk status, number of trips in the past month, next known trip
- [ ] All emails include an unsubscribe link and match the StayRight brand (botanical green, Manrope headers)
- [ ] Email delivery is controlled by the toggles in Settings
- [ ] Emails are not sent to Free users (except welcome email)

**Edge cases:**
- User crosses 120 days and 150 days on the same day (large trip) → send both emails
- User's rolling window drops below a threshold after being above it → do not re-trigger the alert if it rises again within the same rolling window

---

### 4j. Payments (Stripe)

**What it does:** Handle subscription management via Stripe Checkout and Customer Portal.

**Flows:**
- **Upgrade to Pro:** User hits a paywall → "Upgrade to Pro" CTA → Stripe Checkout session → redirect back to app on success → unlock Pro features immediately
- **Manage subscription:** Settings → "Manage subscription" → Stripe Customer Portal → user can change plan, update payment method, cancel
- **Cancel:** Handled via Stripe Customer Portal. On cancellation, Pro features remain active until the end of the billing period, then revert to Free.
- **Annual plan:** Offered as an option during Stripe Checkout (£24.99/year, displayed as "save 30%")
- **Lifetime plan:** Offered as a one-time Stripe Checkout payment (£49.99)

**Acceptance criteria:**
- [ ] Stripe Checkout opens with the correct price for the selected plan
- [ ] On successful payment, the user's plan updates instantly (webhook)
- [ ] On cancellation, Pro features remain until the end of the billing period
- [ ] After billing period ends, user reverts to Free tier restrictions (3 trips, no exports, no alerts)
- [ ] User's existing data (trips, settings) is preserved on downgrade — they just can't add more trips beyond 3 or generate exports
- [ ] Annual plan shows annual price and "save 30%" on Stripe Checkout
- [ ] Lifetime plan shows one-time price on Stripe Checkout and never recurs
- [ ] Stripe webhooks handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] On payment failure, show a banner in the app: "Your payment failed. Please update your payment method to keep Pro features."

**Edge cases:**
- User is on Free, has 5 trips from a cancelled Pro subscription → they can view all 5 trips but cannot add new ones until they re-subscribe or delete trips to get back to 3
- User subscribes via annual, then requests refund within 14 days → handle via Stripe Dashboard (manual)
- User upgrades mid-month → Stripe prorates (use Stripe default proration)

---

### 4k. Landing Page

**What it does:** The marketing site at the root URL. Converts visitors into signups.

**Sections:**
1. **Navigation** — Logo, links (Features, Pricing, Visa Rules), "Start Free Tracker" CTA
2. **Hero** — Headline, sub-copy, primary CTA ("Start Free Tracker"), secondary CTA ("See how it works"), device mockup showing the quota ring
3. **Features bento grid** — 6 feature cards (see Copy section for correct titles and descriptions)
4. **Pricing** — Free vs Pro comparison (must match Section 3 exactly)
5. **Trust bar** — "Built by a Skilled Worker visa holder" + "GDPR compliant · Data stored in the UK"
6. **Footer** — Logo, tagline, links (Privacy Policy, Terms of Service, Help Center, Contact), copyright

**Acceptance criteria:**
- [ ] All pricing matches Section 3 exactly (£2.99/month, £24.99/year)
- [ ] Hero CTA "Start Free Tracker" links to signup
- [ ] No fabricated trust signals (no "10,000+ users", no fake brand logos)
- [ ] Features listed match what is actually being built in v1 (no passport sync, no calendar sync)
- [ ] Page loads in under 3 seconds on 4G connection
- [ ] Page is responsive (mobile, tablet, desktop)
- [ ] Page has proper meta title and description for SEO

**Wireframe note:** The landing page wireframe contains several discrepancies with this PRD. See Section 6 for the full list.

**Wireframe reference:** `landingpage2/`

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
| **Free tier feature 1** | "Up to 3 trips logged" |
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
| **Pro tier CTA** | "Start 14-Day Trial" |
| **Annual toggle** | "£24.99/year (save 30%)" |

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
| Paywall modal | "Upgrade to Pro" |
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

---

## 6. Wireframe Discrepancies

> When the wireframe and this PRD conflict, **this PRD wins**.

| Screen | Wireframe Shows | Build Instead | Why |
|---|---|---|---|
| **Landing page — Features** | "Real-time Passport Sync — Connect your calendar or flight confirmations for zero-effort absence logging." | **"Retroactive Trip Logging — Add your full travel history in minutes with quick-entry mode."** | Passport sync does not exist. This feature describes manual bulk entry which is what we're building. |
| **Landing page — Features** | "Historical Backlog — Import data from Google Maps, travel apps, or flight emails to rebuild your history in minutes." | **"Bulk Trip Import — Quickly log multiple past trips during onboarding setup."** | Google Maps / email import is not in v1. Manual bulk entry is the v1 feature. |
| **Landing page — Pro features** | "Calendar & Email sync" | **"Audit-ready PDF exports"** | Calendar/email sync is out of scope for v1. PDF exports are the actual Pro feature. |
| **Landing page — Pricing** | "£4.99 /month" | **"£2.99 /month"** | Pricing was finalised at £2.99/month per Section 3. |
| **Landing page — Trust bar** | "Trusted by 10,000+ UK Visa Holders" + fake brand logos | **"Built by a Skilled Worker visa holder" + "GDPR compliant · Data stored in the UK"** | Fabricated social proof damages credibility. Use authentic trust signals. |
| **Landing page — Badge** | "Updated for 2024 Rules" | **"Updated for 2026 Rules"** | Outdated year reference. |
| **Landing page — Hero copy** | "for professionals and families" | **"for Skilled Worker visa holders"** | Family plan is cut from v1. Target the specific audience. |
| **Landing page — Nav** | "Timeline, Absences, Visa Rules, Insights" | **"Features, Pricing, Visa Rules"** | Nav should reflect actual landing page sections. |
| **Landing page — Nav CTA** | "Add Absence" | **"Start Free Tracker"** | Landing page CTA should drive signup, not in-app actions. |
| **Sidebar nav (v1)** | Dashboard, Trips, Calendar, Reports, Settings | **Dashboard, Trips, Reports, Settings** | Calendar view cut from v1. |
| **Reports (v1)** | Includes "Citizenship Absence Report" | **Remove. Only show: ILR Absence Table, Rolling Window History, Custom Date Range.** | Citizenship mode cut from v1. |
| **Settings (v1)** | "Our concierge team is available 24/7" + "Chat Now" | **Email (help@stayright.co.uk) + "Visit Help Centre" link** | Chat support cut from v1. v3 wireframe is correct. |
| **Onboarding** | Welcome → Visa Setup → Walkthrough → Empty Dashboard | **Welcome → Visa Setup → Bulk Trip Entry → Populated Dashboard** | Walkthrough step replaced with bulk trip import. Users need data entered, not a feature tour. |

---

## 7. Open Questions

### Must Resolve Before Build Starts

| # | Question | Context |
|---|---|---|
| 1 | **What is the tech stack?** | Frontend framework (Next.js? Vite + React?), backend (Node? Supabase? Firebase?), database, hosting. This determines project setup. |
| 2 | **How is email delivery handled?** | Transactional emails (verification, reset) and marketing emails (monthly summary, alerts). Options: Resend, SendGrid, Postmark. |
| 3 | **Is there a 14-day free trial for Pro, or is the Pro CTA immediate purchase?** | The landing page wireframe says "Start 14-Day Trial" but this needs confirmation. A trial adds complexity (trial period tracking, trial-to-paid conversion, trial expiry). |
| 4 | **What is the domain?** | stayright.co.uk? stayright.uk? stayright.app? Needed for email sending domain, auth config, and deployment. |
| 5 | **What constitutes "departure day" — do we count from the flight departure or the calendar date?** | The PRD defines departure day as excluded. Confirm this matches the Home Office guidance exactly. Different immigration lawyers interpret this differently. |

### Can Resolve During Build

| # | Question | Context |
|---|---|---|
| 6 | **Should the what-if simulator allow planning multiple trips at once?** | Current design is single-trip. "I want to plan two trips this summer" is plausible. Could add in v1.1. |
| 7 | **Should the monthly summary email include a link to view the report online, or just summary stats?** | Keeping it simple (summary stats + CTA to log in) is probably sufficient for v1. |
| 8 | **How do we handle British Overseas Territories?** | Trips to e.g. Gibraltar or the Channel Islands — are these counted as UK or abroad? Immigration law is ambiguous here. |
| 9 | **Should the "Export my data" GDPR download be immediate or emailed?** | Small dataset (profile + trips), so immediate JSON download is simplest. |
| 10 | **What's the copyright year in the footer?** | Use current year dynamically, not hardcoded. |

---

## 8. Revision History

| Date | Version | Author | What Changed |
|---|---|---|---|
| 2026-03-21 | v1.0 | PM | Initial PRD |
