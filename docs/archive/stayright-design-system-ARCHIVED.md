# Stayright Design System
**Obsidian Champagne — Production Design Reference**

## Trigger Conditions

Use this skill whenever you are:
- Writing or editing any file in `src/components/marketing/`
- Writing or editing `src/styles/tokens.css` or `src/app/globals.css`
- Writing or editing `src/app/(marketing)/page.tsx`
- Building any landing page component (Nav, Hero, Features, Pricing, TrustBar, Footer)

Do not apply this system to dashboard components (`src/components/dashboard/`, `src/app/(dashboard)/`).

---

## Design Direction

**Aesthetic:** Ultra-luxury dark. Obsidian base with warm champagne typography and architectural gold accents. Think private banking digital product — Cartier.com crossed with a serious fintech tool.

**The one thing someone remembers:** Warm gold glowing in darkness. The product feels premium and trustworthy by contrast, not by cheerfulness.

**Tone principles:**
- Champagne is used precisely — it earns every appearance
- Gold is architectural, not decorative. Borders at 8% opacity. Accent on hover: 18%.
- No green anywhere in the landing page (SAFE badge keeps semantic green — it is a data indicator, not a brand colour)
- Restraint outperforms decoration every time

---

## Colour Tokens

### Production palette (light mode — implement in production)

```css
/* src/styles/tokens.css */
:root {
  /* Backgrounds */
  --color-bg:               #FAF8F2;   /* warm ivory paper */
  --color-bg-tinted:        #F5F0E6;   /* slightly warmer, used for tinted sections */

  /* Surfaces */
  --color-surface:          #FFFFFF;
  --color-surface-warm:     #FFFDF7;   /* very warm white for cards */
  --color-surface-dark:     #1A1B19;   /* obsidian card (bento hero, footer) */

  /* Text */
  --color-text-primary:     #1A1B19;   /* warm obsidian — NOT pure black */
  --color-text-2:           #2C2E2A;
  --color-text-3:           #3D3F3A;
  --color-text-muted:       #6B6D66;
  --color-text-faint:       #A0A298;

  /* Gold accent */
  --color-gold:             #C9A84C;
  --color-gold-dark:        #A88730;
  --color-gold-light:       #E8C87A;
  --color-gold-pale:        #FEF3CC;   /* badge / chip background */

  /* Borders */
  --color-border:           rgba(201,168,76,0.20);
  --color-border-strong:    rgba(201,168,76,0.35);
  --color-border-ink:       rgba(26,27,25,0.10);

  /* Semantic — do not change */
  --color-safe-bg:          #9FF4CA;   /* SAFE badge — immigration semantic green */
  --color-safe-text:        #002114;

  /* Status (inherited from dashboard — do not change) */
  --color-status-amber:     #D97706;
  --color-status-red:       #BA1A1A;

  /* Radius */
  --radius-sm:              4px;
  --radius-md:              8px;
  --radius-lg:              12px;
  --radius-xl:              16px;
  --radius-full:            9999px;

  /* Shadows */
  --shadow-card:            0 1px 4px rgba(26,27,25,0.04), 0 8px 24px rgba(201,168,76,0.06);
  --shadow-card-hover:      0 4px 16px rgba(26,27,25,0.06), 0 16px 40px rgba(201,168,76,0.10);
  --shadow-ring-card:       0 2px 8px rgba(26,27,25,0.04), 0 16px 48px rgba(201,168,76,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
  --shadow-button:          0 4px 20px rgba(201,168,76,0.25);
  --shadow-button-hover:    0 8px 36px rgba(201,168,76,0.40);
}
```

### Dark mode palette (HTML reference — `design-variants/10-dark.html`)

Not implemented in production. Reference only for dark exploration artefacts.

