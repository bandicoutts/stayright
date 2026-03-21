# StayRight — Wireframes Reference

## How to use these wireframes

These wireframes were created in Google Stitch and represent the intended visual design of StayRight v1. They are a reference, not a specification.

**Important rules:**
- PRD.md overrides wireframes on scope and feature decisions
- DESIGN.md overrides wireframes on colour, typography, and component rules
- Some wireframe screens contain copy, features, and pricing that have been superseded — see Section 6 of PRD.md for the full discrepancy list
- If a wireframe shows a feature marked as out of scope in the PRD, do not build it

**When in doubt: PRD > DESIGN.md > Wireframes**

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

| File | Description |
|------|-------------|
| screen.png | Full landing page — hero, features, pricing, trust bar, footer |
| code.html | Stitch HTML reference |

Note: The landing page wireframe contains several discrepancies with the PRD. See PRD.md Section 6 for the full list before building.

---

## Authenticated App Screens
Location: /docs/wireframes/web2/

Each subfolder below contains a screen.png and code.html.

### Authentication
| Folder | Screen |
|--------|--------|
| v3_password_reset_1_request/ | Password reset — enter email |
| v3_password_reset_2_check_email/ | Password reset — check inbox |
| v3_password_reset_3_new_password/ | Password reset — set new password |

### Onboarding
| Folder | Screen |
|--------|--------|
| v3_onboarding_1_welcome/ | Onboarding step 1 — welcome |
| v3_onboarding_2_visa_setup/ | Onboarding step 2 — visa route and start date |

### Dashboard
| Folder | Screen |
|--------|--------|
| v3_dashboard_overview/ | Main dashboard — default state with trips |
| v3_currently_abroad_dashboard/ | Dashboard — currently abroad state |

### Trips
| Folder | Screen |
|--------|--------|
| v3_trip_history/ | Trip history list |
| v3_trip_detail_web/ | Trip detail side panel |
| v3_log_new_trip_modal/ | Plan a Trip — Step 2 (dates + what-if calculation) |

### Reports
| Folder | Screen |
|--------|--------|
| v3_reports_exports/ | Reports and exports screen |

### Settings
| Folder | Screen |
|--------|--------|
| v3_settings/ | Settings screen |

---

## Out of Scope for V1

The following folders exist in /docs/wireframes/web2/ but are out of scope for v1. Do not build these.

| Folder | Why out of scope |
|--------|-----------------|
| v3_calendar/ | Calendar view cut from v1 — see PRD Section 2.2 |
| v3_calendar_web/ | Calendar view cut from v1 — see PRD Section 2.2 |
| v3_trip_detail/ | Use v3_trip_detail_web/ instead — web version |

---

## Missing Screens

See /docs/wireframes/MISSING_SCREENS.md for screens specified in the PRD that do not have Stitch exports. These must be built to the PRD spec without a wireframe reference.

---

## Revision History

| Date | Version | What changed |
|------|---------|--------------|
| 2026-03-21 | 1.0 | Initial wireframes index |
| 2026-03-21 | 1.1 | Updated folder references to reflect actual structure — landingpage2/ and web2/ |
