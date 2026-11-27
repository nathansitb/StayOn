import { createClient } from "@/lib/supabase/server";
import { getAgencySettings } from "@/lib/agency-settings";
import {
  type BookingRow, FLOWS, FLOW_LABEL, bookingLabel, groupGuests, parsePeriod, inPeriod, toCsv,
} from "@/lib/agency-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/agency/export?kind=bookings|guests&period=30d[&type=&apt=&q=]
 * CSV export for the logged-in agency. Data is read with the user's session,
 * so Row Level Security guarantees an agency only ever exports its own rows.
 */
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") === "guests" ? "guests" : "bookings";
  const period = parsePeriod(url.searchParams.get("period") ?? undefined, "all");
  const type = FLOWS.find((f) => f === url.searchParams.get("type"));
  const aptId = url.searchParams.get("apt");
  const q = (url.searchParams.get("q") ?? "").toLowerCase();

  const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
  const [{ data: bookings }, { data: apts }, settings] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name, location"),
    getAgencySettings(supabase, profile?.agency_id ?? ""),
  ]);
  const apt = new Map((apts ?? []).map((a) => [a.id, a]));
  const rows = ((bookings ?? []) as BookingRow[]).filter(
    (b) =>
      inPeriod(b.created_at, period.since) &&
      (!type || b.flow === type) &&
      (!aptId || b.apartment_id === aptId) &&
      (!q || (b.guest_name ?? "").toLowerCase().includes(q) || (b.guest_email ?? "").toLowerCase().includes(q) || (b.reference ?? "").toLowerCase().includes(q))
  );

  let csv: string;
  if (kind === "guests") {
    csv = toCsv(
      ["Guest", "E-mail", "Bookings", "Total spent (EUR)", "Services", "Last apartment", "First booking", "Last booking"],
      groupGuests(rows).map((g) => [
        g.name, g.email ?? "", g.bookings, g.spent,
        [...g.flows].map((f) => FLOW_LABEL[f]).join(" + "),
        g.lastApartment ? apt.get(g.lastApartment)?.name ?? "" : "",
        g.first.slice(0, 10), g.last.slice(0, 10),
      ])
    );
  } else {
    csv = toCsv(
      ["Paid at", "Reference", "Guest", "E-mail", "Apartment", "Address", "Service", "For date", "Amount (EUR)", "Status"],
      rows.map((b) => [
        new Date(b.created_at).toISOString().replace("T", " ").slice(0, 16),
        b.reference ?? "", b.guest_name ?? "", b.guest_email ?? "",
        b.apartment_id ? apt.get(b.apartment_id)?.name ?? "" : "",
        b.apartment_id ? apt.get(b.apartment_id)?.location ?? "" : "",
        bookingLabel(b), b.check_in ?? "", b.amount, b.status ?? "confirmed",
      ])
    );
  }

  const company = settings.billing.companyName || settings.profile.displayName || "stayon";
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "stayon";
  const file = `${slug}-${kind}-${period.id}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "no-store",
    },
  });
}
