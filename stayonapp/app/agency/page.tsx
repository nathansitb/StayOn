import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ApartmentsManager } from "@/components/agency/ApartmentsManager";

export const dynamic = "force-dynamic";

const eur = (n: number) => "€" + n.toLocaleString("en-US");

function bookingType(b: { flow: string; nights: number; late_time: string | null; cleaning_slot: string | null }) {
  if (b.flow === "night") return `Extra night ×${b.nights}`;
  if (b.flow === "late") return `Late checkout ${b.late_time ?? ""}`;
  return `Cleaning ${b.cleaning_slot ?? ""}`;
}

export default async function AgencyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();
  if (profile?.role === "super_admin") redirect("/admin");

  const { data: agency } = await supabase
    .from("agencies")
    .select("name, plan")
    .eq("id", profile?.agency_id)
    .single();

  const [{ data: bookings }, { data: apts }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, guest_name, flow, nights, late_time, cleaning_slot, amount, created_at, apartment_id")
      .order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name"),
  ]);

  const bk = bookings ?? [];
  const aptName = new Map((apts ?? []).map((a) => [a.id, a.name]));

  const revenue = bk.reduce((s, b) => s + (b.amount ?? 0), 0);
  const now = new Date();
  const monthRevenue = bk
    .filter((b) => {
      const d = new Date(b.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, b) => s + (b.amount ?? 0), 0);
  const extensions = bk.filter((b) => b.flow === "night").length;
  const lates = bk.filter((b) => b.flow === "late").length;
  const cleanings = bk.filter((b) => b.flow === "cleaning").length;

  const kpis = [
    { l: "Revenue", n: eur(revenue), gold: true },
    { l: "This month", n: eur(monthRevenue) },
    { l: "Bookings", n: String(bk.length) },
    { l: "Extensions", n: String(extensions) },
    { l: "Late / Cleaning", n: `${lates} / ${cleanings}` },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-[1180px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-cream">
            <Logo size={22} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-muted hidden sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-12">
        <div className="text-[11px] uppercase tracking-[2px] text-gold">Agency space</div>
        <h1 className="font-serif text-[34px] font-semibold mt-3">
          {agency?.name ?? "Your agency"}
        </h1>
        <p className="text-muted text-[14px] mt-2">
          {user.email} · plan: {agency?.plan ?? "free"}
        </p>

        {/* real KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {kpis.map((k) => (
            <div key={k.l} className="card p-5" style={k.gold ? { borderColor: "rgba(198,167,106,.35)" } : {}}>
              <div className="text-[10px] uppercase tracking-[1.5px] text-muted">{k.l}</div>
              <div className={`font-serif text-[24px] font-semibold mt-2 ${k.gold ? "text-gold" : ""}`}>{k.n}</div>
            </div>
          ))}
        </div>

        {/* recent bookings */}
        <div className="card p-1.5 mt-6">
          <div className="font-serif text-[18px] font-semibold px-5 pt-4 pb-2">Recent bookings</div>
          <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_1.4fr_.9fr_1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
            <div>Guest</div>
            <div>Apartment</div>
            <div>Type</div>
            <div className="text-right">Amount</div>
            <div>When</div>
          </div>
          {bk.length === 0 && (
            <div className="px-5 py-10 text-center text-muted text-[14px]">
              No bookings yet — print your apartments&apos; QR plaques and place them in the rooms.
            </div>
          )}
          {bk.slice(0, 10).map((b) => (
            <div key={b.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_1.4fr_.9fr_1fr] gap-2 md:gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
              <div className="font-medium truncate">{b.guest_name || "Guest"}</div>
              <div className="text-creamDim truncate">{b.apartment_id ? aptName.get(b.apartment_id) ?? "—" : "—"}</div>
              <div><span className="pill pill-on">{bookingType(b)}</span></div>
              <div className="md:text-right font-serif">{eur(b.amount)}</div>
              <div className="text-muted text-[13px]">{new Date(b.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {/* apartments management */}
        {profile?.agency_id && <ApartmentsManager agencyId={profile.agency_id} />}
      </main>
    </div>
  );
}