```
--bg:              #09090A   (pure obsidian)
--surface:         #111110
--surface-raised:  #181816
--surface-overlay: #1E1E1B
--border:          rgba(232,213,160,0.08)
--gold:            #C9A84C
--gold-bright:     #E8C87A
--gold-deep:       #A88730
--champagne:       #E8D5A0
--text:            #DDD8CC
--text-muted:      #7A7568
--text-faint:      #3D3B34
```

---

## Typography

### Fonts

```
Heading font: Manrope (Google Fonts) — weights 300, 400, 500, 600, 700, 800, 900
Body font:    Inter (Google Fonts) — weights 300, 400, 500, 600
```

In Next.js, both are loaded via `next/font/google` in `src/app/layout.tsx`. Variable names: `--font-manrope`, `--font-inter`.

### Type scale

| Role | Element | Font | Size (fluid) | Weight | Tracking | Line-height |
|------|---------|------|-------------|--------|----------|-------------|
| Hero H1 | `h1` | Manrope | `clamp(3rem, 5.5vw, 5.5rem)` | 800 | -0.04em | 1.04 |
| Section H2 | `h2` | Manrope | `clamp(2rem, 3.2vw, 3.25rem)` | 800 | -0.04em | 1.06 |
| Card title | `h3` | Manrope | 1rem (16px) | 600 | -0.01em | 1.3 |
| Nav logo | — | Manrope | 1.125rem (18px) | 800 | -0.03em | — |
| Eyebrow label | — | Inter | 0.625rem (10px) | 600 | 0.16em | — |
| Body large | — | Inter | 1.0625rem (17px) | 400 | — | 1.72 |
| Body default | — | Inter | 0.875rem (14px) | 400 | — | 1.6 |
| Body small | — | Inter | 0.8125rem (13px) | 400 | — | 1.5 |
| Caption | — | Inter | 0.6875rem (11px) | 400 | — | 1.5 |
| Nav link | — | Inter | 0.875rem (14px) | 400 | 0.01em | — |
| Button | — | Inter | 0.9375rem (15px) | 600 | 0.01em | — |
| Badge | — | Manrope | 0.625rem (10px) | 700 | 0.08em | — |

### Typography rules

- All heading elements: `letter-spacing: -0.03em` minimum (hero/section heads at -0.04em)
- Numeric displays (ring count, pricing amounts): `font-variant-numeric: tabular-nums`
- Gold gradient text (hero "stand.", pricing prices when featured):
  ```css
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  ```
- Eyebrow labels always: `text-transform: uppercase; letter-spacing: 0.16em`
- Eyebrow labels in light mode get a leading gold rule:
  ```css
  .eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--color-gold); }
  ```

---

## Spacing

Use a base-4 scale. The landing page uses generous negative space.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (icon padding) |
| `--space-2` | 8px | Inline gaps |
| `--space-3` | 12px | Small component padding |
| `--space-4` | 16px | Card gap, small padding |
| `--space-5` | 20px | Button padding horizontal |
| `--space-6` | 24px | Card padding |
| `--space-7` | 28px | Ring card padding |
| `--space-8` | 32px | Section column padding |
| `--space-10` | 40px | Bento hero card padding |
| `--space-12` | 48px | Section headline margin |
| `--space-14` | 56px | Nav horizontal padding |
| `--space-section` | 90px | Section vertical padding |
| `--space-hero` | 120px | Hero top padding |

---

## Component Reference

### Nav

```css
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(250,248,242,0.90);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.nav-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 56px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-family: var(--font-manrope);
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  text-decoration: none;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-muted);
  letter-spacing: 0.01em;
  transition: color 0.15s;
}
.nav-link:hover { color: var(--color-text-primary); }

/* Primary nav CTA */
.nav-cta {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
  padding: 9px 20px;
  border-radius: 6px;
  text-decoration: none;
  box-shadow: var(--shadow-button);
  transition: box-shadow 0.18s, transform 0.18s;
}
.nav-cta:hover {
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-1px);
}
```

### Hero

