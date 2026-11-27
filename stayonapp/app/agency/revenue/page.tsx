import { requireAgency } from "@/lib/agency-auth";
import {
  type BookingRow, FLOWS, FLOW_LABEL,
  eur, pct, sum, parsePeriod, inPeriod, monthlySeries,
} from "@/lib/agency-data";
import { PageHeader, Kpi, PeriodTabs, Bar, SectionCard, ExportLink, Empty } from "@/components/agency/ui";

export const dynamic = "force-dynamic";

export default async function AgencyRevenue({ searchParams }: { searchParams: { period?: string } }) {
  const { supabase } = await requireAgency();
  const period = parsePeriod(searchParams.period, "30d");

  const [{ data: bookings }, { data: apts }] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name, location"),
  ]);
  const all = (bookings ?? []) as BookingRow[];
  const bk = all.filter((b) => inPeriod(b.created_at, period.since));
  const aptList = apts ?? [];

  const revenue = sum(bk);
  const avg = bk.length ? revenue / bk.length : 0;
  const days = period.days || Math.max(1, Math.ceil((Date.now() - new Date(all[all.length - 1]?.created_at ?? Date.now()).getTime()) / 86_400_000));
  const perDay = revenue / Math.max(1, days);
  const sellingApts = new Set(bk.map((b) => b.apartment_id).filter(Boolean)).size;

  const byFlow = FLOWS.map((f) => {
    const rows = bk.filter((b) => b.flow === f);
    return { f, rev: sum(rows), n: rows.length, avg: rows.length ? sum(rows) / rows.length : 0 };
  });
  const flowMax = Math.max(1, ...byFlow.map((x) => x.rev));

  const months = monthlySeries(all, 12);
  const monthMax = Math.max(1, ...months.map((m) => m.total));

  const byApt = aptList
    .map((a) => {
      const rows = bk.filter((b) => b.apartment_id === a.id);
      return {
        id: a.id, name: a.name, location: a.location, n: rows.length, rev: sum(rows),
        night: sum(rows.filter((r) => r.flow === "night")),
        late: sum(rows.filter((r) => r.flow === "late")),
        cleaning: sum(rows.filter((r) => r.flow === "cleaning")),
      };
    })
    .sort((x, y) => y.rev - x.rev);
  const aptMax = Math.max(1, ...byApt.map((a) => a.rev));

  return (
    <div>
      <PageHeader
        title="Revenue"
        sub={`${period.label === "All time" ? "All time" : `Last ${period.label}`} · gross amounts paid by guests`}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <PeriodTabs base="/agency/revenue" current={period.id} />
            <ExportLink href={`/api/agency/export?kind=bookings&period=${period.id}`} />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Kpi label="Revenue" value={eur(revenue)} hint={`${bk.length} bookings`} gold />
        <Kpi label="Average basket" value={bk.length ? eur(avg) : "—"} hint="Per booking" />
        <Kpi label="Per selling apartment" value={sellingApts ? eur(revenue / sellingApts) : "—"} hint={`${sellingApts} of ${aptList.length} apartments sold`} />
        <Kpi label="Annualised" value={eur(perDay * 365)} hint="At the pace of this period" gold />
      </div>

      <SectionCard title="By service">
        <div className="grid grid-cols-[1.4fr_.7fr_.8fr_.9fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
          <div>Service</div><div className="text-right">Sold</div><div className="text-right">Avg. price</div><div className="text-right">Revenue</div>
        </div>
        {byFlow.map((x) => (
          <div key={x.f} className="px-5 py-4 border-b border-line last:border-b-0">
            <div className="grid grid-cols-[1.4fr_.7fr_.8fr_.9fr] gap-3 text-[14px] items-center">
              <div className="font-medium">{FLOW_LABEL[x.f]}</div>
              <div className="text-right text-creamDim">{x.n}</div>
              <div className="text-right text-creamDim">{x.n ? eur(x.avg) : "—"}</div>
              <div className="text-right font-serif text-[16px]">{eur(x.rev)} <span className="text-muted text-[12px] font-sans">{revenue ? pct((x.rev / revenue) * 100) : ""}</span></div>
            </div>
            <div className="mt-2.5"><Bar value={x.rev} max={flowMax} /></div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Last 12 months" right={<span className="text-[12px] text-muted pr-1">Gold: extra nights · Cream: late checkouts · Grey: cleanings</span>}>
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-end gap-2 h-[190px]">
            {months.map((m) => {
              const h = (v: number) => `${(v / monthMax) * 100}%`;
              return (
                <div key={m.key} className="flex-1 h-full flex flex-col justify-end group relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full text-[11px] text-cream bg-panel2 border border-line rounded-[2px] px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    {eur(m.total)}
                  </div>
                  <div className="w-full flex flex-col justify-end rounded-t-[2px] overflow-hidden" style={{ height: h(m.total), minHeight: m.total ? 3 : 1, background: m.total ? undefined : "rgba(243,237,225,.08)" }}>
                    <div style={{ height: m.total ? `${(m.cleaning / m.total) * 100}%` : 0, background: "rgba(243,237,225,.28)" }} />
                    <div style={{ height: m.total ? `${(m.late / m.total) * 100}%` : 0, background: "#F3EDE1" }} />
                    <div style={{ height: m.total ? `${(m.night / m.total) * 100}%` : 0, background: "#C6A76A" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-2">
            {months.map((m) => (
              <div key={m.key} className="flex-1 text-center text-[11px] text-muted">{m.label}</div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="By apartment">
        <div className="hidden md:grid grid-cols-[2fr_.6fr_.9fr_.9fr_.9fr_1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
          <div>Apartment</div><div className="text-right">Bookings</div><div className="text-right">Nights</div><div className="text-right">Late</div><div className="text-right">Cleaning</div><div className="text-right">Total</div>
        </div>
        {byApt.length === 0 && <Empty>No apartments yet.</Empty>}
        {byApt.map((a) => (
          <div key={a.id} className="px-5 py-3.5 border-b border-line last:border-b-0">
            <div className="grid grid-cols-2 md:grid-cols-[2fr_.6fr_.9fr_.9fr_.9fr_1fr] gap-2 md:gap-3 text-[14px] items-center">
              <div className="min-w-0">
                <div className="font-medium truncate">{a.name}</div>
                {a.location && <div className="text-[12px] text-muted truncate">{a.location}</div>}
              </div>
              <div className="text-right text-creamDim">{a.n}</div>
              <div className="hidden md:block text-right text-creamDim">{eur(a.night)}</div>
              <div className="hidden md:block text-right text-creamDim">{eur(a.late)}</div>
              <div className="hidden md:block text-right text-creamDim">{eur(a.cleaning)}</div>
              <div className="text-right font-serif text-[16px]">{eur(a.rev)}</div>
            </div>
            <div className="mt-2"><Bar value={a.rev} max={aptMax} tone={a.rev ? "gold" : "muted"} /></div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
