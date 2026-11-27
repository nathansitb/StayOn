import { requireAgency } from "@/lib/agency-auth";

export const dynamic = "force-dynamic";

const eur = (n: number) => "€" + n.toLocaleString("en-US");

function bookingType(b: { flow: string; nights: number; late_time: string | null; cleaning_slot: string | null }) {
  if (b.flow === "night") return `Extra night ×${b.nights}`;
  if (b.flow === "late") return `Late checkout ${b.late_time ?? ""}`;
  return `Cleaning ${b.cleaning_slot ?? ""}`;
}

export default async function AgencyBookings() {
  const { supabase } = await requireAgency();

  const [{ data: bookings }, { data: apts }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, guest_name, flow, nights, late_time, cleaning_slot, amount, created_at, apartment_id")
      .order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name"),
  ]);

  const bk = bookings ?? [];
  const aptName = new Map((apts ?? []).map((a) => [a.id, a.name]));

  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold">Bookings</h1>
      <p className="text-muted text-[13px] mt-1">{bk.length} total</p>

      <div className="card p-1.5 mt-6">
        <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_1.4fr_.9fr_1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
          <div>Guest</div>
          <div>Apartment</div>
          <div>Type</div>
          <div className="text-right">Amount</div>
          <div>When</div>
        </div>
        {bk.length === 0 && (
          <div className="px-5 py-12 text-center text-muted text-[14px]">
            No bookings yet.
          </div>
        )}
        {bk.map((b) => (
          <div key={b.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_1.4fr_.9fr_1fr] gap-2 md:gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
            <div className="font-medium truncate">{b.guest_name || "Guest"}</div>
            <div className="text-creamDim truncate">{b.apartment_id ? aptName.get(b.apartment_id) ?? "—" : "—"}</div>
            <div><span className="pill pill-on">{bookingType(b)}</span></div>
            <div className="md:text-right font-serif">{eur(b.amount)}</div>
            <div className="text-muted text-[13px]">{new Date(b.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
