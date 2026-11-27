import { requireAgency } from "@/lib/agency-auth";
import {
  type BookingRow, FLOWS, FLOW_LABEL, eur, sum, bookingLabel, parsePeriod, inPeriod, fmtDateTime, fmtDate,
} from "@/lib/agency-data";
import { PageHeader, PeriodTabs, SectionCard, ExportLink, Empty } from "@/components/agency/ui";

export const dynamic = "force-dynamic";

export default async function AgencyBookings({
  searchParams,
}: {
  searchParams: { period?: string; type?: string; apt?: string; q?: string };
}) {
  const { supabase } = await requireAgency();
  const period = parsePeriod(searchParams.period, "all");
  const type = FLOWS.find((f) => f === searchParams.type) ?? "";
  const aptId = searchParams.apt ?? "";
  const q = (searchParams.q ?? "").trim().toLowerCase();

  const [{ data: bookings }, { data: apts }] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name").order("name"),
  ]);
  const aptList = apts ?? [];
  const aptName = new Map(aptList.map((a) => [a.id, a.name]));

  const bk = ((bookings ?? []) as BookingRow[]).filter(
    (b) =>
      inPeriod(b.created_at, period.since) &&
      (!type || b.flow === type) &&
      (!aptId || b.apartment_id === aptId) &&
      (!q ||
        (b.guest_name ?? "").toLowerCase().includes(q) ||
        (b.guest_email ?? "").toLowerCase().includes(q) ||
        (b.reference ?? "").toLowerCase().includes(q))
  );

  const params = { ...(type ? { type } : {}), ...(aptId ? { apt: aptId } : {}), ...(q ? { q } : {}) };
  const exportQs = new URLSearchParams({ kind: "bookings", period: period.id, ...params }).toString();
  const select = "bg-panel border border-line rounded-[2px] px-3 py-2.5 text-[13px] text-cream outline-none focus:border-gold";

  return (
    <div>
      <PageHeader
        title="Bookings"
        sub={`${bk.length} booking${bk.length === 1 ? "" : "s"} · ${eur(sum(bk))}`}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <PeriodTabs base="/agency/bookings" current={period.id} extra={params} />
            <ExportLink href={`/api/agency/export?${exportQs}`} />
          </div>
        }
      />

      <form action="/agency/bookings" className="flex flex-wrap gap-3 mt-6">
        <input type="hidden" name="period" value={period.id} />
        <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Guest, e-mail or reference…" className={`${select} flex-1 min-w-[220px] placeholder:text-muted`} />
        <select name="type" defaultValue={type} className={select}>
          <option value="">All services</option>
          {FLOWS.map((f) => <option key={f} value={f}>{FLOW_LABEL[f]}</option>)}
        </select>
        <select name="apt" defaultValue={aptId} className={select}>
          <option value="">All apartments</option>
          {aptList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <button className="text-[11px] uppercase tracking-[1px] bg-cream text-[#111] rounded-[2px] px-4">Filter</button>
        {(type || aptId || q) && (
          <a href={`/agency/bookings?period=${period.id}`} className="text-[12px] text-muted hover:text-cream self-center">Clear</a>
        )}
      </form>

      <SectionCard title="All bookings">
        <div className="hidden md:grid grid-cols-[1.5fr_1.4fr_1.3fr_1fr_.8fr_1.1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
          <div>Guest</div><div>Apartment</div><div>Service</div><div>For</div><div className="text-right">Amount</div><div>Paid</div>
        </div>
        {bk.length === 0 && <Empty>No booking matches these filters.</Empty>}
        {bk.map((b) => (
          <div key={b.id} className="grid grid-cols-2 md:grid-cols-[1.5fr_1.4fr_1.3fr_1fr_.8fr_1.1fr] gap-2 md:gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
            <div className="min-w-0">
              <div className="font-medium truncate">{b.guest_name || "Guest"}</div>
              <div className="text-[12px] text-muted truncate">{b.guest_email || (b.reference ? b.reference : "")}</div>
            </div>
            <div className="text-creamDim truncate">{b.apartment_id ? aptName.get(b.apartment_id) ?? "—" : "—"}</div>
            <div><span className="pill pill-on">{bookingLabel(b)}</span></div>
            <div className="text-creamDim text-[13px]">{b.check_in ? fmtDate(b.check_in) : "—"}</div>
            <div className="text-right font-serif text-[16px]">{eur(b.amount)}</div>
            <div className="text-muted text-[13px]">{fmtDateTime(b.created_at)}</div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
