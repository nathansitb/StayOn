"use client";

import { useState } from "react";
import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";
import { timeAgo } from "@/lib/time";

type Filter = "all" | "night" | "late" | "cleaning";

export function Bookings() {
  const { t, eur } = useLang();
  const { bookings } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = bookings.filter((b) =>
    filter === "all" ? true : b.flow === filter
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "night", label: t("filterExt") },
    { id: "late", label: t("filterLate") },
    { id: "cleaning", label: t("cleaningWord") },
  ];

  return (
    <div className="card p-1.5 mt-1">
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-[18px] font-semibold">
            {t("bookingsTitle")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[1px] text-[#9ccf9c] border border-[rgba(120,180,120,.35)] rounded-[2px] px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7fc47f] animate-pulse" />
            {t("live")}
          </span>
        </div>
        <div className="flex gap-1 bg-panel2 rounded-[2px] p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-[2px] text-[11px] uppercase tracking-[.5px] transition ${
                filter === f.id ? "bg-cream text-[#111] font-medium" : "text-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_1.4fr_1fr_.9fr] gap-3 px-5 py-3 text-[11.5px] tracking-[.6px] uppercase text-muted border-b border-line">
        <div>{t("colGuest")}</div>
        <div>{t("colApt")}</div>
        <div>{t("colType")}</div>
        <div>{t("colWhen")}</div>
        <div className="text-right">{t("colAmount")}</div>
      </div>

      {rows.map((b) => (
        <div
          key={b.id}
          className="grid grid-cols-2 md:grid-cols-[1.4fr_1.6fr_1.4fr_1fr_.9fr] gap-2 md:gap-3 px-4 md:px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-full bg-panel2 border border-line flex items-center justify-center text-[12px] text-gold shrink-0">
              {b.guestName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </span>
            <span className="truncate font-medium">{b.guestName}</span>
          </div>
          <div className="truncate text-creamDim">{b.apartmentName}</div>
          <div>
            <span
              className={`pill ${b.flow === "night" ? "pill-on" : "pill-off"}`}
            >
              {b.flow === "night"
                ? `${t("extraNight")} ×${b.nights}`
                : b.flow === "late"
                  ? `${t("lateCheckout")} ${b.lateTime ?? ""}`
                  : `${t("cleaningWord")} ${b.cleaningSlot ?? ""}`}
            </span>
          </div>
          <div className="text-muted text-[13px]">{timeAgo(b.createdAt, t)}</div>
          <div className="text-right font-serif text-[16px] font-semibold">
            {eur(b.price)}
          </div>
        </div>
      ))}
    </div>
  );
}
