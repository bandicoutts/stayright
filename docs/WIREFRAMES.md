# StayRight — Wireframes Reference

## How to use these wireframes

These wireframes were created in Google Stitch and represent the intended visual design of StayRight v1. They are a reference, not a specification.

**Important rules:**
- PRD.md overrides wireframes on scope and feature decisions
- DESIGN.md overrides wireframes on colour, typography, and component rules
- Some wireframe screens contain copy, features, and pricing that have been superseded — see the Known Discrepancies section in PRD.md
- If a wireframe shows a feature marked as out of scope in the PRD, do not build it

**When in doubt: PRD > DESIGN.md > Wireframes**

---

## Screen Index

### Landing Page
Location: /docs/wireframes/landing/

- hero-nav.png — Hero section and navigation bar
- features.png — 6-feature grid section _(note: Citizenship mode card replaced — see PRD discrepancies)_
- pricing.png — Free + Pro pricing cards _(note: Family tier removed — see PRD)_
- trust-footer.png — Trust bar and footer

### Authentication
Location: /docs/wireframes/auth/

- signup-login.png — Tabbed auth screen (Google OAuth + email)
- email-verification.png — Post-signup verification holding screen
- password-reset-request.png — Forgot password entry screen
- password-reset-check-email.png — Check your inbox screen
- password-reset-new-password.png — Set new password screen

### Onboarding
Location: /docs/wireframes/onboarding/

- onboarding-welcome.png — Welcome screen
- onboarding-visa-setup.png — Visa route and start date entry
- onboarding-walkthrough.png — Feature introduction (3 features)
- onboarding-import-trips.png — Bulk past trip entry step _(note: this step is in the PRD spec — if the Stitch export does not include it, build to the PRD spec)_
- onboarding-empty-dashboard.png — First dashboard view, empty state

### Dashboard
Location: /docs/wireframes/dashboard/

- dashboard-default.png — Main dashboard, logged trips present
- dashboard-empty.png — Dashboard, new user, no trips logged
- dashboard-abroad.png — Dashboard, user currently has an active trip

### Trips
Location: /docs/wireframes/trips/

- trip-history.png — Full trip list with search and filters
- trip-detail.png — Side panel showing individual trip detail
- plan-trip-step1.png — Log/Plan flow, Step 1: Destination
- plan-trip-step2.png — Log/Plan flow, Step 2: Dates + what-if calculation panel _(this is the most important screen in the product)_
- plan-trip-step3.png — Log/Plan flow, Step 3: Confirmation

### Reports
Location: /docs/wireframes/reports/

- reports.png — Reports and exports screen _(note: Citizenship Absence Report card removed — see PRD)_

### Settings
Location: /docs/wireframes/settings/

- settings.png — Full settings screen _(note: concierge chat card removed — see PRD)_ _(note: correct price is £2.99/month)_

---

## Screens Out of Scope for V1

The following screens exist in Stitch but are not being built in v1. Do not reference them during development.

- All mobile screens (v1 through v5)
- Calendar screen (web)
- Any screen referencing Citizenship mode
- Family plan screens or pricing

---

## Adding wireframe images

Images should be exported from Stitch as PNG files and placed in the relevant subfolder above. Name each file exactly as shown in the index above so links resolve correctly.

To add images:
1. Export PNGs from Stitch
2. Name them to match the filenames above
3. Upload to the relevant /docs/wireframes/ subfolder
4. GitHub will render them inline when viewing this file

---

## Revision History

| Date | Version | What changed |
|------|---------|--------------|
| 2026-03-21 | 1.0 | Initial wireframes index created |
