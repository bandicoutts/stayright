# StayRight — Design System

This design system is split into two files reflecting the two distinct surfaces of the product.

## Landing Page
See /docs/design/landing.DESIGN.md

Covers: navigation, hero, features section, pricing cards, trust bar, footer, and colour tokens for the marketing surface.

## Authenticated App (Dashboard)
See /docs/design/dashboard.DESIGN.md

Covers: sidebar, dashboard components, Quota Ring, trip cards, modal patterns, reports, settings, and all authenticated app surfaces.

---

## Shared Rules

These rules apply to both surfaces. If there is any conflict between these rules and either design file, these shared rules take precedence.

- Primary green: #006948 everywhere. No exceptions.
- Primary gradient: #006948 → #00855D at 135deg
- Background: #F8F9FA
- Surface: #FFFFFF
- Surface container low: #F3F4F5
- Text primary: #191C1D (never pure #000000)
- Text secondary: #3D4A42
- Corner radius: 0.75rem throughout
- No hard borders — tonal lift only, no 1px solid borders for sectioning
- No pure black (#000000) anywhere in the UI
- Typography: Manrope for headlines, Inter for body text
- Status colours (compliance indicators only, never decorative):
  Amber: #D97706 — warning state (120–159 days)
  Red: #BA1A1A — danger state (160+ days)
  Green: #006948 — safe state (under 120 days)

---

## Precedence Order

When there is a conflict between documents, this order applies:

1. PRD.md — overrides everything on scope and feature decisions
2. Shared Rules above — overrides both design files on tokens
3. dashboard.DESIGN.md — overrides landing.DESIGN.md on component rules where both files conflict
4. landing.DESIGN.md — landing page specific rules
5. Wireframes — visual reference only, overridden by all of the above

---

## Revision History

| Date | Version | What changed |
|------|---------|--------------|
| 2026-03-21 | 1.0 | Initial design system created from two Stitch exports |
