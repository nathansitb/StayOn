"use client";

import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";
import { timeAgo } from "@/lib/time";

const ICON: Record<string, string> = {
  extension: "↗",
  late: "◷",
  cleaning: "✽",
  listing: "✦",
};

export function Notifications() {
  const { t } = useLang();
  const { notifications, markAllRead } = useApp();

  return (
    <div className="card p-1.5 mt-1">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="font-serif text-[18px] font-semibold">
          {t("notifsTitle")}
        </span>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-[12.5px] text-muted hover:text-cream transition"
          >
            {t("markAllRead")}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-5 py-12 text-center text-muted text-[14px]">
          {t("noNotifs")}
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-center gap-3.5 px-5 py-3.5 border-b border-line last:border-b-0"
          >
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] shrink-0 ${
                n.read ? "bg-panel2 text-muted" : "bg-[rgba(198,167,106,.14)] text-gold"
              }`}
            >
              {ICON[n.kind] ?? "•"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium truncate">{n.title}</div>
              <div className="text-[12.5px] text-muted">{n.detail}</div>
            </div>
            <div className="text-[12px] text-muted shrink-0">
              {timeAgo(n.createdAt, t)}
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
          </div>
        ))
      )}
    </div>
  );
}
