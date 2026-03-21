-- Add notification tracking columns to prevent duplicate threshold emails.
-- notified_120_day_at / notified_150_day_at: set when notification fires,
--   reset to NULL when user drops back below the threshold (handled in cron).
-- notified_monthly_summary_at: idempotency guard for monthly cron.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notified_120_day_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notified_150_day_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notified_monthly_summary_at timestamptz DEFAULT NULL;
