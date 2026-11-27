-- StayOn — apartment geolocation (run once in the Supabase SQL editor)
-- Adds coordinates so we can suggest the nearest available apartments when
-- a booking is unavailable.

alter table apartments add column if not exists lat double precision;
alter table apartments add column if not exists lng double precision;
