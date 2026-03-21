import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

// Next.js App Router route handlers receive the raw request body — no body
// parser configuration needed. We read it as text for Stripe signature verification.

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[webhook] received: ${event.type} (${event.id})`)

  try {
    await handleEvent(event)
  } catch (err) {
    // Log and return 500 so Stripe retries (up to 3 times per PRD §4j)
    console.error(`[webhook] handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ---------------------------------------------------------------------------
// Event dispatcher
// ---------------------------------------------------------------------------

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break
    default:
      console.log(`[webhook] unhandled event type: ${event.type}`)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// In Stripe v20 (2026-02-25.clover), current_period_end moved to SubscriptionItem
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}

// ---------------------------------------------------------------------------
// checkout.session.completed
// Fires for both subscription and one-time (lifetime) payments.
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const plan = session.metadata?.plan as string | undefined

  if (!userId || !plan) {
    console.error('[webhook] checkout.session.completed missing metadata:', session.id)
    return
  }

  const supabase = createAdminClient()

  if (session.mode === 'payment') {
    // Lifetime — one-time payment, no subscription object
    await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        plan: 'pro_lifetime',
        status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: null,
        current_period_end: null,
      },
      { onConflict: 'user_id' }
    )
  } else if (session.mode === 'subscription' && session.subscription) {
    const sub = await stripe.subscriptions.retrieve(session.subscription as string)
    await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        plan,
        status: sub.status,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: sub.id,
        current_period_end: getSubscriptionPeriodEnd(sub),
      },
      { onConflict: 'user_id' }
    )
  }

  console.log(`[webhook] checkout completed for user ${userId}, plan: ${plan}`)
}

// ---------------------------------------------------------------------------
// customer.subscription.updated
// Fires on plan changes, renewals, and cancellation scheduling.
// ---------------------------------------------------------------------------

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()
  const priceId = subscription.items.data[0]?.price.id
  const plan = priceIdToPlan(priceId)
  const periodEnd = getSubscriptionPeriodEnd(subscription)

  const userId = subscription.metadata?.user_id
  if (userId) {
    await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        plan,
        status: subscription.status,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        current_period_end: periodEnd,
      },
      { onConflict: 'user_id' }
    )
    console.log(`[webhook] subscription updated for user ${userId}: plan=${plan} status=${subscription.status}`)
  } else {
    await supabase
      .from('subscriptions')
      .update({ plan, status: subscription.status, current_period_end: periodEnd })
      .eq('stripe_subscription_id', subscription.id)
    console.log(`[webhook] subscription updated (by sub id): ${subscription.id}`)
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.deleted
// Fires when a subscription is fully cancelled (after period end).
// Revert to free — preserve all existing data per PRD §4j.
// ---------------------------------------------------------------------------

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()

  const update = {
    plan: 'free',
    status: 'canceled',
    stripe_subscription_id: null as string | null,
    current_period_end: null as string | null,
  }

  const userId = subscription.metadata?.user_id
  if (userId) {
    await supabase.from('subscriptions').update(update).eq('user_id', userId)
    console.log(`[webhook] subscription deleted for user ${userId} — reverted to free`)
  } else {
    await supabase
      .from('subscriptions')
      .update(update)
      .eq('stripe_subscription_id', subscription.id)
    console.log(`[webhook] subscription deleted (by sub id): ${subscription.id} — reverted to free`)
  }
}

// ---------------------------------------------------------------------------
// invoice.payment_failed
// In Stripe v20, invoice.subscription is accessed via invoice.parent.subscription_details.subscription
// ---------------------------------------------------------------------------

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    invoice.parent?.type === 'subscription_details'
      ? (invoice.parent.subscription_details?.subscription as string | undefined)
      : undefined

  if (!subscriptionId) return

  const supabase = createAdminClient()
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`[webhook] payment failed for subscription: ${subscriptionId}`)
}

// ---------------------------------------------------------------------------
// Helper: map a Stripe Price ID to our plan string
// ---------------------------------------------------------------------------

function priceIdToPlan(priceId: string | undefined): string {
  if (!priceId) return 'free'
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'pro_monthly'
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'pro_annual'
  if (priceId === process.env.STRIPE_PRICE_LIFETIME) return 'pro_lifetime'
  console.warn(`[webhook] unknown price ID: ${priceId}`)
  return 'free'
}
