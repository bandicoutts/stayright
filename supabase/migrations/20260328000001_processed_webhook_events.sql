-- Idempotency table for Stripe webhook events (DECISION-041 / DECISION-048)
-- Prevents double-processing on Stripe retries (e.g. handlePaymentFailed replaying
-- after user resolves payment, incorrectly re-marking subscription as past_due).
--
-- Pattern:
--   1. Check for stripe_event_id before processing.
--   2. Process the event.
--   3. Insert stripe_event_id only on success — failures leave the row absent so
--      Stripe's retry will re-attempt the event.

CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service-role-only access — no user can read or write this table directly.
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
-- (No policies added: the default-deny posture means only the service role,
-- used by the webhook handler via createAdminClient(), can access this table.)

-- Index is implicit on PRIMARY KEY; no additional indexes needed.

COMMENT ON TABLE public.processed_webhook_events IS
  'Idempotency log for Stripe webhook events. Prevents replay attacks and double-processing on retries.';
