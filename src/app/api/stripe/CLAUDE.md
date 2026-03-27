# Stripe API routes

Routes in this directory: `checkout/route.ts`, `portal/route.ts`, `webhook/route.ts`.

## Critical constraints

**Webhook signature verification** requires raw body — always use `await request.text()`, never `request.json()`.

**Paywall is NOT enforced here** — it is enforced in Server Actions via `isPlanPro()` in `src/lib/subscriptionUtils.ts`. These routes only create Stripe sessions.

**Idempotency is NOT fully implemented** — `handlePaymentFailed` uses a plain `.update()` (not idempotent under replay). This is a known gap (DECISION-041, M-3). Do not silently close it without a `processed_webhook_events` table and a migration.

## Webhook events handled

- `checkout.session.completed` — creates/updates subscription row
- `customer.subscription.updated` — updates plan + status
- `customer.subscription.deleted` — reverts to free
- `invoice.payment_failed` — sets `status = 'past_due'`

## Env vars required

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_ANNUAL`
- `STRIPE_PRICE_LIFETIME`
- `NEXT_PUBLIC_APP_URL` — must be `https://stayright.vercel.app` in production

## Prod endpoint

Webhook registered in Stripe Dashboard at: `https://stayright.vercel.app/api/stripe/webhook`

## Key decisions

- **DECISION-027** — why API routes (not Server Actions) are used for checkout/portal
- **DECISION-040** — `isPlanPro(plan, status)` is the paywall gate; past_due loses Pro access
- **DECISION-041** — known security gaps (webhook idempotency M-3, rate limiting L-1) deferred to v1.1
- **DECISION-038** — `stripe.customers.del()` called on account deletion (GDPR)

## isPlanPro

```ts
import { isPlanPro } from '@/lib/subscriptionUtils'
isPlanPro(plan, status) // returns false for past_due / unpaid
```
