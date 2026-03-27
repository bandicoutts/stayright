-- =============================================================
-- StayRight — Create Pro Dummy Account (Manual ID Verification)
-- If the previous script didn't show the user, use this
-- two-step process to confirm creation.
-- =============================================================

-- STEP 1: Insert into auth.users and SEE the user id
-- Run this block first and COPY the ID returned.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dummy-pro@stayright.uk',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dummy Pro User"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO UPDATE SET updated_at = now() -- Forces it to show the ID if already exists
RETURNING id;

-- STEP 2: Upgrade to Pro
-- Copy the ID from the result above and paste it below.
-- (Or just use this subquery)
UPDATE public.subscriptions
SET
  plan = 'pro_lifetime',
  status = 'active'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dummy-pro@stayright.uk');
