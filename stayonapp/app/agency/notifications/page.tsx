import Link from "next/link";
import { requireAgency } from "@/lib/agency-auth";
import { getAgencySettings } from "@/lib/agency-settings";
import { type AptRow, type BookingRow, type ScanRow, fmtDateTime } from "@/lib/agency-data";
import { buildActivity, buildAlerts, unreadCount } from "@/lib/agency-notifications";
import { PageHeader, SectionCard, Empty } from "@/components/agency/ui";
import { MarkAllRead } from "@/components/agency/MarkAllRead";

export const dynamic = "force-dynamic";

export default async function AgencyNotifications() {
  const { supabase, agencyId } = await requireAgency();
  const [{ data: bookings }, { data: apts }, { data: scans }, settings] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("apartments").select("*"),
    supabase.from("scans").select("apartment_id, created_at"),
    getAgencySettings(supabase, agencyId),
  ]);
  const aptRows = (apts ?? []) as AptRow[];
  const aptName = new Map(aptRows.map((a) => [a.id, a.name]));
  const activity = buildActivity((bookings ?? []) as BookingRow[], aptName);
  const alerts = buildAlerts(aptRows, (bookings ?? []) as BookingRow[], (scans ?? []) as ScanRow[], settings);
  const seen = settings.notificationsSeenAt;
  const unread = unreadCount(activity, seen);

  return (
    <div>
      <PageHeader
        title="Notifications"
        sub={unread ? `${unread} new since your last visit` : "You are up to date"}
        right={<MarkAllRead agencyId={agencyId} disabled={!unread} />}
      />

      <SectionCard title={`To check${alerts.length ? ` · ${alerts.length}` : ""}`} right={<Link href="/agency/settings?tab=notifications" className="text-[12px] text-muted hover:text-cream pr-1">Alert settings →</Link>}>
        {alerts.length === 0 && <Empty>Everything is set up correctly.</Empty>}
        {alerts.map((a) => (
          <div key={a.id} className="px-5 py-4 border-b border-line last:border-b-0 flex flex-col sm:flex-row sm:items-start gap-3">
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.level === "action" ? "bg-[#c98b7a]" : "bg-gold"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-medium">{a.title}</div>
              <p className="text-[13px] text-creamDim leading-[1.55] mt-1">{a.body}</p>
              {a.items && a.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {a.items.slice(0, 8).map((n) => <span key={n} className="pill pill-off normal-case tracking-normal text-[11px]">{n}</span>)}
                  {a.items.length > 8 && <span className="text-[12px] text-muted self-center">+{a.items.length - 8} more</span>}
                </div>
              )}
            </div>
            <Link href={a.href} className="shrink-0 text-[11px] uppercase tracking-[1px] border border-line rounded-[2px] px-3 py-2 text-cream hover:border-gold transition">{a.cta}</Link>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Activity">
        {activity.length === 0 && <Empty>No activity yet. Every paid booking will appear here.</Empty>}
        {activity.map((a) => {
          const isNew = seen ? a.at > seen : a.kind === "booking";
          return (
            <div key={a.id} className="px-5 py-3.5 border-b border-line last:border-b-0 flex items-start gap-3" style={isNew ? { background: "rgba(198,167,106,.05)" } : {}}>
              <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${isNew ? "bg-gold" : "bg-[rgba(243,237,225,.2)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <div className={`text-[14px] ${a.kind === "milestone" ? "text-gold" : ""} ${isNew ? "font-medium" : ""}`}>{a.title}</div>
                  <div className="text-[12px] text-muted">{fmtDateTime(a.at)}</div>
                </div>
                <p className="text-[13px] text-creamDim mt-0.5">{a.body}</p>
              </div>
            </div>
          );
        })}
      </SectionCard>
    </div>
  );
}
