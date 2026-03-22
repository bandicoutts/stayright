/**
 * PostHog analytics wrapper
 *
 * Only fires events once the user has accepted analytics cookies
 * (cookie_consent === 'accepted'). PostHog is never initialised for
 * users who chose "Necessary only".
 *
 * No PII is ever sent — only the Supabase user ID (a UUID).
 */

import posthog from 'posthog-js'

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

// Module-level flag — prevents double-init and gates all event capture
let initialized = false

export function initPostHog(): void {
  if (initialized) return
  if (!POSTHOG_KEY) return // key not configured — skip silently
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only', // no anonymous profiles (GDPR-friendly)
    capture_pageview: false, // captured manually in PostHogProvider
    capture_pageleave: true,
  })
  initialized = true
}

/**
 * Type-safe event capture. No-ops if PostHog is not yet initialised
 * (i.e. user has not accepted analytics cookies).
 *
 * Events mirror the spec in PRD §4n exactly.
 */
export function track(
  event:
    | 'signup_completed'
    | 'onboarding_completed'
    | 'onboarding_skipped'
    | 'first_trip_logged'
    | 'trip_logged'
    | 'what_if_used'
    | 'paywall_shown'
    | 'upgrade_started'
    | 'upgrade_completed'
    | 'pdf_generated'
    | 'account_deleted',
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return
  if (!initialized) return
  posthog.capture(event, properties)
}

/**
 * Associates subsequent events with the authenticated user.
 * Call after login / on initial authenticated page load.
 * Only the user ID (UUID) is sent — no name or email.
 */
export function identifyUser(userId: string): void {
  if (typeof window === 'undefined') return
  if (!initialized) return
  posthog.identify(userId)
}

export function optOutCapturing(): void {
  if (typeof window === 'undefined') return
  if (initialized) posthog.opt_out_capturing()
}
