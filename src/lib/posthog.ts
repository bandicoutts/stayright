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

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export type AnalyticsEvent =
  // ── Authentication ────────────────────────────────────────────────────────
  | 'signup_started'
  | 'signup_completed'   // method: 'google' | 'email'
  | 'login'

  // ── Onboarding ────────────────────────────────────────────────────────────
  | 'onboarding_started'
  | 'onboarding_visa_setup_completed'
  | 'onboarding_trips_added'   // count: n
  | 'onboarding_skipped'

  // ── Core product ──────────────────────────────────────────────────────────
  | 'trip_plan_opened'
  | 'trip_plan_completed'      // days: n, verdict: 'SAFE'|'WARNING'|'DANGER'|'BREACH'
  | 'trip_plan_just_checking'
  | 'trip_logged'
  | 'trip_edited'
  | 'trip_deleted'
  | 'trips_bulk_deleted'
  | 'dashboard_viewed'
  | 'reports_viewed'

  // ── Paywall ───────────────────────────────────────────────────────────────
  | 'paywall_shown'      // trigger: 'trip_limit'|'pdf_export'|'alerts'
  | 'paywall_dismissed'
  | 'upgrade_clicked'    // plan: 'monthly'|'annual'|'lifetime'
  | 'upgrade_completed'

  // ── Retention ─────────────────────────────────────────────────────────────
  | 'return_visit'            // days_since_last: n
  | 'trip_count_milestone'    // count: 1|3|10

  // ── Other ─────────────────────────────────────────────────────────────────
  | 'pdf_generated'
  | 'account_deleted'

// ---------------------------------------------------------------------------
// User property types
// ---------------------------------------------------------------------------

export interface UserProperties {
  visa_route?: string
  qualifying_period?: string   // ILR eligibility date (YYYY-MM-DD)
  days_until_ilr?: number
  is_pro?: boolean
  trip_count?: number
  current_rolling_window_days?: number
  compliance_status?: 'SAFE' | 'WARNING' | 'DANGER' | 'BREACH'
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Type-safe event capture. No-ops silently if PostHog is not yet initialised
 * (user has not accepted analytics cookies, or key is missing).
 */
export function track(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return
  if (!initialized) return
  posthog.capture(event, properties)
}

/**
 * Associates subsequent events with the authenticated user.
 * Only the user ID (UUID) is sent — no name or email.
 */
export function identifyUser(userId: string): void {
  if (typeof window === 'undefined') return
  if (!initialized) return
  posthog.identify(userId)
}

/**
 * Sets person properties on the identified user.
 * Call after identifyUser() has run, e.g. from DashboardAnalytics.
 */
export function setUserProperties(props: UserProperties): void {
  if (typeof window === 'undefined') return
  if (!initialized) return
  posthog.setPersonProperties(props)
}

export function optOutCapturing(): void {
  if (typeof window === 'undefined') return
  if (initialized) posthog.opt_out_capturing()
}
