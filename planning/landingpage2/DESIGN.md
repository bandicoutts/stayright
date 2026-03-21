# Design System Specification

## 1. Overview & Creative North Star
**Creative North Star: The Editorial Concierge**
This design system moves beyond the "utility app" aesthetic to create a high-end, editorial experience. Managing UK visa absences is a high-stakes, data-heavy task; the UI must act as a calm, authoritative concierge. We achieve this by breaking the rigid "dashboard grid" in favor of **intentional asymmetry** and **tonal depth**. 

Instead of boxes-on-boxes, we use a "layered paper" philosophy. The layout should feel like a premium physical folder where information is organized through light, shadowless stacking and generous white space. We avoid the "template look" by utilizing a dramatic typographic scale and overlapping elements that guide the eye through the visa timeline.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, "British Racing Green" (`primary: #004f35`), conveying stability and government-level trust, contrasted against a crisp, airy background.

### Tonal Surface Hierarchy
We strictly prohibit 1px solid borders for sectioning. Boundaries are defined solely through background color shifts or subtle tonal transitions.
- **Base Layer:** `background (#f8f9fa)` — The infinite canvas.
- **Sectioning:** Use `surface_container_low (#f3f4f5)` for large logical blocks (e.g., a sidebar or a background for a list).
- **Interactive Elements:** Use `surface_container_lowest (#ffffff)` for cards and inputs to make them "pop" against the darker background.
- **Nesting Rule:** To create depth, always move one step up or down the scale. A `surface_container_highest` card should never sit on a `surface_bright` background; it needs the intermediate `surface_container` to feel intentional.

### The "No-Line" & Glass Rule
- **No Hard Borders:** Never use `#000000` or high-contrast outlines.
- **Glassmorphism:** For floating navigation or "Top-of-Stack" alerts, use `surface_container_lowest` with an 80% opacity and a `20px` backdrop-blur. This allows the primary greens to bleed through softly, preventing the UI from feeling "pasted on."
- **Signature Textures:** Use a subtle linear gradient on primary CTAs: `primary (#004f35)` to `primary_container (#006948)` at a 135-degree angle. This adds "soul" and a tactile, silk-like finish to buttons.

---

## 3. Typography
We pair the geometric confidence of **Manrope** with the high-legibility precision of **Inter**.

- **Display & Headlines (Manrope):** Use `display-lg` (3.5rem) for milestone numbers (e.g., "180 Days Remaining"). Headlines should use `headline-sm` (1.5rem) with tight letter-spacing (-0.02em) to create an editorial, "newspaper masthead" feel.
- **Body & Labels (Inter):** All functional data, dates, and visa rules use Inter. `body-md` (0.875rem) is the workhorse.
- **Hierarchy via Contrast:** Create a "High-End" look by pairing a very large `display-md` headline with a very small, all-caps `label-md` sub-header. This extreme contrast in scale is the hallmark of premium design.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not shadows.

- **The Layering Principle:** To lift a card, place a `surface_container_lowest (#ffffff)` element on a `surface_container (#edeeef)` background. The 2% difference in luminosity is enough for the human eye to perceive elevation without the clutter of a drop shadow.
- **Ambient Shadows (The Exception):** If a component must float (e.g., a mobile bottom sheet), use an ambient shadow: `color: on_surface` at **4% opacity**, Blur: `40px`, Y: `12px`. It should feel like a soft glow, not a dark edge.
- **Ghost Borders:** For accessibility in form fields, use `outline_variant` at **20% opacity**. It provides a "hint" of a container without breaking the "No-Line" rule.

---

## 5. Components

### Buttons & Chips
- **Primary Button:** Gradient fill (Primary to Primary Container), `0.75rem` (md) corners. No border. Text is `on_primary`.
- **Secondary Button:** `surface_container_high` background with `primary` text. This feels integrated into the surface.
- **Absence Chips:** Use `secondary_container` for "Approved" days and `tertiary_fixed` (soft red) for "Overstay Risk." Chips must have `full` (9999px) roundedness to contrast against the `md` (0.75rem) cards.

### Input Fields
- **StayRight Fields:** No bottom line. Use a solid `surface_container_low` background with `0.75rem` corners. On focus, transition the background to `surface_container_lowest` and add a 1px "Ghost Border" of `primary` at 30% opacity.

### Timeline Cards & Lists
- **Rule:** Forbid divider lines.
- **Execution:** Separate "Absence Entries" using `1.5rem` (spacing scale 6) of vertical white space. If entries need grouping, wrap them in a `surface_container_low` block with `1rem` (lg) padding.

### Specialized Component: The "Quota Ring"
A custom circular progress indicator using `surface_variant` for the track and a `primary` to `inverse_primary` gradient for the progress, signifying the 180-day rolling limit.

---

## 6. Do’s and Don’ts

### Do
- **Use Asymmetric Padding:** Try `padding-left: 2rem` and `padding-right: 1.5rem` on cards to create a modern, rhythmic flow.
- **Embrace White Space:** If you think there is enough space, add `0.5rem` more. Space is the primary luxury signal in this system.
- **Use Tonal Stepping:** Use `surface_dim` for footer areas to anchor the page.

### Don’t
- **No 100% Black:** Never use `#000000`. Use `on_surface (#191c1d)` for all "black" text.
- **No Hard Edges:** Avoid `0px` or `0.25rem` corners unless it's for a tiny badge. Stick to the `md (0.75rem)` or `lg (1rem)` standard.
- **No Default Grids:** Avoid perfectly symmetrical 3-column layouts. Try a 2/3 and 1/3 split to create editorial interest.