Layout: asymmetric grid `1.1fr 0.9fr`, 80px gap, `max-width: 1320px`, centered.

```css
.hero {
  padding: 120px 56px 90px;
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 80px;
  align-items: center;
}

/* Eyebrow */
.hero-eyebrow {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-gold-dark);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--color-gold); }

/* H1 */
.hero-h1 {
  font-family: var(--font-manrope);
  font-size: clamp(3rem, 5.5vw, 5.5rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}
/* "stand." word in gradient italic */
.hero-h1 .accent {
  display: block;
  font-weight: 300;
  font-style: italic;
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 105%;
}

/* Subheadline */
.hero-sub {
  font-size: 1.0625rem;
  line-height: 1.72;
  color: var(--color-text-2);
  margin-bottom: 44px;
  max-width: 440px;
}

/* CTA group */
.hero-ctas {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

/* Trust tags row */
.hero-trust { display: flex; gap: 12px; flex-wrap: wrap; }
.trust-tag {
  font-size: 0.75rem;
  color: var(--color-text-faint);
  background: var(--color-surface-warm);
  border: 1px solid var(--color-border);
  padding: 5px 12px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}
```

### Buttons

```css
/* Primary — gold gradient fill */
.btn-primary {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  padding: 14px 32px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
  box-shadow: var(--shadow-button);
  transition: box-shadow 0.2s, transform 0.2s;
}
.btn-primary:hover {
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-1px);
}
.btn-primary:active { transform: scale(0.98); }

/* Ghost — underline only */
.btn-ghost {
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--color-text-muted);
  text-decoration: none;
  border-bottom: 1px solid rgba(26,27,25,0.2);
  padding-bottom: 2px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s, border-color 0.15s, gap 0.15s;
}
.btn-ghost:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
  gap: 10px;
}

/* Outline — pricing cards */
.btn-outline {
  font-weight: 600;
  font-size: 0.875rem;
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-strong);
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
  text-decoration: none;
  display: block;
}
.btn-outline:hover {
  border-color: var(--color-gold);
  background: var(--color-gold-pale);
}

/* Solid gold — Pro Annual CTA */
.btn-gold-solid {
  font-weight: 600;
  font-size: 0.875rem;
  background: var(--color-gold);
  color: var(--color-text-primary);
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  transition: filter 0.15s;
  text-decoration: none;
  display: block;
}
.btn-gold-solid:hover { filter: brightness(1.08); }

/* Dark fill — Pro card CTA (on gold gradient bg) */
.btn-dark {
  font-weight: 600;
  font-size: 0.875rem;
  background: var(--color-text-primary);
  color: var(--color-bg);
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: block;
  transition: opacity 0.15s;
}
.btn-dark:hover { opacity: 0.88; }
```

### Quota Ring Card

