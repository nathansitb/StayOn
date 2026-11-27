-- StayOn — database schema (Supabase / Postgres) — Phase 0 foundation
-- Run this in Supabase → SQL Editor once the project is created.
-- Multi-tenant: every row belongs to an agency; Row Level Security isolates them.

create extension if not exists "pgcrypto";

-- Agencies (tenants)
create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free','premium')),
  created_at timestamptz not null default now()
);

-- Members of an agency (linked to Supabase Auth users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

-- Apartments
create table if not exists apartments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  name text not null,
  location text,
  image_url text,
  extend_price integer not null default 0,
  extra_night boolean not null default true,
  late_checkout boolean not null default true,
  cleaning boolean not null default false,
  ical_url text,                       -- Phase 1: availability feed
  guesty_listing_id text,              -- Phase 3: link to a Guesty listing
  created_at timestamptz not null default now()
);

-- Integration credentials (per agency) — secrets encrypted at rest
create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  kind text not null check (kind in ('stripe','guesty','ical')),
  -- store secrets encrypted (e.g. pgcrypto or Supabase Vault); never plaintext
  encrypted_credentials bytea,
  status text not null default 'connected',
  created_at timestamptz not null default now(),
  unique (agency_id, kind)
);

-- Availability cache (populated from iCal / Guesty)
create table if not exists availability (
  apartment_id uuid not null references apartments(id) on delete cascade,
  night date not null,
  blocked boolean not null default true,
  synced_at timestamptz not null default now(),
  primary key (apartment_id, night)
);

-- Bookings created through StayOn
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  apartment_id uuid references apartments(id) on delete set null,
  guest_name text,
  flow text not null check (flow in ('night','late','cleaning')),
  nights integer not null default 0,
  late_time text,
  cleaning_slot text,
  amount integer not null,
  currency text not null default 'EUR',
  stripe_payment_id text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- Row Level Security (each agency sees only its own rows)
alter table agencies enable row level security;
alter table users enable row level security;
alter table apartments enable row level security;
alter table integration_connections enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;

-- Helper: the agency of the current auth user
create or replace function current_agency_id() returns uuid
language sql stable as $$
  select agency_id from users where id = auth.uid()
$$;

create policy agency_isolation_apartments on apartments
  using (agency_id = current_agency_id());
create policy agency_isolation_bookings on bookings
  using (agency_id = current_agency_id());
create policy agency_isolation_integrations on integration_connections
  using (agency_id = current_agency_id());
-- (repeat similar policies for the remaining tables as needed)
