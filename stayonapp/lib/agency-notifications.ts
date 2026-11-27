import type { AgencySettings } from "./agency-settings";
import { type AptRow, type BookingRow, type ScanRow, bookingLabel, eur } from "./agency-data";

/**
 * The Notifications tab is computed from real data on every visit:
 *  - activity : every paid booking + revenue milestones
 *  - alerts   : set-up problems that cost sales (no calendar, no photo, a
 *               plaque nobody scans, lots of scans but no sales…)
 * "Unread" = activity newer than settings.notificationsSeenAt.
 */

export interface Activity {
  id: string;
  at: string;
  title: string;
  body: string;
  kind: "booking" | "milestone";
  amount?: number;
}

export interface Alert {
  id: string;
  level: "action" | "tip";
  title: string;
  body: string;
  items?: string[];
  href: string;
  cta: string;
}

const DAY = 86_400_000;
const MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

export function buildActivity(bookings: BookingRow[], aptName: Map<string, string>): Activity[] {
  const out: Activity[] = bookings.slice(0, 80).map((b) => ({
    id: `b-${b.id}`,
    at: b.created_at,
    kind: "booking",
    amount: b.amount,
    title: `New booking · ${eur(b.amount)}`,
    body: `${b.guest_name || "A guest"} paid for ${bookingLabel(b).toLowerCase()} at ${
      b.apartment_id ? aptName.get(b.apartment_id) ?? "an apartment" : "an apartment"
    }.`,
  }));
  // Revenue milestones, in chronological order.
  let total = 0, m = 0;
  for (const b of [...bookings].sort((x, y) => x.created_at.localeCompare(y.created_at))) {
    total += b.amount ?? 0;
    while (m < MILESTONES.length && total >= MILESTONES[m]) {
      out.push({ id: `m-${MILESTONES[m]}`, at: b.created_at, kind: "milestone", title: `Milestone · ${eur(MILESTONES[m])} earned`, body: `Your apartments have now generated ${eur(MILESTONES[m])} through StayOn.` });
      m++;
    }
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

export function buildAlerts(apts: AptRow[], bookings: BookingRow[], scans: ScanRow[], s: AgencySettings): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();
  if (apts.length === 0) {
    alerts.push({ id: "no-apt", level: "action", title: "Add your first apartment", body: "Each apartment gets its own QR plaque. Nothing is sold until one is in a room.", href: "/agency/apartments", cta: "Add an apartment" });
    return alerts;
  }
  if (!s.notifications.setupAlerts) return alerts;

  const names = (rows: AptRow[]) => rows.map((a) => a.name);
  const noCal = apts.filter((a) => !a.ical_url && !a.guesty_listing_id);
  if (noCal.length)
    alerts.push({ id: "no-cal", level: "action", title: `${noCal.length} apartment${noCal.length > 1 ? "s have" : " has"} no calendar`, body: "Without a calendar, StayOn cannot check that a night is free before selling it. Connect Guesty or paste the iCal link.", items: names(noCal), href: "/agency/connections", cta: "Connect a calendar" });

  const noLoc = apts.filter((a) => a.lat == null || a.lng == null);
  if (noLoc.length && s.guest.showNearby)
    alerts.push({ id: "no-loc", level: "action", title: `${noLoc.length} apartment${noLoc.length > 1 ? "s are" : " is"} not located`, body: "When a night is taken, guests are offered your nearest free apartment — only if the address is located.", items: names(noLoc), href: "/agency/apartments", cta: "Locate them" });

  const recent14 = new Set(scans.filter((x) => now - new Date(x.created_at).getTime() < 14 * DAY).map((x) => x.apartment_id));
  const silent = apts.filter((a) => now - new Date(a.created_at).getTime() > 14 * DAY && !recent14.has(a.id));
  if (silent.length)
    alerts.push({ id: "silent", level: "action", title: `${silent.length} plaque${silent.length > 1 ? "s" : ""} not scanned in 14 days`, body: "Check the plaque is in the apartment and clearly visible (bedside table or entrance).", items: names(silent), href: "/agency/apartments", cta: "See the plaques" });

  const scans30 = new Map<string, number>(), books30 = new Map<string, number>();
  scans.filter((x) => now - new Date(x.created_at).getTime() < 30 * DAY).forEach((x) => x.apartment_id && scans30.set(x.apartment_id, (scans30.get(x.apartment_id) ?? 0) + 1));
  bookings.filter((x) => now - new Date(x.created_at).getTime() < 30 * DAY).forEach((x) => x.apartment_id && books30.set(x.apartment_id, (books30.get(x.apartment_id) ?? 0) + 1));
  const noSale = apts.filter((a) => (scans30.get(a.id) ?? 0) >= 10 && !books30.get(a.id));
  if (noSale.length)
    alerts.push({ id: "no-sale", level: "tip", title: "Scanned a lot, nothing sold", body: "These apartments had 10+ scans in 30 days but no booking. Try a lower late-checkout price or enable cleaning.", items: names(noSale), href: "/agency/apartments", cta: "Review prices" });

  const noPhoto = apts.filter((a) => !a.image_url);
  if (noPhoto.length)
    alerts.push({ id: "no-photo", level: "tip", title: `${noPhoto.length} apartment${noPhoto.length > 1 ? "s have" : " has"} no photo`, body: "Guests see a generic photo instead of their apartment. A real photo builds trust before paying.", items: names(noPhoto), href: "/agency/apartments", cta: "Add photos" });

  if (s.guest.showContact && !s.profile.contactPhone && !s.profile.contactEmail)
    alerts.push({ id: "no-contact", level: "tip", title: "No contact shown to guests", body: "Add a phone or an e-mail so guests can reach you from the confirmation screen.", href: "/agency/settings?tab=profile", cta: "Add a contact" });

  return alerts;
}

export function unreadCount(activity: Activity[], seenAt: string | null): number {
  // Only bookings count as "new" (milestones are shown but never badge).
  return activity.filter((a) => a.kind === "booking" && (!seenAt || a.at > seenAt)).length;
}
