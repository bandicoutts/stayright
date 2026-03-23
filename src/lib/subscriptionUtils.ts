/**
 * Subscription utilities
 *
 * Central source of truth for Pro access checks and the Free tier trip quota.
 *
 * Keeping this here — rather than inlining the logic in each Server Action or
 * page — prevents the "client-only paywall" anti-pattern: the UI check and the
 * server-side enforcement diverge over time and create a bypass.
 *
 * Security findings addressed: C-1, C-2, H-1 (pentest 2026-03-22).
 * See DECISIONS.md [DECISION-034].
 */

/** Maximum trips a Free user may store. Enforced server-side in every write action. */
export const FREE_TRIP_LIMIT = 3

/**
 * Returns true only when the plan+status combination grants full Pro access.
 *
 * Rules:
 *  - plan must be non-null and not 'free'
 *  - status must not be 'past_due' or 'unpaid'
 *    (these indicate a failed payment still within Stripe's retry window)
 *
 * 'canceled' status does NOT need explicit handling here because the
 * customer.subscription.deleted webhook already resets plan → 'free'.
 */
export function isPlanPro(
  plan: string | null | undefined,
  status: string | null | undefined
): boolean {
  if (!plan || plan === 'free') return false
  if (status === 'past_due' || status === 'unpaid') return false
  return true
}
