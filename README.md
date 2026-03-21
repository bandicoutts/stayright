# StayRight

StayRight is a web-based visa absence tracker that helps UK Skilled Worker visa holders stay compliant with the 180-day absence rule required for Indefinite Leave to Remain (ILR) eligibility. It replaces error-prone spreadsheets and mental arithmetic with a live rolling-window calculator, a "what-if" trip simulator, and audit-ready PDF exports — giving users the confidence to book international travel without risking their permanent residency application.

**Live:** https://ecstatic-hopper.vercel.app

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend + API | Next.js 16 (App Router), TypeScript strict |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase (Postgres, RLS, Supabase Auth) |
| Hosting | Vercel |
| Payments | Stripe |
| Email | Resend |
| Analytics | PostHog (Cloud EU) |
| Version control | GitHub |

---

## Running locally

```bash
git clone https://github.com/bandicoutts/stayright.git
cd stayright
npm install
cp .env.local.example .env.local
# Fill in the environment variables in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** `.env.local` is required to run the app and is never committed to GitHub. Copy `.env.local.example` and fill in the values. The landing page works without any values set. The authenticated platform requires Supabase, Stripe, and Resend credentials.

---

## Documentation

| File | Contents |
|---|---|
| [`/docs/PRD.md`](/docs/PRD.md) | Product requirements — the single source of truth for what to build |
| [`/docs/DECISIONS.md`](/docs/DECISIONS.md) | Decision log — architectural and product decisions with reasoning |
| [`/docs/DESIGN.md`](/docs/DESIGN.md) | Design system — shared tokens, typography, and precedence rules |
| [`/docs/WIREFRAMES.md`](/docs/WIREFRAMES.md) | Wireframe index — maps screen names to file paths |

When there is a conflict between documents, the precedence order is:
**PRD.md > DESIGN.md shared rules > dashboard.DESIGN.md > landing.DESIGN.md > Wireframes**
