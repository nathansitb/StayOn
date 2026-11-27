import { requireAgency } from "@/lib/agency-auth";

export const dynamic = "force-dynamic";

const eur = (n: number) => "€" + n.toLocaleString("en-US");

function bookingType(b: { flow: string; nights: number; late_time: string | null; cleaning_slot: string | null }) {
  if (b.flow === "night") return `Extra night ×${b.nights}`;
  if (b.flow === "late") return `Late checkout ${b.late_time ?? ""}`;
  return `Cleaning ${b.cleaning_slot ?? ""}`;
}

export default async function AgencyOverview() {
  const { supabase, agencyName } = await requireAgency();

  const [{ data: bookings }, { data: apts }, { data: scans }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, guest_name, flow, nights, late_time, cleaning_slot, amount, created_at, apartment_id")
      .order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name"),
    supabase.from("scans").select("apartment_id"),
  ]);

  const bk = bookings ?? [];
  const sc = scans ?? [];
  const aptList = apts ?? [];
  const aptName = new Map(aptList.map((a) => [a.id, a.name]));
  const now = new Date();

  const revenue = bk.reduce((s, b) => s + (b.amount ?? 0), 0);
  const monthRevenue = bk
    .filter((b) => {
      const d = new Date(b.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, b) => s + (b.amount ?? 0), 0);

  const totalScans = sc.length;
  const conversion = totalScans ? (bk.length / totalScans) * 100 : 0;

  // Per-apartment performance
  const scanByApt = new Map<string, number>();
  sc.forEach((s) => { if (s.apartment_id) scanByApt.set(s.apartment_id, (scanByApt.get(s.apartment_id) ?? 0) + 1); });
  const bookByApt = new Map<string, number>();
  const revByApt = new Map<string, number>();
  bk.forEach((b) => {
    if (!b.apartment_id) return;
    bookByApt.set(b.apartment_id, (bookByApt.get(b.apartment_id) ?? 0) + 1);
    revByApt.set(b.apartment_id, (revByApt.get(b.apartment_id) ?? 0) + (b.amount ?? 0));
  });
  const perApt = aptList
    .map((a) => {
      const scans = scanByApt.get(a.id) ?? 0;
      const books = bookByApt.get(a.id) ?? 0;
      return { id: a.id, name: a.name, scans, books, conv: scans ? (books / scans) * 100 : 0, rev: revByApt.get(a.id) ?? 0 };
    })
    .sort((x, y) => y.rev - x.rev);

  const kpis = [
    { l: "Revenue", n: eur(revenue), gold: true },
    { l: "This month", n: eur(monthRevenue) },
    { l: "Scans", n: String(totalScans) },
    { l: "Bookings", n: String(bk.length) },
    { l: "Conversion", n: totalScans ? `${conversion.toFixed(1)}%` : "—", gold: true },
  ];

  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold">{agencyName}</h1>
      <p className="text-muted text-[13px] mt-1">Overview</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {kpis.map((k) => (
          <div key={k.l} className="card p-5" style={k.gold ? { borderColor: "rgba(198,167,106,.35)" } : {}}>
            <div className="text-[10px] uppercase tracking-[1.5px] text-muted">{k.l}</div>
            <div className={`font-serif text-[24px] font-semibold mt-2 ${k.gold ? "text-gold" : ""}`}>{k.n}</div>
          </div>
        ))}
      </div>

      {perApt.length > 0 && (
        <div className="card p-1.5 mt-6">
          <div className="font-serif text-[18px] font-semibold px-5 pt-4 pb-2">Performance by apartment</div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
            <div>Apartment</div>
            <div className="text-right">Scans</div>
            <div className="text-right">Bookings</div>
            <div className="text-right">Conversion</div>
            <div className="text-right">Revenue</div>
          </div>
          {perApt.map((a) => (
            <div key={a.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1.1fr] gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
              <div className="font-medium truncate">{a.name}</div>
              <div className="text-right text-creamDim">{a.scans}</div>
              <div className="text-right text-creamDim">{a.books}</div>
              <div className="text-right font-serif" style={a.conv > 0 ? { color: "#c6a76a" } : {}}>{a.scans ? `${a.conv.toFixed(1)}%` : "—"}</div>
              <div className="text-right font-serif">{eur(a.rev)}</div>
            </div>
          ))}
        </div>
      )}

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
            No bookings yet — add an apartment and place its QR plaque in the room.
          </div>
        )}
        {bk.slice(0, 8).map((b) => (
          <div key={b.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_1.4fr_.9fr_1fr] gap-2 md:gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
            <div className="font-medium truncate">{b.guest_name || "Guest"}</div>
            <div className="text-creamDim truncate">{b.apartment_id ? aptName.get(b.apartment_id) ?? "—" : "—"}</div>
            <div><span className="pill pill-on">{bookingType(b)}</span></div>
            <div className="md:text-right font-serif">{eur(b.amount)}</div>
            <div className="text-muted text-[13px]">{new Date(b.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
