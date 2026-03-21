import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import type { StripePlanKey } from '@/lib/stripe'
import type Stripe from 'stripe'

const VALID_PLANS: StripePlanKey[] = ['pro_monthly', 'pro_annual', 'pro_lifetime']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const plan = body.plan as StripePlanKey

    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

    // Look up existing Stripe customer ID (if they've subscribed before)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    const isLifetime = plan === 'pro_lifetime'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isLifetime ? 'payment' : 'subscription',
      line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=1`,
      cancel_url: `${appUrl}/dashboard`,
      customer_email: subscription?.stripe_customer_id ? undefined : user.email ?? undefined,
      customer: subscription?.stripe_customer_id ?? undefined,
      // Pass user_id so the webhook can look up the correct user
      metadata: { user_id: user.id, plan },
      ...(isLifetime
        ? {}
        : {
            subscription_data: { metadata: { user_id: user.id, plan } },
          }),
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout] error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
