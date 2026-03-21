-- Add onboarding completion flag to profiles.
-- Used to determine whether to redirect a user to /onboarding or /dashboard
-- on first login, and to allow resuming mid-flow.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
