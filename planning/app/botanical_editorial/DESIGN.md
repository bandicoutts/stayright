# Design System Document

## 1. Overview & Creative North Star: The Digital Concierge
This design system is built upon the concept of the **"Digital Concierge."** It rejects the mechanical, "app-like" density of traditional mobile interfaces in favor of an editorial, high-end travel publication aesthetic. The goal is to make international stay compliance feel like a premium service rather than a bureaucratic chore.

The experience is defined by **expansive white space**, **authoritative typography**, and **tonal layering**. We break the "template" look through intentional asymmetry—such as oversized display headers and staggered card arrangements—that guide the user's eye with the grace of a physical concierge.

## 2. Colors
Our palette is rooted in botanical depth and soft, paper-like neutrals. It is designed to feel organic yet disciplined.

### Palette Highlights
- **Primary Botanical:** `#003623` (Deepest Forest) and `#004f35` (Primary Container). These provide the authoritative "ink" and brand presence.
- **Secondary Mint:** `#076c4b` and `#9cf1c7`. Used for highlights, success states, and subtle accents.
- **Soft Neutrals:** Our background starts at `#f8f9fa` (Surface). We move through `#f3f4f5` (Surface Container Low) to create depth without adding visual noise.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid borders for sectioning or card containment. Boundaries must be defined solely through background color shifts. A card should never have a stroke; it should exist as a `surface-container-lowest` (#ffffff) shape sitting atop a `surface-container-low` (#f3f4f5) background.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. To create a "nested" look:
1. **Base Layer:** `surface` (#f8f9fa).
2. **Structural Sections:** `surface-container-low` (#f3f4f5).
3. **Interactive Cards:** `surface-container-lowest` (#ffffff).

### Glass & Signature Textures
For floating elements, such as the MD3 Bottom Nav or Modal Overlays, use **Glassmorphism**. Apply a semi-transparent `surface` color with a 20px backdrop-blur. For main CTAs, use a subtle vertical gradient from `secondary` (#076c4b) to `primary_container` (#004f35) to give the button a tactile, "soulful" quality.

## 3. Typography
The system uses a high-contrast typographic scale to establish an editorial rhythm.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern elegance. Use `display-lg` (3.5rem) for hero screens and `headline-md` (1.75rem) for trip titles. The generous tracking in headers should be slightly tightened (-2%) for an "expensive" feel.
*   **Body & Data (Inter):** Used for maximum legibility in complex data sets. Inter’s neutral character allows the botanical greens to take center stage.
*   **Labeling:** `label-md` (0.75rem) should be used for status badges (e.g., "SAFE TO TRAVEL") with increased letter spacing (0.05rem) to mimic luxury print labels.

## 4. Elevation & Depth
We replace traditional Material shadows with **Tonal Layering**.

*   **The Layering Principle:** Softness is paramount. Place white cards on light grey backgrounds to create a natural "lift."
*   **Ambient Shadows:** If a floating action is required, shadows must be extra-diffused. 
    *   *Spec:* `0px 12px 32px rgba(0, 79, 53, 0.06)`. Note the green tint in the shadow—this mimics natural light passing through a botanical environment.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use `outline-variant` (#bfc9c1) at **10% opacity**. This creates a suggestion of a border without breaking the editorial flow.

## 5. Components

### Cards & Lists
*   **Card Corner Radius:** Always `md` (0.75rem).
*   **Spacing:** Use `spacing-6` (2rem) between cards.
*   **Constraint:** Forbid divider lines. Separate list items using `spacing-3` (1rem) of vertical white space or a subtle shift between `surface-container-lowest` and `surface-container-low`.

### Buttons
*   **Primary:** Botanical gradient background, `on-primary` text, `full` (pill) roundedness.
*   **Secondary:** `surface-container-high` background with `primary` text. No border.
*   **Tertiary:** Text-only with `primary` color, used for "Cancel" or "Back" actions.

### MD3 Bottom Navigation
*   **Visual Style:** A floating glass bar. Use `surface` at 85% opacity with backdrop-blur.
*   **Indicator:** Use the `secondary_fixed` (#9ff4ca) pill for the active state indicator.

### Progress Indicators
*   **Compliance Rings:** Use `primary` (#003623) for the progress stroke and `surface-container-high` (#e7e8e9) for the track. Center the numerical data using `display-md` Manrope.

### Input Fields
*   **Style:** Filled style using `surface-container-low`. No bottom line.
*   **Corners:** `0.5rem` (default).
*   **Focus State:** A 2px "Ghost Border" using `primary` at 40% opacity.

## 6. Do's and Don'ts

### Do
*   **DO** use asymmetric layouts. Align a headline to the left but place the supporting data in a card shifted slightly to the right.
*   **DO** use "Tonal Stepping" (white on light grey) for all trip history items.
*   **DO** leave "breathing room." If you think there is enough margin, add 0.5rem more.

### Don't
*   **DON'T** use 1px solid black or dark grey borders. It shatters the high-end feel.
*   **DON'T** use standard Material "Elevation 1" shadows. They feel heavy and "software-like."
*   **DON'T** crowd the screen. This is a concierge service; we present only what the user needs at this moment.