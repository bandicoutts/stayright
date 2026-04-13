## Design Context

### Users
UK Skilled Worker visa holders preparing for Indefinite Leave to Remain (ILR). They use StayRight in moments of real anxiety — before booking a flight, after returning from a long trip, when they're unsure if they're close to breaching the 180-day rule. They are often professionals (tech, finance, healthcare) who expect polished, trustworthy tools. Their core job to be done: get a clear, accurate answer to "am I safe to travel?" without manual spreadsheet work.

### Brand Personality
**Calm. Trusted. Precise.**

StayRight is a compliance concierge — it carries the weight of something important (UK immigration status) with quiet authority. The tone is never alarmist, never bureaucratic. It speaks with the confidence of an expert who already knows the answer. Think: a sharp immigration lawyer who also has great taste.

### Emotional Goals
Users should feel:
- **Relief and confidence** — the number is right, I can trust this, I can book my flight
- **Control and clarity** — I know exactly where I stand, no ambiguity
- **Premium and cared-for** — this is a real product, not a spreadsheet hack

### Aesthetic Direction
**Reference:** Linear, Vercel — dark, precise, developer-grade confidence. Data-rich without feeling heavy. Strong visual hierarchy, muted palette with deliberate accent use, pixel-perfect spacing.

**Anti-references:**
- Government / HMRC — no bureaucratic heaviness, no accessibility-first-but-ugly patterns
- Generic SaaS — no blue-gradient dashboard bro aesthetics, no rounded-card-everywhere defaults
- Brutalist / stark — intentional rawness would undermine trust in a compliance tool

**Visual tone:** Editorial dark luxury. The green palette (`#006948` primary, `#F5FAF7` light bg, `#080B08` dark bg) is the soul of the brand. Dark mode is a first-class citizen.

### Design Tokens (Single Source of Truth)
All tokens live in `src/styles/tokens.css`. Never hardcode values — always reference tokens.

| Token | Value | Usage |
|---|---|---|
| `--color-green` | `#006948` | Primary accent, CTAs, active states |
| `--color-bg` | `#F5FAF7` / `#080B08` | Page background (light/dark) |
| `--color-surface` | `#FFFFFF` / `#0E1310` | Cards, panels |
| `--color-text` | `#0D1B10` / `#E8EDE9` | Primary text |
| `--radius-lg` | `12px` | Primary radius — cards, buttons |

Status semantics: `SAFE` green → `WARNING` amber `#D97706` → `DANGER` red `#BA1A1A`

### Design Principles

1. **Precision earns trust.** Every number, label, and status indicator must be unambiguous. Never use vague language or approximate visuals.
2. **Calm over alarm.** Use colour semantics (amber, red) purposefully — not decoratively. Never panic the user.
3. **Dark luxury, not dark mode as afterthought.** Obsidian backgrounds, green-tinted surfaces, and layered shadows should feel intentional and premium.
4. **Density with breathing room.** Information should be dense and scannable — but never cluttered.
5. **Editorial restraint.** Add motion only where it aids comprehension. Remove anything decorative that doesn't serve the user's job.
