# StayRight — Manual Test Checklist

Run this checklist before every major release. Contains items that cannot be automated.

---

## Stripe Payment Flows

Use the [Stripe test card numbers](https://stripe.com/docs/testing).

- [ ] **Successful subscription** — card `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] **Failed payment** — card `4000 0000 0000 0002` → payment declined error shown
- [ ] **3DS authentication required** — card `4000 0025 0000 3155` → 3DS modal appears
- [ ] **Subscription cancellation** via Customer Portal → confirm Pro features remain until billing period ends
- [ ] **Pro access retained** until end of billing period after cancel
- [ ] **Free tier restrictions apply** after billing period ends (3-trip cap, no exports, no alerts)
- [ ] **Annual plan checkout** — `£24.99/year` displayed; subscription renews annually
- [ ] **Lifetime plan checkout** — `£49.99` one-time; no renewal prompt ever shown

---

## Auth Flows Requiring Real Email

- [ ] **Email verification** — sign up → check inbox → link works and lands on onboarding
- [ ] **Password reset** — request reset → check inbox → link works → new password screen
- [ ] **Reset link expiry** — confirm link expires after 24 hours (attempt after 24h → friendly error message)
- [ ] **Google OAuth signup** — new account created for a Google account not previously signed up
- [ ] **Google OAuth login** — existing account logs in successfully (no duplicate account)

---

## PDF Verification

Download the ILR Absence Table and verify the document manually.

- [ ] **Download** — click "Generate" on Reports → PDF downloads immediately
- [ ] **Header** — PDF contains: user's full name, visa route, qualifying period start and end dates
- [ ] **All trips present** — trips appear in chronological order (oldest first)
- [ ] **Total absence days** — summary row at the bottom shows the correct total
- [ ] **Disclaimer footer** — "Not legal advice. Always verify with UKVI."
- [ ] **File name** — follows convention `StayRight_ILR_Absence_Table_YYYY-MM-DD.pdf`
- [ ] **Open in Adobe Reader** — no errors, no corrupt file warnings

---

## Mobile Device Testing

Test on real hardware or a hardware-accurate simulator.

- [ ] **iOS / Safari mobile** — test on a real iPhone or Safari iOS Simulator
- [ ] **Android / Chrome** — test on a real Android device or Chrome DevTools mobile emulation
- [ ] **Trip drawer** — opens as a bottom sheet on mobile (not a centred modal)
- [ ] **Touch targets** — all buttons and links are ≥ 44×44px (check with browser dev tools)
- [ ] **Cookie consent** — banner usable on mobile, does not obscure primary CTAs
- [ ] **Quota ring** — renders correctly on small screens (390px)
- [ ] **Horizontal scroll** — no horizontal scroll on main pages at 390px width
