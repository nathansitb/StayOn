# StayOn — beta

**Extend the moment. In style.**

A guest scans a QR code in their apartment / hotel / short-let and can, in a
few taps: extend one or more nights, request a late checkout, pay, and get an
instant confirmation. Includes a marketing site, an agency dashboard, and a
host onboarding space — all connected by a shared, persisted store.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Mobile-first,
bilingual (EN/FR), premium black / cream / gold design.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Routes

- `/` — **Landing / pitch**: hero, how it works, guest benefits, host & agency
  benefits, testimonials, pricing (Free / Premium €19), CTAs.
- `/stay` — **Guest experience** (phone frame): scan → stay one or more nights
  (nights stepper) / late checkout / **housekeeping** (service tier + time slot)
  → summary → payment → confirmation → manage booking. An "Availability" switch
  previews the sold-out fallback.
- `/dashboard` — **Agency dashboard**: Overview · Bookings (live) · Apartments ·
  Guests · Revenue · Notifications · Settings.
- `/host` — **Host onboarding**: 5-step wizard (account → listing → pricing &
  rules → QR plaque with SVG download → plan) then go live.

Use the **EN / FR** toggle anywhere; the **Guest / Agency** switch is in the
top bar of `/stay` and `/dashboard`.

## It all connects (real behaviour, simulated data)

A single shared store (`lib/appStore.tsx`, persisted to `localStorage`) links
the three surfaces:

- Pay for an extension in the **guest flow** → it appears instantly in the
  dashboard **Bookings**, updates **Guests**, and raises a **Notification**.
- Complete **host onboarding** → the new apartment shows up in the dashboard
  **Apartments** list, with its own QR.
- Toggle extra-night / late-checkout on an apartment, switch plan, or reset the
  demo — all live.

## Deploy

Push to a Git repo and import it on [Vercel](https://vercel.com/new) — zero
config. Or `npm run build && npm start`.

## Project structure

```
app/
  layout.tsx            fonts + Lang & App providers
  page.tsx             landing / pitch
  stay/page.tsx        guest experience
  dashboard/page.tsx   agency dashboard
  host/page.tsx        host onboarding
components/
  landing/   LandingNav, Landing
  guest/     Welcome, StayNight, LateCheckout, Summary, Payment,
             Confirmation, ManageBooking, Unavailable, PhoneFrame, GuestFlow
  dashboard/ Overview, Bookings, Apartments, Clients, Revenue,
             Notifications, Settings, Integrations, Dashboard
  host/      HostOnboarding
  ui/        TopBar, Footer, Qr
lib/
  data.ts          apartments, late options, nearby stays, KPIs, integrations
  content.ts       bilingual marketing content (from the advantage sheets)
  i18n.ts          EN/FR UI strings + formatting
  store.tsx        language context (useLang)
  appStore.tsx     shared app state: bookings, apartments, host, notifications
  integrations.ts  STUBBED backend calls — swap for real APIs
  time.ts / types.ts
```

## Wiring it to real services later

`lib/integrations.ts` is the single seam. Every function returns mocked data
today but keeps the signature a real backend would expose:

- `checkAvailability()` — iCal / PMS / Guesty / Hostaway / Smoobu
- `createBooking()` — your booking engine
- `processPayment()` — Stripe PaymentIntents (Apple Pay / Google Pay / card)
- `findNearbyStays()` — inventory search

Replace the bodies and the UI keeps working unchanged.

---

© StayOn — beta demo. Simulated data.
