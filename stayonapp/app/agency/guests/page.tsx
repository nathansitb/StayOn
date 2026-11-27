import { requireAgency } from "@/lib/agency-auth";
import {
  type BookingRow, FLOW_LABEL, eur, pct, groupGuests, parsePeriod, inPeriod, fmtDate,
} from "@/lib/agency-data";
import { PageHeader, Kpi, PeriodTabs, SectionCard, ExportLink, Empty } from "@/components/agency/ui";

export const dynamic = "force-dynamic";

const SORTS = [
  { id: "spent", label: "Top spenders" },
  { id: "recent", label: "Most recent" },
  { id: "visits", label: "Most bookings" },
] as const;

export default async function AgencyGuests({
  searchParams,
}: {
  searchParams: { period?: string; q?: string; sort?: string; filter?: string };
}) {
  const { supabase } = await requireAgency();
  const period = parsePeriod(searchParams.period, "all");
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const sort = SORTS.find((s) => s.id === searchParams.sort)?.id ?? "spent";
  const onlyReturning = searchParams.filter === "returning";

  const [{ data: bookings }, { data: apts }] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("id, name"),
  ]);
  const aptName = new Map((apts ?? []).map((a) => [a.id, a.name]));
  const rows = ((bookings ?? []) as BookingRow[]).filter((b) => inPeriod(b.created_at, period.since));

  const all = groupGuests(rows);
  const returning = all.filter((g) => g.bookings > 1);
  const withEmail = all.filter((g) => g.email);
  const spent = all.reduce((s, g) => s + g.spent, 0);

  let list = all;
  if (q) list = list.filter((g) => g.name.toLowerCase().includes(q) || (g.email ?? "").includes(q));
  if (onlyReturning) list = list.filter((g) => g.bookings > 1);
  if (sort === "recent") list = [...list].sort((a, b) => b.last.localeCompare(a.last));
  if (sort === "visits") list = [...list].sort((a, b) => b.bookings - a.bookings || b.spent - a.spent);

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ period: period.id, sort, ...(q ? { q } : {}), ...(onlyReturning ? { filter: "returning" } : {}), ...over });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return `/agency/guests?${p.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Guests"
        sub="Everyone who paid for a service through StayOn"
        right={
          <div className="flex flex-wrap items-center gap-3">
            <PeriodTabs base="/agency/guests" current={period.id} extra={{ sort, ...(q ? { q } : {}) }} />
            <ExportLink href={`/api/agency/export?kind=guests&period=${period.id}`} />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Kpi label="Guests" value={String(all.length)} hint={`${rows.length} bookings`} gold />
        <Kpi label="Returning guests" value={String(returning.length)} hint={all.length ? `${pct((returning.length / all.length) * 100)} booked more than once` : "—"} />
        <Kpi label="Spend per guest" value={all.length ? eur(spent / all.length) : "—"} hint="Average" />
        <Kpi label="E-mails collected" value={String(withEmail.length)} hint={all.length ? `${pct((withEmail.length / all.length) * 100)} of guests` : "—"} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <form action="/agency/guests" className="flex-1 min-w-[240px]">
          <input type="hidden" name="period" value={period.id} />
          <input type="hidden" name="sort" value={sort} />
          {onlyReturning && <input type="hidden" name="filter" value="returning" />}
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search a name or an e-mail…"
            className="w-full bg-panel border border-line rounded-[2px] px-4 py-2.5 text-[14px] text-cream placeholder:text-muted outline-none focus:border-gold"
          />
        </form>
        <div className="flex gap-1 bg-panel border border-line rounded-[2px] p-1">
          {SORTS.map((s) => (
            <a key={s.id} href={qs({ sort: s.id })} className={`px-3 py-1.5 rounded-[2px] text-[11px] uppercase tracking-[1px] transition ${s.id === sort ? "bg-cream text-[#111] font-medium" : "text-muted hover:text-cream"}`}>{s.label}</a>
          ))}
        </div>
        <a href={qs({ filter: onlyReturning ? "" : "returning" })} className={`px-3 py-2 rounded-[2px] text-[11px] uppercase tracking-[1px] border transition ${onlyReturning ? "border-gold text-gold" : "border-line text-muted hover:text-cream"}`}>
          Returning only
        </a>
      </div>

      <SectionCard title={`${list.length} guest${list.length === 1 ? "" : "s"}`}>
        <div className="hidden md:grid grid-cols-[1.8fr_.6fr_.9fr_1.6fr_1.3fr_1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
          <div>Guest</div><div className="text-right">Bookings</div><div className="text-right">Spent</div><div>Services</div><div>Last apartment</div><div>Last visit</div>
        </div>
        {list.length === 0 && <Empty>{q ? "No guest matches this search." : "No guests yet — they appear here after their first payment."}</Empty>}
        {list.map((g) => (
          <div key={g.key} className="grid grid-cols-2 md:grid-cols-[1.8fr_.6fr_.9fr_1.6fr_1.3fr_1fr] gap-2 md:gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center">
            <div className="min-w-0 col-span-2 md:col-span-1">
              <div className="font-medium truncate flex items-center gap-2">
                {g.name}
                {g.bookings > 1 && <span className="pill pill-on">Returning</span>}
              </div>
              {g.email ? (
                <a href={`mailto:${g.email}`} className="text-[12px] text-muted hover:text-cream truncate block">{g.email}</a>
              ) : (
                <div className="text-[12px] text-muted">No e-mail</div>
              )}
            </div>
            <div className="md:text-right text-creamDim">{g.bookings}</div>
            <div className="text-right font-serif text-[16px]">{eur(g.spent)}</div>
            <div className="flex flex-wrap gap-1.5 col-span-2 md:col-span-1">
              {[...g.flows].map((f) => <span key={f} className="pill pill-off">{FLOW_LABEL[f]}</span>)}
            </div>
            <div className="text-creamDim truncate">{g.lastApartment ? aptName.get(g.lastApartment) ?? "—" : "—"}</div>
            <div className="text-muted text-[13px]">{fmtDate(g.last)}</div>
          </div>
        ))}
      </SectionCard>
      <p className="text-[12px] text-muted mt-4 leading-[1.6]">
        Guests are grouped by e-mail (as entered on the payment page). Bookings made before e-mails were collected are grouped by name.
        Use this data only to serve your guests, in line with your privacy policy (GDPR).
      </p>
    </div>
  );
}
