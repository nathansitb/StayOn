"use client";

import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";
import { INTEGRATIONS } from "@/lib/data";

export function Settings() {
  const { t } = useLang();
  const { host, setPlan, reset } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1">
      <div className="card p-6">
        <div className="font-serif text-[18px] font-semibold">
          {t("currentPlan")}
        </div>
        <div className="flex items-center gap-3 mt-4">
          {(["free", "premium"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`flex-1 rounded-xl border p-4 text-left transition ${
                host.plan === p
                  ? "border-gold bg-[rgba(198,167,106,.08)]"
                  : "border-line bg-panel2"
              }`}
            >
              <div className="font-serif text-[17px] font-semibold capitalize">
                {p === "free" ? "Free" : "Premium"}
              </div>
              <div className="text-[13px] text-muted mt-1">
                {p === "free" ? "€0" : "€19 / mo · per apt"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="font-serif text-[18px] font-semibold">{t("payouts")}</div>
        <div className="flex items-center justify-between mt-4 text-[14px]">
          <span className="text-muted">Stripe</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7fc47f]" /> {t("payoutsVal")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          {INTEGRATIONS.map((it) => (
            <span
              key={it.name}
              className="px-3 py-1.5 rounded-[2px] border border-line bg-panel2 text-[11px] uppercase tracking-[1px] text-creamDim flex items-center gap-1.5"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: it.live ? "#7fc47f" : "#8b857a" }}
              />
              {it.name}
            </span>
          ))}
        </div>
      </div>

      <div className="card p-6 lg:col-span-2 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-serif text-[16px] font-semibold">{t("resetDemo")}</div>
          <div className="text-[13px] text-muted mt-1">
            {t("footer")}
          </div>
        </div>
        <button onClick={reset} className="btn btn-dark !w-auto px-6">
          {t("resetDemo")}
        </button>
      </div>
    </div>
  );
}
