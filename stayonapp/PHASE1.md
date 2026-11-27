# StayOn — Phase 1 (real integrations)

This build adds **real** iCal availability and a **real** Guesty API client,
wired into a backend. No fake data on these paths.

## What's live right now (no account needed)

### iCal availability — works immediately
- `lib/ical.ts` — fetches a listing's `.ics` feed and computes free/blocked nights
  (verified: checkout day counts as free, folded lines handled).
- `app/api/availability/route.ts` — `GET /api/availability?url=<ics>&night=YYYY-MM-DD`
  reads the calendar **server-side** (no CORS issues) and returns availability.
- Dashboard → **Connections** tab → *iCal*: paste any Airbnb/Booking/Guesty `.ics`
  link, click **Test availability**. Click **Use in guest demo** and the guest
  flow's "Stay one more night" will do a **real** availability check against
  that calendar (it routes to the "no longer available" screen if the night is
  booked).

How a host gets the link: Airbnb → *Edit listing → Availability → Sync calendars
→ Export calendar* → copy the URL ending in `.ics`.

### Guesty client — real code, needs the agency's keys
- `lib/guesty.ts` — OAuth2 `client_credentials` token, list listings, read a
  listing's availability calendar.
- `app/api/guesty/connect/route.ts` — `POST { clientId, clientSecret }` validates
  the credentials against Guesty and returns the real listings.
- Dashboard → **Connections** tab → *Guesty*: paste the Client ID + Secret an
  agency generates in its Guesty account (*Integrations → API & Webhooks*).
  No partner application needed for this — see the plan doc.

## What still needs setup to persist (Phase 0)

Today the iCal URL and demo state live in the browser. To store agencies,
apartments, credentials (encrypted) and bookings for real, add Supabase:

1. Create a free project on supabase.com.
2. SQL Editor → paste `db/schema.sql` → Run.
3. Add these env vars in Vercel (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
4. Then the connect flows save credentials per agency instead of per browser.

The app builds and runs **without** these env vars — the integration engine
works; only long-term persistence waits on Supabase.

## Try it in 60 seconds after deploy
1. Open `/dashboard` → **Connections**.
2. Paste a real Airbnb `.ics` link → **Test availability**.
3. **Use in guest demo** → open `/stay` → **Stay one more night** → it checks the
   real calendar before showing the offer.
