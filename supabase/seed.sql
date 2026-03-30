-- E2E test user seed
-- Creates verified Supabase users + profiles for Playwright tests.
-- Idempotent: safe to run multiple times.
--
-- Users seeded:
--   1. testuser@stayright.test / TestPassword123!      — smoke suite
--   2. e2e-free@stayright.test / TestFree123!          — full suite, free plan, 10 trips
--   3. e2e-pro@stayright.test  / TestPro123!           — full suite, pro_lifetime plan
--
-- Usage (CI):
--   psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
--
-- Usage (local reset):
--   supabase db reset   (runs migrations + this seed automatically)

-- ---------------------------------------------------------------------------
-- Helper: create a single verified user (idempotent)
-- Returns the user's UUID in v_id.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id  uuid;
  v_email    text := 'testuser@stayright.test';
  v_password text := 'TestPassword123!';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id,
      email, encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      'authenticated', 'authenticated',
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id,
      identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      v_email,
      jsonb_build_object(
        'sub',            v_user_id::text,
        'email',          v_email,
        'email_verified', true,
        'provider_id',    v_email
      ),
      'email',
      now(), now(), now()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;

  ELSE
    UPDATE auth.users
       SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
           updated_at = now()
     WHERE id = v_user_id;
  END IF;

  UPDATE public.profiles
     SET first_name           = 'Test',
         visa_start_date      = '2023-01-14',
         onboarding_completed = true
   WHERE id = v_user_id;

END $$;

-- ---------------------------------------------------------------------------
-- Free E2E user (full suite)
-- plan = free, 10 trips pre-seeded to trigger paywall
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id  uuid;
  v_email    text := 'e2e-free@stayright.test';
  v_password text := 'TestFree123!';
  v_trip_count int;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id,
      email, encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      'authenticated', 'authenticated',
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id,
      identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      v_email,
      jsonb_build_object(
        'sub',            v_user_id::text,
        'email',          v_email,
        'email_verified', true,
        'provider_id',    v_email
      ),
      'email',
      now(), now(), now()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;

  ELSE
    UPDATE auth.users
       SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
           updated_at = now()
     WHERE id = v_user_id;
  END IF;

  UPDATE public.profiles
     SET first_name           = 'Free',
         visa_start_date      = '2021-06-01',
         onboarding_completed = true
   WHERE id = v_user_id;

  -- Subscription stays free (trigger default = 'free', status = 'active')

  -- Seed 10 trips so the paywall triggers immediately on the plan modal.
  -- Only insert if not already seeded (check total count for this user).
  SELECT COUNT(*) INTO v_trip_count FROM public.trips WHERE user_id = v_user_id;

  IF v_trip_count < 10 THEN
    INSERT INTO public.trips (user_id, destination, departure_date, return_date)
    VALUES
      (v_user_id, 'France',      '2022-03-01', '2022-03-08'),
      (v_user_id, 'Germany',     '2022-05-10', '2022-05-17'),
      (v_user_id, 'Spain',       '2022-07-20', '2022-07-27'),
      (v_user_id, 'Italy',       '2022-09-05', '2022-09-12'),
      (v_user_id, 'Portugal',    '2022-11-14', '2022-11-21'),
      (v_user_id, 'Netherlands', '2023-01-09', '2023-01-16'),
      (v_user_id, 'Greece',      '2023-03-20', '2023-03-27'),
      (v_user_id, 'Austria',     '2023-05-08', '2023-05-15'),
      (v_user_id, 'Belgium',     '2023-07-17', '2023-07-24'),
      (v_user_id, 'Poland',      '2023-09-04', '2023-09-11');
  END IF;

END $$;

-- ---------------------------------------------------------------------------
-- Pro E2E user (full suite)
-- plan = pro_lifetime, status = active
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id  uuid;
  v_email    text := 'e2e-pro@stayright.test';
  v_password text := 'TestPro123!';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id,
      email, encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      'authenticated', 'authenticated',
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id,
      identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      v_email,
      jsonb_build_object(
        'sub',            v_user_id::text,
        'email',          v_email,
        'email_verified', true,
        'provider_id',    v_email
      ),
      'email',
      now(), now(), now()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;

  ELSE
    UPDATE auth.users
       SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
           updated_at = now()
     WHERE id = v_user_id;
  END IF;

  UPDATE public.profiles
     SET first_name           = 'Pro',
         visa_start_date      = '2021-06-01',
         onboarding_completed = true
   WHERE id = v_user_id;

  -- Upgrade subscription to pro_lifetime
  UPDATE public.subscriptions
     SET plan   = 'pro_lifetime',
         status = 'active',
         updated_at = now()
   WHERE user_id = v_user_id;

  -- Seed a couple of trips so the reports page has data to export
  IF NOT EXISTS (SELECT 1 FROM public.trips WHERE user_id = v_user_id LIMIT 1) THEN
    INSERT INTO public.trips (user_id, destination, departure_date, return_date)
    VALUES
      (v_user_id, 'Japan',     '2023-04-01', '2023-04-14'),
      (v_user_id, 'Australia', '2023-10-10', '2023-10-24');
  END IF;

END $$;
