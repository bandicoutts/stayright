# Design System Document: Editorial Concierge

## 1. Overview & Creative North Star

### Creative North Star: "The Digital Curator"
This design system moves away from the utilitarian "SaaS dashboard" aesthetic toward a high-end, editorial experience. It is designed to feel like a bespoke concierge service—authoritative yet understated. By prioritizing breathing room, tonal depth over structural lines, and a dramatic typographic scale, we transform a functional dashboard into a curated workspace. 

The system rejects the rigid, "boxed-in" feeling of traditional grids. Instead, it utilizes intentional asymmetry and nested surfaces to guide the user’s eye. The experience should feel like a premium physical journal: tactile, layered, and sophisticated.

---

## 2. Colors & Surface Architecture

Our palette is anchored by deep botanical greens and soft, architectural neutrals.

### Color Palette (Semantic Tokens)
*   **Primary Accent:** `var(--color-green)` (Vibrant, high-contrast)
*   **Primary Light:** `var(--color-green-light)` (Interactive states)
*   **Background:** `var(--color-bg)` (The "Obsidian" canvas)
*   **Surface:** `var(--color-surface)` (Raised cards/sections)
*   **Surface Dark:** `var(--color-surface-dark)` (OLED-black backgrounds)

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or containers. 
Boundaries must be created through **Tonal Layering**. Use the subtle shift from `background` to `surface` to define large content areas. Elements that need to stand out (like action cards) should use `surface-light` or appropriate token hierarchy.

### Signature Textures & Glassmorphism
To avoid a "flat" digital look:
*   **Glassmorphism:** For floating modals or navigation overlays, use `var(--color-surface)` at 80% opacity with a `24px` backdrop blur.
*   **Signature Gradients:** For primary CTAs and hero states, apply `var(--gradient-green)`.

---

## 3. Typography: The Editorial Voice

We utilize a high-contrast pairing to distinguish between "Story" (Brand) and "Detail" (Data).

| Level | Font Family | Size | Character |
| :--- | :--- | :--- | :--- |
| **Display** | Manrope | 2.25rem - 3.5rem | Bold, authoritative, generous tracking (-2%). |
| **Headline** | Manrope | 1.5rem - 2.0rem | Tight, editorial, deep green (`primary`). |
| **Title** | Inter | 1.0rem - 1.375rem | Medium weight, high legibility for navigation. |
| **Body** | Inter | 0.875rem - 1.0rem | Standard reading weight; `on_surface_variant`. |
| **Label** | Inter | 0.6875rem - 0.75rem | All-caps, slightly tracked out (+5%) for data headers. |

**The Typography Principle:** Headlines are the "Concierge" speaking to the user. Body text and labels are the "Data" serving the user. Never use Manrope for data tables or long-form body text; keep it reserved for the "voice" of the brand.

---

## 4. Elevation & Depth

Hierarchy is achieved through "stacking" rather than "shadowing."

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card atop a `surface_container_low` (#f3f4f5) section. The contrast in lightness creates a natural, soft lift.
*   **Ambient Shadows:** If a floating element (like a dropdown) requires a shadow, use a "Botanical Shadow": `0px 12px 32px rgba(0, 33, 20, 0.06)`. This uses a tiny hint of the primary green to mimic natural light filtered through a high-end space.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` token at 15% opacity. Never use a 100% opaque border.

---

## 5. Components

### Navigation: The Fixed Pillar
*   **Sidebar:** 240px fixed width. Surface: `surface_container_low`. 
*   **Active State:** Use a soft "pill" background in `primary_fixed` (#9ff4ca) with `on_primary_fixed` (#002114) text. No hard rectangles.

### Buttons: The Tactile Interaction
*   **Primary:** Pill-shaped (`rounded-full`). Gradient of `primary` to `primary_container`. White text. No border.
*   **Secondary/Ghost:** `on_surface` text. On hover, a subtle `surface_container_high` background fill.

### Cards: The Content Vessel
*   **Styling:** No borders. `rounded-lg` (1rem) corner radius.
*   **Spacing:** Use a minimum of `spacing-6` (2rem) for internal padding to maintain the "Editorial" feel.
*   **Lists within Cards:** Forbid divider lines. Use `spacing-3` (1rem) of vertical white space to separate items.

### Status Indicators
*   **Chips:** High-end pill shapes. Use `primary_fixed` for Green/Success, `secondary_fixed` for Amber/Warning, and `tertiary_fixed` for Red/Error. Use the "on-fixed" variant for the text color to ensure soft, legible contrast.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. A card might span 8 columns while the sidebar context spans 4.
*   **Do** embrace white space. If a section feels "full," it probably needs more padding.
*   **Do** use the `24px` spacing token between primary sections to allow the background to "breathe."

### Don’t:
*   **Don't** use black (#000000). Use `on_surface` (#191c1d) for text to keep the interface soft.
*   **Don't** use 1px dividers. Use a shift in background color or increased vertical spacing.
*   **Don't** use standard "drop shadows." Use the Ambient Shadow guidelines to keep the interface feeling grounded and organic.
*   **Don't** use sharp corners. Every interaction point should feel approachable with `rounded-md` or `rounded-full`.