```css
/* Container — right column of hero */
.ring-wrap {
  display: flex;
  justify-content: center;
  position: relative;
}
/* Ambient glow behind card */
.ring-wrap::before {
  content: '';
  position: absolute;
  width: 340px; height: 340px;
  background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(40px);
  border-radius: 50%;
  pointer-events: none;
}

.ring-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 360px;
  box-shadow: var(--shadow-ring-card);
  overflow: hidden;
  position: relative;
  z-index: 1;
}
/* Top gold hairline */
.ring-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
}

.ring-card-header {
  padding: 16px 22px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(201,168,76,0.04);
}

.ring-card-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

/* SAFE badge — semantic green, never change these colours */
.safe-badge {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-safe-text);        /* #002114 */
  background: var(--color-safe-bg);     /* #9FF4CA */
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(201,168,76,0.3);
}

.ring-body {
  padding: 32px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* SVG ring constants — do not change */
/*
  size:          212 × 212
  center:        cx=106, cy=106
  radius:        90
  strokeWidth:   16
  circumference: 565.49  (2π × 90)
  dashOffset:    433.42  (42/180 days = 23.3% filled → 565.49 × 0.767)
  stroke-linecap: round
  transform:     rotate(-90 106 106)
  track colour:  rgba(201,168,76,0.10) on light; rgba(232,213,160,0.06) on dark
  fill gradient: linear #C9A84C → #E8C87A (light) or #C9A84C → #E8D5A0 (dark)
*/

/* Ring center numerics */
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ring-num {
  font-family: var(--font-manrope);
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.ring-denom {
  font-size: 0.75rem;
  color: var(--color-text-faint);
  font-weight: 500;
  margin-top: 4px;
}

/* Trip rows */
.ring-trips {
  width: 100%;
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.trip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--color-bg-tinted);
  border: 1px solid var(--color-border);
  transition: border-color 0.15s;
}
.trip-row:hover { border-color: var(--color-border-strong); }
.trip-name { font-size: 0.8125rem; font-weight: 500; color: var(--color-text-primary); }
.trip-dates { font-size: 0.6875rem; color: var(--color-text-faint); margin-top: 1px; }
.trip-days-badge {
  font-family: var(--font-manrope);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-gold-dark);
  background: var(--color-gold-pale);
  padding: 4px 10px;
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}
```

### Bento Grid (Features)

```css
.features-section {
  padding: 90px 56px;
  max-width: 1320px;
  margin: 0 auto;
  border-top: 1px solid var(--color-border);
}

.section-h2 {
  font-family: var(--font-manrope);
  font-size: clamp(2rem, 3.2vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
  margin-bottom: 48px;
  line-height: 1.06;
}

/* 12-column bento grid */
.bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
}

/* Default card */
.bento-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-card);
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.bento-card:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

/* Hero bento card — What-If Simulator */
.bento-hero {
  grid-column: 1 / 6;
  grid-row: 1 / 3;
  background: var(--color-surface-dark);   /* obsidian — intentional contrast */
  border-color: transparent;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(26,27,25,0.15);
}

/* Standard bento slots */
.bento-sm { grid-column: span 4; }     /* 4 of 12 columns */
.bento-md { grid-column: span 7; }     /* 7 of 12 columns */

/* Icon chip */
.bento-icon {
  width: 36px; height: 36px;
  background: rgba(201,168,76,0.10);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.bento-icon svg {
  width: 18px; height: 18px;
  stroke: var(--color-gold);
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Text on dark (hero card) */
.bento-hero .bento-title { color: var(--color-gold-pale); }
.bento-hero .bento-copy  { color: rgba(232,213,160,0.55); }
.bento-hero .bento-icon  { background: rgba(201,168,76,0.15); }
```

### Pricing

```css
.pricing-section {
  padding: 90px 56px;
  max-width: 1320px;
  margin: 0 auto;
  border-top: 1px solid var(--color-border);
}

/* Toggle — CSS-only :checked sibling trick */
.pricing-toggle { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
.toggle-label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-muted); }

.toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute;
  inset: 0;
  background: rgba(201,168,76,0.12);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  cursor: pointer;
  transition: 0.2s;
}
.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px; height: 18px;
  background: var(--color-text-muted);
  border-radius: 50%;
  top: 2px; left: 2px;
  transition: 0.2s;
}
.toggle-switch input:checked + .toggle-slider { background: rgba(201,168,76,0.20); border-color: var(--color-gold); }
.toggle-switch input:checked + .toggle-slider::before { background: var(--color-gold); transform: translateX(20px); }

.save-chip {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-gold-dark);
  background: var(--color-gold-pale);
  border: 1px solid rgba(201,168,76,0.25);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

/* Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;
}

/* Base card */
.pricing-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.pricing-card:hover { border-color: var(--color-border-strong); }

/* Featured (Pro) card */
.pricing-card--featured {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  border-color: transparent;
  box-shadow: 0 16px 48px rgba(201,168,76,0.25), 0 1px 0 rgba(255,255,255,0.6) inset;
  position: relative;
}

/* "Most popular" badge floats above featured card */
.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text-primary);
  color: var(--color-gold-light);
  font-family: var(--font-manrope);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.pricing-plan-name {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}
.pricing-card--featured .pricing-plan-name { color: rgba(26,27,25,0.65); }

.pricing-price {
  font-family: var(--font-manrope);
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}

.pricing-period {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}
.pricing-card--featured .pricing-period { color: rgba(26,27,25,0.6); }

.pricing-divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: 20px;
}
.pricing-card--featured .pricing-divider { background: rgba(26,27,25,0.15); }

.pricing-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  margin-bottom: 24px;
}
.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--color-text-2);
  line-height: 1.4;
}
.pricing-features li::before { content: '✓'; font-weight: 700; color: var(--color-gold-dark); flex-shrink: 0; }
.pricing-card--featured .pricing-features li { color: rgba(26,27,25,0.8); }
.pricing-card--featured .pricing-features li::before { color: var(--color-text-primary); }
```

