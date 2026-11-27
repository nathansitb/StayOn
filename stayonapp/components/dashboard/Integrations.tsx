"use client";

import { useLang } from "@/lib/store";
import { INTEGRATIONS } from "@/lib/data";

export function Integrations() {
  const { t } = useLang();
  return (
    <div className="card p-5 mt-5">
      <div className="font-serif text-[18px] font-semibold pb-1">
        {t("integrationsTitle")}
      </div>
      <div className="flex flex-wrap gap-2.5 mt-4">
        {INTEGRATIONS.map((it) => (
          <span
            key={it.name}
            className="px-3.5 py-2 rounded-[2px] border border-line bg-panel text-[11px] uppercase tracking-[1px] text-creamDim flex items-center gap-1.5"
          >
            <span
              className="w-[7px] h-[7px] rounded-full"
              style={{
                background: it.live ? "#7fc47f" : "#8b857a",
                boxShadow: it.live ? "0 0 0 3px rgba(127,196,127,.15)" : "none",
              }}
            />
            {it.name}
          </span>
        ))}
      </div>
    </div>
  );
}
