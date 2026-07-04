import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import {
  AdminConsole,
  type AgencyRow,
  type ApartmentRow,
  type BookingRow,
} from "@/components/admin/AdminConsole";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin") redirect("/agency");

  const admin = createAdminClient();
  const [agenciesRes, apartmentsRes, bookingsRes] = await Promise.all([
    admin.from("agencies").select("id, name, plan, created_at").order("created_at", { ascending: false }),
    admin.from("apartments").select("id, public_code, name, location, extend_price, ical_url, agency_id"),
    admin.from("bookings").select("id, guest_name, flow, nights, late_time, cleaning_slot, amount, created_at, apartment_id, agency_id").order("created_at", { ascending: false }),
  ]);

  const rawAgencies = agenciesRes.data ?? [];
  const rawApts = apartmentsRes.data ?? [];
  const rawBookings = bookingsRes.data ?? [];

  const agencyName = new Map(rawAgencies.map((a) => [a.id, a.name]));
  const aptName = new Map(rawApts.map((a) => [a.id, a.name]));

  const revenueByAgency = new Map<string, number>();
  for (const b of rawBookings) {
    revenueByAgency.set(b.agency_id, (revenueByAgency.get(b.agency_id) ?? 0) + (b.amount ?? 0));
  }
  const aptCountByAgency = new Map<string, number>();
  for (const a of rawApts) {
    aptCountByAgency.set(a.agency_id, (aptCountByAgency.get(a.agency_id) ?? 0) + 1);
  }

  const agencies: AgencyRow[] = rawAgencies.map((a) => ({
    id: a.id,
    name: a.name,
    plan: a.plan,
    created_at: a.created_at,
    apartmentCount: aptCountByAgency.get(a.id) ?? 0,
    revenue: revenueByAgency.get(a.id) ?? 0,
  }));

  const apartments: ApartmentRow[] = rawApts.map((a) => ({
    id: a.id,
    public_code: a.public_code,
    name: a.name,
    location: a.location,
    extend_price: a.extend_price,
    ical_url: a.ical_url,
    agencyName: agencyName.get(a.agency_id) ?? "—",
  }));

  const bookings: BookingRow[] = rawBookings.map((b) => ({
    id: b.id,
    guest_name: b.guest_name,
    flow: b.flow,
    nights: b.nights,
    late_time: b.late_time,
    cleaning_slot: b.cleaning_slot,
    amount: b.amount,
    created_at: b.created_at,
    apartmentName: b.apartment_id ? aptName.get(b.apartment_id) ?? "—" : "—",
    agencyName: agencyName.get(b.agency_id) ?? "—",
  }));

  const totalRevenue = rawBookings.reduce((s, b) => s + (b.amount ?? 0), 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-[1180px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-cream">
            <Logo size={22} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[11px] uppercase tracking-[1.5px] text-gold">Super admin</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-12">
        <h1 className="font-serif text-[34px] font-semibold">Platform console</h1>
        <p className="text-muted text-[14px] mt-2">
          Every agency, apartment and booking across StayOn.
        </p>

        <AdminConsole
          agencies={agencies}
          apartments={apartments}
          bookings={bookings}
          totalRevenue={totalRevenue}
        />
      </main>
    </div>
  );
}
