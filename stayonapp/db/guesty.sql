-- =============================================================
-- StayOn — Guesty connection (run once in the Supabase SQL editor)
-- =============================================================
-- Stores each agency's Guesty API credentials so StayOn can read
-- availability and block a night after payment.
--
-- Security: this table has RLS enabled with NO policies, so it is
-- unreachable from the browser (anon/authenticated keys). Only the
-- server (service-role key) can read/write it. For extra hardening
-- you can later encrypt client_secret with pgcrypto / Supabase Vault.
-- =============================================================

create table if not exists guesty_credentials (
  agency_id     uuid primary key references agencies(id) on delete cascade,
  client_id     text not null,
  client_secret text not null,
  status        text not null default 'connected',
  connected_at  timestamptz not null default now()
);

alter table guesty_credentials enable row level security;
-- No policies on purpose → only the service-role (server) can touch it.

-- Availability cache already exists (table "availability"); the Guesty
-- webhook refreshes it. Nothing else to create.
