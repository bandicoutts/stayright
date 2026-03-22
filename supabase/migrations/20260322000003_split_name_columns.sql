-- =============================================================
-- StayRight — Split full_name into first_name + last_name
-- Migration: 20260322000003_split_name_columns
-- See: DECISION-033
-- =============================================================
-- Rationale: collecting a last name at onboarding adds friction
-- at the highest-anxiety moment. Last name is only required for
-- PDF generation (ILR documents) — the point of highest motivation.
-- first_name is required (NOT NULL); last_name is nullable.
-- =============================================================

-- Step 1: add new columns as nullable so existing rows are valid
ALTER TABLE public.profiles
  ADD COLUMN first_name text,
  ADD COLUMN last_name  text;

-- Step 2: populate from existing full_name
--   "David Coutts" → first_name = 'David',  last_name = 'Coutts'
--   "David"        → first_name = 'David',  last_name = NULL
--   NULL           → first_name = '',        last_name = NULL
UPDATE public.profiles
SET
  first_name = COALESCE(
    CASE
      WHEN full_name LIKE '% %' THEN split_part(full_name, ' ', 1)
      ELSE full_name
    END,
    ''
  ),
  last_name = CASE
    WHEN full_name LIKE '% %'
      THEN substring(full_name FROM position(' ' IN full_name) + 1)
    ELSE NULL
  END;

-- Step 3: now that data is populated, enforce NOT NULL + default on first_name
ALTER TABLE public.profiles
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN first_name SET DEFAULT '';

-- Step 4: drop the old column
ALTER TABLE public.profiles
  DROP COLUMN full_name;

-- Step 5: update the signup trigger to populate first_name / last_name
--   Handles both email/password signups (no raw_user_meta_data name) and
--   OAuth signups (Google sends 'full_name' or 'name' in raw_user_meta_data).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _full text;
BEGIN
  -- Prefer full_name, fall back to name (some OAuth providers use 'name')
  _full := COALESCE(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    ''
  );

  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    -- first_name: text before the first space, or the whole string
    CASE
      WHEN _full LIKE '% %' THEN split_part(_full, ' ', 1)
      ELSE _full
    END,
    -- last_name: text after the first space, or NULL
    CASE
      WHEN _full LIKE '% %'
        THEN substring(_full FROM position(' ' IN _full) + 1)
      ELSE NULL
    END
  );

  INSERT INTO public.subscriptions (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$;

-- Add column comments
COMMENT ON COLUMN public.profiles.first_name IS
  'Required. Collected at onboarding. Used in dashboard greeting.';
COMMENT ON COLUMN public.profiles.last_name IS
  'Optional. Collected in Settings or at PDF generation. Used in PDF header.';
