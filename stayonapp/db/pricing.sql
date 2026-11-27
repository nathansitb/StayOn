-- StayOn — per-apartment late checkout & cleaning prices
-- (run once in the Supabase SQL editor)
--
-- Stored as JSON maps so each agency sets its own prices per tier:
--   late_prices:     { "12:00": 15, "13:00": 25, "14:00": 35, "16:00": 55 }
--   cleaning_prices: { "refresh": 29, "full": 49, "linen": 19 }
-- When empty, the app falls back to the default prices.

alter table apartments add column if not exists late_prices jsonb;
alter table apartments add column if not exists cleaning_prices jsonb;
