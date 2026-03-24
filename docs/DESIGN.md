# StayRight — Design System

This design system is split into two files reflecting the two distinct surfaces of the product.

## Landing Page
See /docs/design/landing.DESIGN.md

Covers: navigation, hero, features section, pricing cards, trust bar, footer, and colour tokens for the marketing surface.

## Authenticated App (Dashboard)
See /docs/design/dashboard.DESIGN.md

Covers: sidebar, dashboard components, Quota Ring, trip cards, modal patterns, reports, settings, and all authenticated app surfaces.

---

- **Design Source of Truth:** `src/styles/tokens.css` is the authoritative source for all colors, spacing, and shadows.
- **Primary Accent:** Green (`var(--color-green)`) — `#006948` (Light) / `#00855D` (Dark).
- **Surfaces:** Dark Luxury palette (OLED-black / Obsidian tinted greens).
- **Text:** High-contrast semantic mapping (`var(--color-text-primary)`).
- **Corner Radius:** 0.75rem / 12px throughout for a premium, rounded aesthetic.
- **Borders:** Tonal lifts only via `var(--color-border)`. No harsh 1px solid black borders.
- **Typography:** Manrope for headlines, Inter for body text.
- **Compliance Indicators:**
  - Amber: `#D97706` — warning state (120–159 days).
  - Red: `#BA1A1A` — danger state (160+ days).
  - Green: `#006948` — safe state (under 120 days).

---

## Precedence Order

When there is a conflict between documents, this order applies:

1. PRD.md — overrides everything on scope and feature decisions
2. tokens.css — authoritative source for all visual tokens and theme variables
3. dashboard.DESIGN.md — component UX rules for the authenticated app
4. landing.DESIGN.md — component UX rules for the marketing pages
5. Wireframes — visual reference only, overridden by all of the above

---

## Revision History

| Date | Version | What changed |
|------|---------|--------------|
| 2026-03-21 | 1.0 | Initial design system created |
| 2026-03-24 | 1.1 | Visual migration to Dark Luxury; semantic token implementation |
