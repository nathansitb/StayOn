"use client";

import { useMemo } from "react";
import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";

export function Clients() {
  const { t, eur } = useLang();
  const { bookings } = useApp();

  const clients = useMemo(() => {
    const map = new Map<string, { name: string; stays: number; spent: number; last: number }>();
    for (const b of bookings) {
      const c = map.get(b.guestName) ?? { name: b.guestName, stays: 0, spent: 0, last: 0 };
      c.stays += 1;
      c.spent += b.price;
      c.last = Math.max(c.last, b.createdAt);
      map.set(b.guestName, c);
    }
    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [bookings]);

  return (
    <div className="card p-1.5 mt-1">
      <div className="font-serif text-[18px] font-semibold px-5 pt-4 pb-2">
        {t("clientsTitle")}
      </div>
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] gap-3 px-5 py-3 text-[11.5px] tracking-[.6px] uppercase text-muted border-b border-line">
        <div>{t("colGuest")}</div>
        <div>{t("colStays")}</div>
        <div className="text-right">{t("colSpent")}</div>
      </div>
      {clients.map((c) => (
        <div
          key={c.name}
          className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-2 md:gap-3 px-4 md:px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-panel2 border border-line flex items-center justify-center text-[13px] text-gold shrink-0">
              {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </span>
            <span className="truncate font-medium">{c.name}</span>
          </div>
          <div className="text-creamDim">
            <span className="md:hidden text-muted text-[12px] uppercase mr-2">
              {t("colStays")}
            </span>
            {c.stays}
          </div>
          <div className="text-right font-serif text-[16px] font-semibold">
            {eur(c.spent)}
          </div>
        </div>
      ))}
    </div>
  );
}
