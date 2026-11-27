-- =============================================================
-- StayOn — Agency space v2 (run ONCE in Supabase → SQL Editor)
-- Safe to run several times.
-- =============================================================

-- 0. Helper: the agency of the logged-in user (read from "profiles").
--    security definer = it can read profiles even with RLS on.
create or replace function public.current_agency_id() returns uuid
language sql stable security definer set search_path = public as $$
  select agency_id from public.profiles where id = auth.uid()
$$;

-- 1. Agency settings (one JSON document per agency)
create table if not exists agency_settings (
  agency_id  uuid primary key references agencies(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table agency_settings enable row level security;

drop policy if exists agency_settings_select on agency_settings;
drop policy if exists agency_settings_insert on agency_settings;
drop policy if exists agency_settings_update on agency_settings;
create policy agency_settings_select on agency_settings
  for select using (agency_id = current_agency_id());
create policy agency_settings_insert on agency_settings
  for insert with check (agency_id = current_agency_id());
create policy agency_settings_update on agency_settings
  for update using (agency_id = current_agency_id())
  with check (agency_id = current_agency_id());

-- 2. Bookings: guest e-mail, stay date, reference
alter table bookings add column if not exists guest_email text;
alter table bookings add column if not exists check_in date;
alter table bookings add column if not exists reference text;
create index if not exists bookings_agency_created_idx on bookings(agency_id, created_at desc);
create index if not exists bookings_guest_email_idx on bookings(agency_id, guest_email);

-- 3. Scans: make sure each agency can read its own scans
--    (fixes "Scans 0" if scans.sql stopped on the same error before)
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid references apartments(id) on delete cascade,
  agency_id uuid references agencies(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists scans_agency_idx on scans(agency_id);
create index if not exists scans_apartment_idx on scans(apartment_id);
alter table scans enable row level security;
drop policy if exists agency_isolation_scans on scans;
create policy agency_isolation_scans on scans
  for select using (agency_id = current_agency_id());