### Trust Bar

```css
.trust-bar {
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.trust-bar-inner {
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.trust-cell {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid var(--color-border);
}
.trust-cell:last-child { border-right: none; }

.trust-value {
  font-family: var(--font-manrope);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.trust-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
```

### Footer

```css
footer {
  background: var(--color-surface-dark);   /* obsidian — intentional brand anchor */
  border-top: 1px solid rgba(201,168,76,0.15);
}

.footer-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 56px 56px 40px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.footer-logo {
  font-family: var(--font-manrope);
  font-weight: 800;
  font-size: 1.125rem;
  letter-spacing: -0.03em;
  color: var(--color-gold-pale);          /* champagne on obsidian */
  margin-bottom: 8px;
}

.footer-tagline {
  font-size: 0.875rem;
  color: rgba(232,213,160,0.40);
}

.footer-links {
  display: flex;
  gap: 28px;
  align-items: center;
}
.footer-links a {
  font-size: 0.875rem;
  color: rgba(232,213,160,0.45);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-links a:hover { color: var(--color-gold-pale); }

/* Gold rule accent */
.footer-rule {
  width: 40px; height: 1px;
  background: var(--color-gold);
  margin-bottom: 24px;
  opacity: 0.6;
}

.footer-copy {
  font-size: 0.8125rem;
  color: rgba(232,213,160,0.25);
}
```

### Section Eyebrow (shared)

```css
.section-eyebrow {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-gold-dark);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--color-gold); }
```

### Badges / Pills

```css
/* Eyebrow pill — hero "UK Skilled Worker Visa" */
.eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(201,168,76,0.20);
  color: var(--color-gold-dark);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: var(--radius-full);
}
.eyebrow-pill::before { content: ''; width: 6px; height: 6px; background: var(--color-gold); border-radius: 50%; }

/* Status pill — generic */
.status-pill {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}
.status-pill--safe   { background: var(--color-safe-bg);  color: var(--color-safe-text); }
.status-pill--amber  { background: #FEF3C7;                color: #92400E; }
.status-pill--danger { background: #FEE2E2;                color: #991B1B; }
```

---

## Animation Guidelines

### Rules

1. **All animations must be inside** `@media (prefers-reduced-motion: no-preference) { ... }`
2. **The global reset** in `globals.css` already nullifies durations for `prefers-reduced-motion: reduce` — don't override it
3. Prefer CSS transitions over JS-driven animations for hover/focus states
4. One orchestrated entrance > scattered micro-interactions
5. No infinite loops on load — if an element pulses, give it a purpose

### Easing tokens

```css
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);    /* page entrances, reveals */
--ease-out-spring: cubic-bezier(0.175, 0.885, 0.32, 1.05); /* drawer open (existing) */
--ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);     /* hover state transitions */
```

### Hero entrance

