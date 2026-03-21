import Stripe from 'stripe'

// Server-side Stripe client — never import this in Client Components.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})

// ---------------------------------------------------------------------------
// Price IDs — set these in .env.local once you've created products in Stripe
// ---------------------------------------------------------------------------

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_MONTHLY!,
  pro_annual: process.env.STRIPE_PRICE_ANNUAL!,
  pro_lifetime: process.env.STRIPE_PRICE_LIFETIME!,
} as const

export type StripePlanKey = keyof typeof STRIPE_PRICES
