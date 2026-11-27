"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAgencySettings } from "./settings-client";

export function MarkAllRead({ agencyId, disabled }: { agencyId: string; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy || disabled}
      onClick={async () => {
        setBusy(true);
        await saveAgencySettings(agencyId, { notificationsSeenAt: new Date().toISOString() });
        setBusy(false);
        router.refresh();
      }}
      className="text-[11px] uppercase tracking-[1px] border border-line rounded-[2px] px-3 py-2 text-muted hover:text-cream transition disabled:opacity-40"
    >
      {busy ? "…" : "Mark all as read"}
    </button>
  );
}
