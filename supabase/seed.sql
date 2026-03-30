-- E2E test user seed
-- Creates a verified Supabase user + profile for Playwright smoke tests.
-- Idempotent: safe to run multiple times.
--
-- Usage (CI):
--   psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
--
-- Usage (local reset):
--   supabase db reset   (runs migrations + this seed automatically)

DO $$
DECLARE
  v_user_id  uuid;
  v_email    text := 'testuser@stayright.test';
  v_password text := 'TestPassword123!';
BEGIN
  -- Resolve existing user (idempotent re-runs)
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
    -- Ensure email is confirmed for existing user
    UPDATE auth.users
       SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
           updated_at = now()
     WHERE id = v_user_id;
  END IF;

  -- Upsert profile — marks onboarding complete so the user lands on /dashboard
  INSERT INTO public.profiles (
    id, first_name, visa_start_date, onboarding_completed
  ) VALUES (
    v_user_id, 'Test', '2023-01-14', true
  )
  ON CONFLICT (id) DO UPDATE
    SET onboarding_completed = true,
        visa_start_date      = EXCLUDED.visa_start_date,
        first_name           = EXCLUDED.first_name;

END $$;
