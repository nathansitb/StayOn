"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/agency", label: "Overview" },
  { href: "/agency/bookings", label: "Bookings" },
  { href: "/agency/apartments", label: "Apartments" },
  { href: "/agency/guests", label: "Guests" },
  { href: "/agency/revenue", label: "Revenue" },
  { href: "/agency/connections", label: "Connections" },
  { href: "/agency/notifications", label: "Notifications" },
  { href: "/agency/settings", label: "Settings" },
];

export function AgencyNav({ unread = 0, alerts = 0 }: { unread?: number; alerts?: number }) {
  const path = usePathname();
  return (
    <div className="flex gap-1.5 bg-panel border border-line rounded-[2px] p-[5px] overflow-x-auto no-scrollbar">
      {ITEMS.map((i) => {
        const active = i.href === "/agency" ? path === "/agency" : path.startsWith(i.href);
        const isNotif = i.href === "/agency/notifications";
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`relative px-4 py-2.5 rounded-[2px] text-[11px] uppercase tracking-[1px] whitespace-nowrap transition flex items-center gap-2 ${
              active ? "bg-cream text-[#111] font-medium" : "text-muted hover:text-cream"
            }`}
          >
            {i.label}
            {isNotif && unread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-[#111] text-[10px] font-semibold flex items-center justify-center tracking-normal">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
            {isNotif && unread === 0 && alerts > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#c98b7a]" />}
          </Link>
        );
      })}
    </div>
  );
}
