"use client";

import { useState } from "react";
import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";
import { Overview } from "./Overview";
import { Apartments } from "./Apartments";
import { Revenue } from "./Revenue";
import { Bookings } from "./Bookings";
import { Clients } from "./Clients";
import { Notifications } from "./Notifications";
import { Settings } from "./Settings";
import { Connections } from "./Connections";

type Tab =
  | "overview"
  | "bookings"
  | "apts"
  | "clients"
  | "revenue"
  | "connect"
  | "notifs"
  | "settings";

export function Dashboard() {
  const { t } = useLang();
  const { notifications } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const unread = notifications.filter((n) => !n.read).length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: t("tabOverview") },
    { id: "bookings", label: t("tabBookings") },
    { id: "apts", label: t("tabApts") },
    { id: "clients", label: t("tabClients") },
    { id: "revenue", label: t("tabRevenue") },
    { id: "connect", label: t("tabConnect") },
    { id: "notifs", label: t("tabNotifs"), badge: unread },
    { id: "settings", label: t("tabSettings") },
  ];

  return (
    <div className="w-full max-w-[1180px] mx-auto animate-fade">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="font-serif text-[32px] font-semibold">
            {t("dashTitle")}
          </div>
          <div className="text-muted text-[14px] mt-1.5">{t("dashSub")}</div>
        </div>
      </div>

      {/* scrollable tab bar */}
      <div className="flex gap-1.5 bg-panel border border-line rounded-[2px] p-[5px] mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`px-4 py-2.5 rounded-[2px] text-[12px] uppercase tracking-[1px] whitespace-nowrap transition flex items-center gap-2 ${
              tab === tb.id ? "bg-cream text-[#111] font-medium" : "text-muted"
            }`}
          >
            {tb.label}
            {tb.badge ? (
              <span
                className={`text-[11px] rounded-full w-[18px] h-[18px] flex items-center justify-center ${
                  tab === tb.id ? "bg-[#111] text-cream" : "bg-gold text-[#1a1406]"
                }`}
              >
                {tb.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "bookings" && <Bookings />}
      {tab === "apts" && <Apartments />}
      {tab === "clients" && <Clients />}
      {tab === "revenue" && <Revenue />}
      {tab === "connect" && <Connections />}
      {tab === "notifs" && <Notifications />}
      {tab === "settings" && <Settings />}
    </div>
  );
}
