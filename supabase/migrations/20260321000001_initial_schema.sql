-- =============================================================
-- StayRight — Initial Schema
-- Migration: 20260321000001_initial_schema
-- =============================================================

-- ------------------------------------------------------------
-- PROFILES
-- One row per user. Created automatically on signup via trigger.
-- Extends auth.users with visa profile data and notification prefs.
-- ------------------------------------------------------------
create table public.profiles (
  id                           uuid primary key references auth.users(id) on delete cascade,
  full_name                    text,
  visa_route                   text not null default 'Skilled Worker',
  visa_start_date              date,
  -- Notification preferences (all on by default)
  notifications_120_day        boolean not null default true,
  notifications_150_day        boolean not null default true,
  notifications_monthly        boolean not null default true,
  notifications_ilr_reminder   boolean not null default true,
  notifications_return_reminder boolean not null default true,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

comment on table public.profiles is
  'User visa profile. One row per auth user. Created automatically on signup.';

-- ------------------------------------------------------------
-- TRIPS
-- One row per UK absence period.
-- departure_date = first day outside UK (day user left)
-- return_date    = day user returned to UK (null = currently abroad)
-- Absence days   = (return_date - departure_date) - 1
-- Multi-leg trips use first departure and final return — see DECISION-010.
-- Crown Dependencies (Jersey, Guernsey, Isle of Man) are stored here
-- but the calculation engine returns 0 absence days for them — DECISION-011.
-- ------------------------------------------------------------
create table public.trips (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  destination    text not null,
  departure_date date not null,
  return_date    date,          -- null = currently abroad
  notes          text,          -- optional: multi-leg destinations, travel reason
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint return_after_departure
    check (return_date is null or return_date >= departure_date)
);

comment on table public.trips is
  'One row per UK absence period. Calculations always derived on read — never stored.';
comment on column public.trips.return_date is
  'Null means user is currently abroad.';
comment on column public.trips.notes is
  'Free text. Use for multi-leg destination details or travel reason.';

-- Index for the most common query: all trips for a user ordered by date
create index trips_user_id_departure_date_idx
  on public.trips (user_id, departure_date desc);

-- Index for finding currently-abroad trips (return_date is null)
create index trips_user_id_return_date_idx
  on public.trips (user_id, return_date)
  where return_date is null;

-- ------------------------------------------------------------
-- SUBSCRIPTIONS
-- One row per user. Created with plan='free' on signup via trigger.
-- Updated via Stripe webhooks only (service role) — never by users directly.
-- ------------------------------------------------------------
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  plan                   text not null default 'free'
                           check (plan in ('free', 'pro_monthly', 'pro_annual', 'pro_lifetime')),
  status                 text not null default 'active'
                           check (status in ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_end     timestamptz,   -- null for free and lifetime plans
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is
  'One row per user. Managed by Stripe webhooks via service role only.';
comment on column public.subscriptions.current_period_end is
  'Null for free tier and lifetime plans. Pro features stay active until this date on cancellation.';

-- Indexes for Stripe webhook lookups
create index subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create index subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ------------------------------------------------------------
-- TRIGGER: updated_at
-- Automatically sets updated_at = now() on any row update.
-- ------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.handle_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- TRIGGER: new user signup
-- Automatically creates a profile row and a free subscription row
-- when a new user signs up via Supabase Auth.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );

  insert into public.subscriptions (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- All tables are locked down. Users can only access their own rows.
-- Subscriptions are readable by the user but only writable via
-- service role (Stripe webhooks).
-- ------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.trips         enable row level security;
alter table public.subscriptions enable row level security;

-- profiles: user can read and update their own profile
create policy "profiles: owner read"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: owner update"
  on public.profiles for update
  using (id = auth.uid());

-- trips: user has full CRUD on their own trips
create policy "trips: owner select"
  on public.trips for select
  using (user_id = auth.uid());

create policy "trips: owner insert"
  on public.trips for insert
  with check (user_id = auth.uid());

create policy "trips: owner update"
  on public.trips for update
  using (user_id = auth.uid());

create policy "trips: owner delete"
  on public.trips for delete
  using (user_id = auth.uid());

-- subscriptions: user can read their own subscription
-- writes are service-role only (Stripe webhooks bypass RLS)
create policy "subscriptions: owner read"
  on public.subscriptions for select
  using (user_id = auth.uid());
