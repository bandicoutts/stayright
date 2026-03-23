-- Fix: update handle_new_user trigger to use first_name/last_name columns
-- (idempotent — safe to re-run)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _full text;
BEGIN
  _full := COALESCE(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    ''
  );

  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    CASE
      WHEN _full LIKE '% %' THEN split_part(_full, ' ', 1)
      ELSE _full
    END,
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
