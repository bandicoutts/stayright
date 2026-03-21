# StayRight — Wireframes Reference

## How to use these wireframes

These wireframes were created in Google Stitch and represent the intended visual design of StayRight v1. They are a reference, not a specification.

**Important rules:**
- PRD.md overrides wireframes on scope and feature decisions
- DESIGN.md overrides wireframes on colour, typography, and component rules
- Some wireframe screens contain copy, features, and pricing that have been superseded — see Section 6 of PRD.md for the full discrepancy list
- If a wireframe shows a feature marked as out of scope in the PRD, do not build it

**When in doubt: PRD > DESIGN.md > Wireframes**

**Status key:**
- `Built` — screen has been built and matches the PRD spec
- `Built (no wireframe)` — screen built from PRD spec only; no Stitch export exists
- `Not built` — screen not yet built
- `Out of scope` — screen exists in wireframes but is cut from v1

---

## Folder Structure

Wireframes are stored in two folders reflecting the two Stitch projects:

```
/docs/wireframes/
├── landingpage2/     ← landing page screens
├── web2/             ← all authenticated app screens
└── MISSING_SCREENS.md
```

Both folders preserve the original Stitch export structure. Each screen has its own subfolder containing screen.png (the visual) and code.html (the Stitch-generated HTML reference).

---

## Landing Page Screens
Location: /docs/wireframes/landingpage2/

| File | Description | Status |
|------|-------------|--------|
| screen.png | Full landing page — hero, features, pricing, trust bar, footer | **Built** |
| code.html | Stitch HTML reference | — |

Note: The landing page wireframe contains several discrepancies with the PRD. See PRD.md Section 6 for the full list. All discrepancies were resolved in favour of the PRD.

**Screens without a wireframe, built from PRD spec:**

| Screen | Component | Status |
|--------|-----------|--------|
| Cookie consent banner | `src/components/marketing/CookieBanner.tsx` | **Built (no wireframe)** |
| Cookie policy page | `src/app/(marketing)/cookie-policy/page.tsx` | **Built (no wireframe)** |

---

## Authenticated App Screens
Location: /docs/wireframes/web2/

Each subfolder below contains a screen.png and code.html.

### Authentication
| Folder | Screen | Status |
|--------|--------|--------|
| v3_password_reset_1_request/ | Password reset — enter email | **Built** |
| v3_password_reset_2_check_email/ | Password reset — check inbox | **Built** |
| v3_password_reset_3_new_password/ | Password reset — set new password | **Built** |

**Missing screens (no wireframe):**

| Screen | Status |
|--------|--------|
| Sign Up / Log In — tabbed screen | **Built (no wireframe)** |
| Email verification — post-signup holding screen | **Built (no wireframe)** |

### Onboarding
| Folder | Screen | Status |
|--------|--------|--------|
| v3_onboarding_1_welcome/ | Onboarding step 1 — welcome | **Built** |
| v3_onboarding_2_visa_setup/ | Onboarding step 2 — visa route and start date | **Built** |

Note: The wireframe "walkthrough" step has been cut per PRD — users need data entry, not a feature tour.

**Missing screens (no wireframe):**

| Screen | File | Status |
|--------|------|--------|
| Onboarding — Bulk Trip Import (step 3) | `src/app/(app)/onboarding/trips/` | **Built (no wireframe)** |
| Dashboard placeholder (post-onboarding) | `src/app/(app)/dashboard/page.tsx` | **Built (no wireframe)** — full dashboard is next |

### Dashboard
| Folder | Screen | Status |
|--------|--------|--------|
| v3_dashboard_overview/ | Main dashboard — default state with trips | Not built |
| v3_currently_abroad_dashboard/ | Dashboard — currently abroad state | Not built |

**Missing screens (no wireframe):**

| Screen | Status |
|--------|--------|
| Dashboard — Empty State (new user, no trips) | Not built |

### Trips
| Folder | Screen | Status |
|--------|--------|--------|
| v3_trip_history/ | Trip history list | Not built |
| v3_trip_detail_web/ | Trip detail side panel | Not built |
| v3_log_new_trip_modal/ | Plan a Trip — Step 2 (dates + what-if calculation) | Not built |

**Missing screens (no wireframe):**

| Screen | Status |
|--------|--------|
| Plan a Trip — Step 1 Destination | Not built |
| Plan a Trip — Step 3 Confirm | Not built |

### Reports
| Folder | Screen | Status |
|--------|--------|--------|
| v3_reports_exports/ | Reports and exports screen | Not built |

### Settings
| Folder | Screen | Status |
|--------|--------|--------|
| v3_settings/ | Settings screen | Not built |

### Paywall
| Screen | Status |
|--------|--------|
| Paywall modal (no wireframe) | Not built |

---

## Out of Scope for V1

The following folders exist in /docs/wireframes/web2/ but are out of scope for v1. Do not build these.

| Folder | Why out of scope | Status |
|--------|-----------------|--------|
| v3_calendar/ | Calendar view cut from v1 — see PRD Section 2.2 | Out of scope |
| v3_calendar_web/ | Calendar view cut from v1 — see PRD Section 2.2 | Out of scope |
| v3_trip_detail/ | Use v3_trip_detail_web/ instead — web version | Out of scope |

---

## Missing Screens

See /docs/wireframes/MISSING_SCREENS.md for screens specified in the PRD that do not have Stitch exports. These must be built to the PRD spec without a wireframe reference.

---

## Revision History

| Date | Version | What changed |
|------|---------|--------------|
| 2026-03-21 | 1.0 | Initial wireframes index |
| 2026-03-21 | 1.1 | Updated folder references to reflect actual structure — landingpage2/ and web2/ |
| 2026-03-21 | 1.2 | Added Status column to all screen tables. Marked landing page and cookie consent/policy as Built. All authenticated app screens marked Not built. Out-of-scope screens marked Out of scope. |
| 2026-03-21 | 1.3 | Auth screens built: login/signup, verify-email, password reset (all 3 steps), auth callback. |
| 2026-03-21 | 1.4 | Onboarding built: welcome, visa setup, bulk trip entry. Dashboard placeholder added. |
