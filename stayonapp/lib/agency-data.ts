/**
 * Shared data helpers for the agency space (overview, revenue, guests,
 * notifications, exports). Pure functions over the rows read with RLS.
 */

export interface BookingRow {
  id: string;
  guest_name: string | null;
  guest_email?: string | null;
  flow: "night" | "late" | "cleaning";
  nights: number;
  late_time: string | null;
  cleaning_slot: string | null;
  amount: number;
  created_at: string;
  check_in?: string | null;
  reference?: string | null;
  apartment_id: string | null;
  status?: string | null;
}

export interface AptRow {
  id: string;
  name: string;
  location: string | null;
  image_url: string | null;
  ical_url: string | null;
  guesty_listing_id?: string | null;
  lat?: number | null;
  lng?: number | null;
  created_at: string;
}

export interface ScanRow {
  apartment_id: string | null;
  created_at: string;
}

export const FLOWS = ["night", "late", "cleaning"] as const;
export type Flow = (typeof FLOWS)[number];

export const FLOW_LABEL: Record<Flow, string> = {
  night: "Extra nights",
  late: "Late checkouts",
  cleaning: "Cleanings",
};

export const eur = (n: number) => "€" + Math.round(n).toLocaleString("en-US");
export const pct = (n: number) => `${n.toFixed(1)}%`;

export function bookingLabel(b: Pick<BookingRow, "flow" | "nights" | "late_time" | "cleaning_slot">): string {
  if (b.flow === "night") return `Extra night ×${b.nights || 1}`;
  if (b.flow === "late") return `Late checkout ${b.late_time ?? ""}`.trim();
  return `Cleaning ${b.cleaning_slot ?? ""}`.trim();
}

/** Reporting periods used across tabs (`?period=`). */
export const PERIODS = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "12m", label: "12 months", days: 365 },
  { id: "all", label: "All time", days: 0 },
] as const;
export type PeriodId = (typeof PERIODS)[number]["id"];

export function parsePeriod(v: string | undefined, fallback: PeriodId = "30d") {
  const p = PERIODS.find((x) => x.id === v) ?? PERIODS.find((x) => x.id === fallback)!;
  const since = p.days ? new Date(Date.now() - p.days * 86_400_000) : null;
  return { ...p, since };
}

export const inPeriod = (iso: string, since: Date | null) => !since || new Date(iso) >= since;

export function startOfMonth(d = new Date(), offset = 0) {
  return new Date(d.getFullYear(), d.getMonth() + offset, 1);
}

/** % change, or null when there is nothing to compare with. */
export function delta(now: number, before: number): number | null {
  if (!before) return null;
  return ((now - before) / before) * 100;
}

export function sum(rows: { amount: number }[]) {
  return rows.reduce((s, b) => s + (b.amount ?? 0), 0);
}

/** Group bookings into guests (by e-mail when we have it, otherwise by name). */
export interface GuestAgg {
  key: string;
  name: string;
  email: string | null;
  bookings: number;
  spent: number;
  flows: Set<Flow>;
  apartments: Set<string>;
  first: string;
  last: string;
  lastApartment: string | null;
}

export function groupGuests(rows: BookingRow[]): GuestAgg[] {
  const map = new Map<string, GuestAgg>();
  // Rows of one payment share the stripe id prefix: count them as one visit.
  for (const b of rows) {
    const email = (b.guest_email || "").trim().toLowerCase() || null;
    const name = (b.guest_name || "").trim() || "Guest";
    const key = email ?? `name:${name.toLowerCase()}`;
    let g = map.get(key);
    if (!g) {
      g = { key, name, email, bookings: 0, spent: 0, flows: new Set(), apartments: new Set(), first: b.created_at, last: b.created_at, lastApartment: b.apartment_id };
      map.set(key, g);
    }
    g.bookings += 1;
    g.spent += b.amount ?? 0;
    g.flows.add(b.flow);
    if (b.apartment_id) g.apartments.add(b.apartment_id);
    if (b.created_at < g.first) g.first = b.created_at;
    if (b.created_at > g.last) {
      g.last = b.created_at;
      g.lastApartment = b.apartment_id;
    }
    if (name !== "Guest" && (g.name === "Guest" || g.name.includes("@"))) g.name = name;
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}

/** Last 12 calendar months, oldest first, with revenue per service. */
export function monthlySeries(rows: BookingRow[], months = 12) {
  const now = new Date();
  const out = Array.from({ length: months }, (_, i) => {
    const d = startOfMonth(now, i - (months - 1));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-US", { month: "short" }), night: 0, late: 0, cleaning: 0, total: 0 };
  });
  const idx = new Map(out.map((m, i) => [m.key, i]));
  for (const b of rows) {
    const d = new Date(b.created_at);
    const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i === undefined) continue;
    out[i][b.flow] += b.amount ?? 0;
    out[i].total += b.amount ?? 0;
  }
  return out;
}

/** CSV with a BOM so Excel opens accents correctly. */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
