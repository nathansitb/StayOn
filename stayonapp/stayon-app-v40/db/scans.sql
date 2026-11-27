-- StayOn — QR scan tracking (run once in the Supabase SQL editor)
-- One row each time a guest opens an apartment page, so the agency can see
-- scans → bookings → conversion. Inserts happen server-side (service role);
-- the agency reads only its own rows via RLS.

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid references apartments(id) on delete cascade,
  agency_id uuid references agencies(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists scans_agency_idx on scans(agency_id);
create index if not exists scans_apartment_idx on scans(apartment_id);

alter table scans enable row level security;
create policy agency_isolation_scans on scans
  using (agency_id = current_agency_id());
