import Link from "next/link";
import { requireAgency } from "@/lib/agency-auth";
import {
  type BookingRow, type ScanRow, FLOWS, FLOW_LABEL,
  eur, pct, bookingLabel, delta, sum, startOfMonth, fmtDateTime,
} from "@/lib/agency-data";
import { Kpi, Bar, SectionCard, Empty } from "@/components/agency/ui";

export const dynamic = "force-dynamic";

export default async function AgencyOverview() {
  const { supabase, agencyName } = await requireAgency();

  const [{ data: bookings }, { data: apts }, { data: scans }] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name"),
    supabase.from("scans").select("apartment_id, created_at"),
  ]);

  const bk = (bookings ?? []) as BookingRow[];
  const sc = (scans ?? []) as ScanRow[];
  const aptList = apts ?? [];
  const aptName = new Map(aptList.map((a) => [a.id, a.name]));

  // This month vs last month
  const m0 = startOfMonth(), m1 = startOfMonth(new Date(), -1);
  const inM0 = (iso: string) => new Date(iso) >= m0;
  const inM1 = (iso: string) => { const d = new Date(iso); return d >= m1 && d < m0; };
  const bk0 = bk.filter((b) => inM0(b.created_at)), bk1 = bk.filter((b) => inM1(b.created_at));
  const sc0 = sc.filter((s) => inM0(s.created_at)), sc1 = sc.filter((s) => inM1(s.created_at));
  const rev0 = sum(bk0), rev1 = sum(bk1);
  const conv0 = sc0.length ? (bk0.length / sc0.length) * 100 : 0;
  const count = (rows: BookingRow[], f: string) => rows.filter((b) => b.flow === f).length;

  const revenueAll = sum(bk);
  const avgBasket = bk.length ? revenueAll / bk.length : 0;

  // Service mix (all time)
  const mix = FLOWS.map((f) => ({ f, rev: sum(bk.filter((b) => b.flow === f)), n: count(bk, f) }));
  const mixMax = Math.max(1, ...mix.map((m) => m.rev));

  // Per apartment (all time)
  const perApt = aptList
    .map((a) => {
      const s = sc.filter((x) => x.apartment_id === a.id).length;
      const rows = bk.filter((x) => x.apartment_id === a.id);
      return { id: a.id, name: a.name, scans: s, books: rows.length, conv: s ? (rows.length / s) * 100 : 0, rev: sum(rows) };
    })
    .sort((x, y) => y.rev - x.rev);

  const monthName = m0.toLocaleString("en-US", { month: "long" });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] font-semibold leading-none capitalize">{agencyName}</h1>
          <p className="text-muted text-[13px] mt-2">Overview · {monthName} {m0.getFullYear()}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/agency/revenue" className="text-[11px] uppercase tracking-[1px] text-muted hover:text-cream border border-line rounded-[2px] px-3 py-2 transition">Revenue →</Link>
          <Link href="/agency/apartments" className="text-[11px] uppercase tracking-[1px] text-[#111] bg-cream rounded-[2px] px-3 py-2">+ Apartment</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Kpi label={`Revenue · ${monthName}`} value={eur(rev0)} delta={delta(rev0, rev1)} gold />
        <Kpi label="Bookings this month" value={String(bk0.length)} delta={delta(bk0.length, bk1.length)} />
        <Kpi label="Scans this month" value={String(sc0.length)} delta={delta(sc0.length, sc1.length)} />
        <Kpi label="Conversion this month" value={sc0.length ? pct(conv0) : "—"} hint="Bookings ÷ scans" gold />
        <Kpi label="Active QR codes" value={String(aptList.length)} hint="One per apartment" />
        <Kpi label="Extra nights sold" value={String(count(bk0, "night"))} delta={delta(count(bk0, "night"), count(bk1, "night"))} />
        <Kpi label="Late checkouts sold" value={String(count(bk0, "late"))} delta={delta(count(bk0, "late"), count(bk1, "late"))} />
        <Kpi label="Cleanings sold" value={String(count(bk0, "cleaning"))} delta={delta(count(bk0, "cleaning"), count(bk1, "cleaning"))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-4">
        <SectionCard title="Revenue by service" right={<span className="text-[12px] text-muted pr-1">All time · {eur(revenueAll)}</span>}>
          <div className="px-5 pb-5 pt-2 space-y-5">
            {mix.map((m) => (
              <div key={m.f}>
                <div className="flex justify-between text-[13.5px] mb-2">
                  <span>{FLOW_LABEL[m.f]} <span className="text-muted">· {m.n}</span></span>
                  <span className="font-serif text-[16px]">{eur(m.rev)}</span>
                </div>
                <Bar value={m.rev} max={mixMax} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="At a glance">
          <div className="px-5 pb-5 pt-1 text-[14px]">
            {[
              ["Total revenue", eur(revenueAll)],
              ["Total bookings", String(bk.length)],
              ["Average basket", bk.length ? eur(avgBasket) : "—"],
              ["Total scans", String(sc.length)],
              ["All-time conversion", sc.length ? pct((bk.length / sc.length) * 100) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3 border-b border-line last:border-b-0">
                <span className="text-muted">{k}</span>
                <span className="font-serif text-[16px]">{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {perApt.length > 0 && (
        <SectionCard title="Performance by apartment">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
            <div>Apartment</div>
            <div className="text-right">Scans</div>
            <div className="text-right">Bookings</div>
            <div className="text-right">Conversion</div>
            <div className="text-right">Revenue</div>
          </div>
          {perApt.slice(0, 10).map((a) => (
            <div key={a.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1.1fr] gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
              <div className="font-medium truncate">{a.name}</div>
              <div className="text-right text-creamDim">{a.scans}</div>
              <div className="text-right text-creamDim">{a.books}</div>
              <div className="text-right" style={a.conv > 0 ? { color: "#c6a76a" } : {}}>{a.scans ? pct(a.conv) : "—"}</div>
              <div className="text-right font-serif text-[16px]">{eur(a.rev)}</div>
            </div>
          ))}
          {perApt.length > 10 && (
            <Link href="/agency/revenue" className="block px-5 py-3 text-[12px] text-muted hover:text-cream">See all {perApt.length} apartments →</Link>
          )}
        </SectionCard>
      )}

      <SectionCard title="Recent bookings" right={<Link href="/agency/bookings" className="text-[12px] text-muted hover:text-cream pr-1">All bookings →</Link>}>
        <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_1.4fr_.9fr_1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
          <div>Guest</div><div>Apartment</div><div>Type</div><div className="text-right">Amount</div><div>When</div>
        </div>
        {bk.length === 0 && <Empty>No bookings yet — add an apartment and place its QR plaque in the room.</Empty>}
        {bk.slice(0, 8).map((b) => (
          <div key={b.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_1.4fr_.9fr_1fr] gap-2 md:gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
            <div className="font-medium truncate">{b.guest_name || "Guest"}</div>
            <div className="text-creamDim truncate">{b.apartment_id ? aptName.get(b.apartment_id) ?? "—" : "—"}</div>
            <div><span className="pill pill-on">{bookingLabel(b)}</span></div>
            <div className="md:text-right font-serif text-[16px]">{eur(b.amount)}</div>
            <div className="text-muted text-[13px]">{fmtDateTime(b.created_at)}</div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
