"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/agency", label: "Overview" },
  { href: "/agency/apartments", label: "Apartments" },
  { href: "/agency/bookings", label: "Bookings" },
  { href: "/agency/connections", label: "Connections" },
  { href: "/agency/settings", label: "Settings" },
];

export function AgencyNav() {
  const path = usePathname();
  return (
    <div className="flex gap-1.5 bg-panel border border-line rounded-[2px] p-[5px] overflow-x-auto no-scrollbar">
      {ITEMS.map((i) => {
        const active = i.href === "/agency" ? path === "/agency" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`px-4 py-2.5 rounded-[2px] text-[11px] uppercase tracking-[1px] whitespace-nowrap transition ${
              active ? "bg-cream text-[#111] font-medium" : "text-muted hover:text-cream"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </div>
  );
}