```css
@media (prefers-reduced-motion: no-preference) {
  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeUp 0.7s var(--ease-out-expo) forwards;
  }
  .fade-up:nth-child(1) { animation-delay: 0ms; }
  .fade-up:nth-child(2) { animation-delay: 80ms; }
  .fade-up:nth-child(3) { animation-delay: 160ms; }
  .fade-up:nth-child(4) { animation-delay: 240ms; }
  .fade-up:nth-child(5) { animation-delay: 320ms; }

  @keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }

  .ring-card-entrance {
    animation: fadeUp 0.8s var(--ease-out-expo) 200ms both;
  }
}
```

### Card hover

```css
@media (prefers-reduced-motion: no-preference) {
  .bento-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
  .bento-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card-hover);
    border-color: var(--color-border-strong);
  }
}
```

### Button lift (already in globals.css, don't duplicate)

```css
/* This is already applied globally in globals.css @layer base */
button[class*="px-"]:hover, a[class*="px-"][class*="rounded"]:hover {
  transform: translateY(-1px);
}
```

---

## SVG Ring — Immutable Constants

The quota ring represents 42 of 180 days. These numbers must not change.

```
size:           212 × 212 viewBox="0 0 212 212"
center:         cx=106, cy=106
radius:         90
strokeWidth:    16
circumference:  565.49  (2 × π × 90)
dashOffset:     433.42  (565.49 × (1 - 42/180) = 565.49 × 0.7667)
stroke-linecap: round
transform:      rotate(-90 106 106)
```

**Track circle** (light): `stroke="rgba(201,168,76,0.10)"`
**Fill arc gradient:**
```html
<defs>
  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#C9A84C"/>
    <stop offset="100%" stop-color="#E8C87A"/>
  </linearGradient>
  <filter id="arcGlow">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<circle cx="106" cy="106" r="90"
  stroke="url(#ringGradient)"
  stroke-width="16"
  fill="none"
  stroke-linecap="round"
  stroke-dasharray="565.49"
  stroke-dashoffset="433.42"
  transform="rotate(-90 106 106)"
  filter="url(#arcGlow)"
/>
```

---

## Tailwind v4 Implementation

This project uses **Tailwind v4**. Key differences:

- Config lives in `@theme { }` block inside `src/app/globals.css` — no `tailwind.config.ts`
- Custom utilities are in `@layer utilities { }` in `globals.css`
- To reference CSS variables as Tailwind values: `bg-[var(--color-bg)]`, `text-[var(--color-gold)]`
- Common Tailwind classes for this design system:

```
bg-[var(--color-bg)]              → warm ivory background
bg-[var(--color-surface)]         → white surface
bg-[var(--color-surface-dark)]    → obsidian surface (footer, bento hero)
text-[var(--color-text-primary)]  → #1A1B19
text-[var(--color-gold)]          → #C9A84C
text-[var(--color-gold-dark)]     → #A88730
border-[var(--color-border)]      → rgba gold at 20%
rounded-[var(--radius-lg)]        → 12px
rounded-[var(--radius-xl)]        → 16px
shadow-[var(--shadow-card)]
```

- Font variables from `next/font/google` in layout.tsx:
  ```tsx
  const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', weight: ['300','400','500','600','700','800','900'] })
  const inter   = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['300','400','500','600'] })
  ```

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm  — two-column trust bar, two-col bento */ }
@media (min-width: 900px)  { /* md  — hero two-col grid, three-col pricing */ }
@media (min-width: 1200px) { /* lg  — full 12-col bento, max-width caps */ }
```

### Hero grid collapse

```css
.hero { grid-template-columns: 1.1fr 0.9fr; gap: 80px; }

