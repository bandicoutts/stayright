# StayRight

StayRight is a web-based visa absence tracker that helps UK Skilled Worker visa holders stay compliant with the 180-day absence rule required for Indefinite Leave to Remain (ILR) eligibility. It replaces error-prone spreadsheets and mental arithmetic with a live rolling-window calculator, a "what-if" trip simulator, and audit-ready PDF exports — giving users the confidence to book international travel without risking their permanent residency application.

**Live:** https://stayright.vercel.app

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

## Pre-launch checklist

These three steps must be completed before taking real money or sending real emails. The app is fully functional on test/placeholder credentials until then.

### 1. Switch Stripe to live mode
The app currently runs on Stripe test keys (`sk_test_`, `pk_test_`). Before launch:
1. Go to **Stripe Dashboard → Developers → API keys** and copy the live secret and publishable keys.
2. Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in the Vercel project environment variables (production environment only).
3. Go to **Stripe Dashboard → Developers → Webhooks** and register a new endpoint:
   - URL: `https://stayright.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the **Signing secret** (`whsec_...`) from the new webhook and update `STRIPE_WEBHOOK_SECRET` in Vercel.
5. The price IDs (`STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME`) will also be different in live mode — update them from the live Stripe Dashboard → Products.

### 2. Set up email sending (Resend + stayright.app)
Email sending is dormant until a domain is verified. Once `stayright.app` is purchased:
1. Go to **Resend → Domains → Add Domain** → enter `stayright.app`.
2. Add the DNS records Resend provides (MX, TXT, DKIM) to the domain's DNS settings.
3. Click **Verify** in Resend once DNS propagates (usually a few minutes, up to an hour).
4. Go to **Resend → API Keys → Create API Key** → copy the `re_...` key.
5. Add `RESEND_API_KEY` to the Vercel project environment variables.
6. Redeploy (or it will pick up on next push to main).

### 3. Switch Supabase auth URLs to custom domain (optional)
If `stayright.app` is pointed at Vercel (i.e. the app moves from `stayright.vercel.app` to `stayright.app`):
1. Go to **Supabase → Authentication → URL Configuration**.
2. Update **Site URL** to `https://stayright.app`.
3. Update **Redirect URLs** — remove `https://stayright.vercel.app/**`, add `https://stayright.app/**`.
4. Update `NEXT_PUBLIC_APP_URL` in Vercel to `https://stayright.app`.

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
