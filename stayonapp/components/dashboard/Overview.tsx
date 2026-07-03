"use client";

import { useLang } from "@/lib/store";
import { DASHBOARD } from "@/lib/data";
import { Integrations } from "./Integrations";

function Kpi({
  label,
  value,
  trend,
  feature = false,
}: {
  label: string;
  value: string;
  trend?: string;
  feature?: boolean;
}) {
  return (
    <div
      className="rounded-[4px] p-6 border relative overflow-hidden"
      style={{
        background: "#141311",
        borderColor: feature ? "rgba(198,167,106,.35)" : "var(--line)",
      }}
    >
      <div className="text-[12.5px] text-muted tracking-[.3px]">{label}</div>
      <div
        className={`font-serif text-[38px] font-semibold mt-3 leading-none ${
          feature ? "text-gold" : ""
        }`}
      >
        {value}
      </div>
      {trend && (
        <div className="text-[12px] mt-3 text-gold flex items-center gap-1.5">
          ↗ {trend}
        </div>
      )}
    </div>
  );
}

export function Overview() {
  const { t, eur } = useLang();
  const d = DASHBOARD;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Kpi label={t("kActive")} value={String(d.activeQr)} trend={`+12 ${t("thisMonth")}`} />
        <Kpi label={t("kScans")} value={String(d.scans)} trend="+18%" />
        <Kpi label={t("kExt")} value={String(d.extensionsSold)} trend="+9%" />
        <Kpi label={t("kLate")} value={String(d.lateCheckoutsSold)} trend="+14%" />
        <Kpi label={t("kRevenue")} value={eur(d.revenue)} trend="+22%" feature />
        <Kpi label={t("kConv")} value={`${d.conversionRate}%`} trend="+2.1 pts" />
      </div>
      <Integrations />
    </div>
  );
}
