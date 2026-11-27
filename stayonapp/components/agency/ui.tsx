import Link from "next/link";
import { PERIODS, type PeriodId } from "@/lib/agency-data";

/** Small building blocks shared by the agency tabs (server components). */

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[30px] font-semibold leading-none">{title}</h1>
        {sub && <p className="text-muted text-[13px] mt-2">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  hint,
  gold = false,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
  gold?: boolean;
}) {
  return (
    <div className="card p-5" style={gold ? { borderColor: "rgba(198,167,106,.35)" } : {}}>
      <div className="text-[10px] uppercase tracking-[1.5px] text-muted">{label}</div>
      <div className={`font-serif text-[28px] font-semibold mt-2 leading-none ${gold ? "text-gold" : ""}`}>{value}</div>
      <div className="text-[12px] mt-2.5 min-h-[16px]">
        {delta !== undefined && delta !== null ? (
          <span className={delta >= 0 ? "text-gold" : "text-[#c98b7a]"}>
            {delta >= 0 ? "↗" : "↘"} {delta >= 0 ? "+" : ""}
            {delta.toFixed(0)}% <span className="text-muted">vs last month</span>
          </span>
        ) : (
          <span className="text-muted">{hint ?? ""}</span>
        )}
      </div>
    </div>
  );
}

export function PeriodTabs({ base, current, extra = {} }: { base: string; current: PeriodId; extra?: Record<string, string> }) {
  return (
    <div className="flex gap-1 bg-panel border border-line rounded-[2px] p-1">
      {PERIODS.map((p) => {
        const q = new URLSearchParams({ ...extra, period: p.id }).toString();
        return (
          <Link
            key={p.id}
            href={`${base}?${q}`}
            className={`px-3 py-1.5 rounded-[2px] text-[11px] uppercase tracking-[1px] whitespace-nowrap transition ${
              p.id === current ? "bg-cream text-[#111] font-medium" : "text-muted hover:text-cream"
            }`}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Bar({ value, max, tone = "gold" }: { value: number; max: number; tone?: "gold" | "cream" | "muted" }) {
  const w = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  const bg = tone === "gold" ? "#C6A76A" : tone === "cream" ? "#F3EDE1" : "rgba(243,237,225,.25)";
  return (
    <div className="h-[6px] w-full bg-panel2 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: bg }} />
    </div>
  );
}

export function SectionCard({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-1.5 mt-6">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="font-serif text-[19px] font-semibold">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function ExportLink({ href, label = "Export CSV" }: { href: string; label?: string }) {
  return (
    <a href={href} className="text-[11px] uppercase tracking-[1px] text-muted hover:text-cream border border-line rounded-[2px] px-3 py-2 transition">
      ↓ {label}
    </a>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-12 text-center text-muted text-[14px]">{children}</div>;
}
