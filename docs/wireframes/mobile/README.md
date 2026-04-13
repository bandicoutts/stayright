# StayRight — Mobile Wireframes

Interactive HTML wireframes for the iOS/Android app. Open any file in a browser — no build step needed.

Each file covers a logical screen grouping and includes a dark/light theme toggle and screen switcher.

## Files

| File | Screens covered | Status |
|------|----------------|--------|
| `home_screens.html` | Safe (home), Warning state, Currently abroad, Trip list | Done |

## Coming next

- `plan_trip.html` — destination picker, dates + impact, confirm/save
- `trip_empty_state.html` — empty trip list, first-trip prompt
- `onboarding.html` — welcome, visa setup, import trips
- `reports.html` — reports home, PDF preview
- `settings.html` — settings home, visa profile, subscription

## Design tokens

All wireframes use the same CSS variable system as the production app:
- Dark: `#080B08` base, `#111710` surface, `#00A874` accent
- Light: `#F5FAF7` base, `#FFFFFF` surface, `#006948` accent
- Safe: `#9FF4CA` / `#002114`
- Warning: amber tokens
- Danger: red tokens

Fonts loaded from jsDelivr CDN (Manrope Variable, JetBrains Mono Variable).
