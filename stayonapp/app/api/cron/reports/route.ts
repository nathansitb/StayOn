import { createAdminClient } from "@/lib/supabase/server";
import { withDefaults } from "@/lib/agency-settings";
import { FLOW_LABEL, FLOWS, eur, pct, sum, type BookingRow } from "@/lib/agency-data";
import { sendEmail, reportEmailHtml, dashboardUrl } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY = 86_400_000;

/**
 * GET /api/cron/reports — called every morning by Vercel Cron (vercel.json).
 *  - daily digest  : yesterday's activity, for agencies that enabled it (only if something happened)
 *  - weekly report : on Mondays, the last 7 days, for agencies that enabled it
 * Protected by CRON_SECRET (Vercel sends it as a Bearer token).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const admin = createAdminClient();
  const now = new Date();
  const isMonday = now.getUTCDay() === 1;
  const today0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const { data: rows } = await admin.from("agency_settings").select("agency_id, data");
  let sent = 0;

  for (const r of rows ?? []) {
    const s = withDefaults(r.data);
    const jobs: Array<{ kind: "daily" | "weekly"; from: number }> = [];
    if (s.notifications.dailyDigest) jobs.push({ kind: "daily", from: today0 - DAY });
    if (s.notifications.weeklyReport && isMonday) jobs.push({ kind: "weekly", from: today0 - 7 * DAY });
    if (!jobs.length) continue;

    let to = s.notifications.email;
    if (!to) {
      const { data: p } = await admin.from("profiles").select("email").eq("agency_id", r.agency_id).limit(1);
      to = (p?.[0]?.email as string) || "";
    }
    if (!to) continue;

    const [{ data: agency }, { data: apts }] = await Promise.all([
      admin.from("agencies").select("name").eq("id", r.agency_id).maybeSingle(),
      admin.from("apartments").select("id, name").eq("agency_id", r.agency_id),
    ]);
    const aptName = new Map((apts ?? []).map((a) => [a.id, a.name]));
    const name = s.profile.displayName || agency?.name || "your agency";

    for (const job of jobs) {
      const fromIso = new Date(job.from).toISOString(), toIso = new Date(today0).toISOString();
      const [{ data: bk }, { count: scans }] = await Promise.all([
        admin.from("bookings").select("*").eq("agency_id", r.agency_id).gte("created_at", fromIso).lt("created_at", toIso),
        admin.from("scans").select("id", { count: "exact", head: true }).eq("agency_id", r.agency_id).gte("created_at", fromIso).lt("created_at", toIso),
      ]);
      const b = (bk ?? []) as BookingRow[];
      if (job.kind === "daily" && b.length === 0) continue;   // no empty daily e-mails

      const byApt = new Map<string, number>();
      b.forEach((x) => x.apartment_id && byApt.set(x.apartment_id, (byApt.get(x.apartment_id) ?? 0) + x.amount));
      const best = [...byApt.entries()].sort((a, c) => c[1] - a[1])[0];
      const lines: Array<[string, string]> = FLOWS.map((f) => {
        const rows = b.filter((x) => x.flow === f);
        return [FLOW_LABEL[f], `${rows.length} · ${eur(sum(rows))}`] as [string, string];
      });
      if (best) lines.push(["Best apartment", `${aptName.get(best[0]) ?? "—"} · ${eur(best[1])}`]);

      const label = job.kind === "daily" ? "Yesterday" : "Last 7 days";
      await sendEmail({
        to,
        subject: job.kind === "daily" ? `StayOn · ${eur(sum(b))} yesterday` : `StayOn weekly report · ${eur(sum(b))}`,
        html: reportEmailHtml({
          title: job.kind === "daily" ? "Your daily digest" : "Your weekly report",
          intro: `${label} at ${name}.`,
          revenue: eur(sum(b)),
          bookings: b.length,
          scans: scans ?? 0,
          conversion: scans ? pct((b.length / scans) * 100) : "—",
          lines,
          dashboardUrl: dashboardUrl(),
        }),
      });
      sent++;
    }
  }
  return Response.json({ ok: true, sent });
}
