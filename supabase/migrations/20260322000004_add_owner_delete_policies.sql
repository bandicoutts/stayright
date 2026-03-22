-- =============================================================
-- Migration: 20260322000004_add_owner_delete_policies
-- =============================================================
-- Adds DELETE RLS policies for profiles and subscriptions so that
-- deleteAccountAction() (which uses the anon-key client) can
-- explicitly delete these rows before the auth user is removed.
--
-- Without these policies, the explicit deletes in deleteAccountAction
-- silently fail (RLS returns success with 0 rows affected).
-- ON DELETE CASCADE on the auth.users FK is the safety net, but
-- explicit policies make the code work as intended and are clearer.
-- =============================================================

create policy "profiles: owner delete"
  on public.profiles for delete
  using (id = auth.uid());

create policy "subscriptions: owner delete"
  on public.subscriptions for delete
  using (user_id = auth.uid());
