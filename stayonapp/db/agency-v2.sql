-- =============================================================
-- StayOn — Agency space v2 (run ONCE in Supabase → SQL Editor)
-- =============================================================
-- 1. agency_settings : every customisation option of the agency
--    (profile, guest page, services & default prices, notifications,
--    billing details, notification read marker). Stored as one JSON
--    document per agency, so new options never need a new migration.
-- 2. bookings : keep the guest e-mail, the stay date and the booking
--    reference, so the Guests / Revenue tabs and exports are complete.
-- Safe to run twice.
-- =============================================================

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

alter table bookings add column if not exists guest_email text;
alter table bookings add column if not exists check_in date;
alter table bookings add column if not exists reference text;

create index if not exists bookings_agency_created_idx on bookings(agency_id, created_at desc);
create index if not exists bookings_guest_email_idx on bookings(agency_id, guest_email);
