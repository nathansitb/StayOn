"use client";

import { useLang } from "@/lib/store";
import { APARTMENTS, DASHBOARD } from "@/lib/data";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function Row({ k, v, total = false }: { k: string; v: string; total?: boolean }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-line last:border-b-0">
      <span className={total ? "font-serif text-[18px] font-semibold" : "text-muted text-[14px]"}>
        {k}
      </span>
      <span className={total ? "font-serif text-[18px] font-semibold" : "text-cream text-[14px] font-medium"}>
        {v}
      </span>
    </div>
  );
}

export function Revenue() {
  const { t, eur } = useLang();
  const d = DASHBOARD;
  const max = Math.max(...d.monthlyBars);

  return (
    <div>
      <div className="flex gap-3 mt-4">
        {[
          { l: t("revToday"), n: eur(d.revenueToday) },
          { l: t("revMonth"), n: eur(d.revenueMonth) },
        ].map((m) => (
          <div key={m.l} className="flex-1 rounded-[4px] p-4 bg-panel2 border border-line">
            <div className="text-[12px] text-muted">{m.l}</div>
            <div className="font-serif text-[24px] font-semibold mt-2">{m.n}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mt-5">
        {/* chart */}
        <div className="card p-6">
          <div className="font-serif text-[18px] font-semibold">{t("monthlyRev")}</div>
          <div className="text-muted text-[13px] mt-0.5">
            2026 · {eur(d.revenueYtd)} {t("ytd")}
          </div>
          <div className="flex items-end gap-2.5 h-[180px] mt-[22px]">
            {d.monthlyBars.map((b, i) => (
              <div
                key={i}
                title={eur(b * 1000)}
                className="flex-1 min-h-[6px] transition hover:brightness-110"
                style={{
                  height: `${(b / max) * 100}%`,
                  background: "rgba(198,167,106,.55)",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2.5 mt-2.5">
            {MONTHS.map((m, i) => (
              <span key={i} className="flex-1 text-center text-[11px] text-muted">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* by apartment */}
        <div className="card p-1.5">
          <div className="font-serif text-[18px] font-semibold px-5 pt-4 pb-1">
            {t("revByStay")}
          </div>
          <div className="px-5">
            {APARTMENTS.map((a, i) => (
              <Row key={a.id} k={a.name} v={eur(d.revenueByApartment[i])} />
            ))}
          </div>
        </div>
      </div>

      {/* streams */}
      <div className="card p-1.5 mt-5">
        <div className="font-serif text-[18px] font-semibold px-5 pt-4 pb-1">
          {t("revStreams")}
        </div>
        <div className="px-5 pb-2">
          <Row
            k={`${t("revExtra")} · ${d.extensionsSold} ${t("sales")}`}
            v={eur(d.revenueExtra)}
          />
          <Row
            k={`${t("revLate")} · ${d.lateCheckoutsSold} ${t("sales")}`}
            v={eur(d.revenueLate)}
          />
          <Row k={t("total")} v={eur(d.revenue)} total />
        </div>
      </div>
    </div>
  );
}