@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; gap: 48px; }
  .ring-card { max-width: 100%; }
}
```

### Nav collapse

```css
@media (max-width: 600px) {
  .nav-links { display: none; }
  .nav-inner { padding: 0 20px; }
}
```

### Bento collapse

```css
/* 12-col → 2-col → 1-col */
@media (max-width: 900px) {
  .bento { grid-template-columns: repeat(2, 1fr); }
  .bento-hero { grid-column: 1 / -1; grid-row: auto; }
  .bento-sm, .bento-md { grid-column: span 1; }
}
@media (max-width: 600px) {
  .bento { grid-template-columns: 1fr; }
}
```

### Pricing collapse

```css
@media (max-width: 900px) {
  .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
}
```

### Trust bar collapse

```css
@media (max-width: 900px) {
  .trust-bar-inner { grid-template-columns: repeat(2, 1fr); }
  .trust-cell:nth-child(2) { border-right: none; }
  .trust-cell:nth-child(1), .trust-cell:nth-child(2) { border-bottom: 1px solid var(--color-border); }
}
@media (max-width: 600px) {
  .trust-bar-inner { grid-template-columns: 1fr; }
  .trust-cell { border-right: none !important; border-bottom: 1px solid var(--color-border); }
  .trust-cell:last-child { border-bottom: none; }
}
```

---

## Accessibility Checklist

Run on every component:
- [ ] Gold `#C9A84C` on white `#FFFFFF`: contrast **2.7:1** — use only for decorative text ≥18pt bold or icon strokes; never for body copy
- [ ] Gold dark `#A88730` on `#FAF8F2`: contrast **4.6:1** — ✓ AA (eyebrow labels, muted CTAs)
- [ ] Obsidian `#1A1B19` on `#FAF8F2`: contrast **17.2:1** — ✓ AAA
- [ ] Champagne `#E8D5A0` on obsidian `#1A1B19`: contrast **10.1:1** — ✓ AAA
- [ ] All interactive elements have `focus-visible` outline (inherit from Tailwind base)
- [ ] `aria-hidden="true"` on all decorative elements (grain, spotlight div)
- [ ] SVG rings get `aria-label` on the `<svg>` or wrapping element
- [ ] Pricing toggle: `<label>` wraps `<input type="checkbox">`; visible labels for both states
- [ ] `font-variant-numeric: tabular-nums` on all numbers that change (ring counter, trip days, prices)

---

## What Not To Do

- ❌ Do not use pure `#000000` — use `#1A1B19` (warm obsidian)
- ❌ Do not use pure `#FFFFFF` for backgrounds — use `#FAF8F2` (warm ivory) or `#FFFFFF` only for card surfaces
- ❌ Do not add green (`#006948`) to any landing page element — it is a dashboard-only colour
- ❌ Do not change the SAFE badge colours — `#9FF4CA` / `#002114` are semantic immigration indicators
- ❌ Do not add border-radius > `var(--radius-xl)` (16px) anywhere — this is not a pill-heavy design
- ❌ Do not use `font-family: Inter` on headings or prices — Manrope only
- ❌ Do not add animations outside `@media (prefers-reduced-motion: no-preference)`
- ❌ Do not add more than one focal animation per section — restraint is the aesthetic
- ❌ Do not change max-widths: hero/features/pricing use `1320px`, ring card `360px`
- ❌ Do not use Tailwind `purple-*`, `blue-*`, or `green-*` colour classes on landing page components

---

## Reference Files

| File | Purpose |
|------|---------|
| `design-variants/10-dark.html` | Primary dark reference — all component proportions and spacing |
| `design-variants/10-light.html` | Light mode reference — production target |
| `design-variants/10-obsidian-champagne.html` | Original exploration |
| `src/styles/tokens.css` | CSS variables — update to match this doc |
| `src/app/globals.css` | Tailwind v4 `@theme` block + global base styles |
| `src/components/marketing/Hero.tsx` | Current production hero — has QuotaRingMockup sub-component |
| `docs/DESIGN.md` | Original design doc — check for dashboard tokens that must be preserved |
