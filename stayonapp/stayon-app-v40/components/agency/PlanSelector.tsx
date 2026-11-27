"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PlanSelector({ agencyId, plan }: { agencyId: string; plan: string }) {
  const supabase = createClient();
  const [current, setCurrent] = useState(plan);
  const [busy, setBusy] = useState(false);

  async function pick(p: string) {
    if (busy || p === current) return;
    setBusy(true);
    const { error } = await supabase.from("agencies").update({ plan: p }).eq("id", agencyId);
    if (!error) setCurrent(p);
    setBusy(false);
  }

  return (
    <div className="flex gap-3">
      {[
        { id: "free", label: "Free", price: "€0" },
        { id: "premium", label: "Premium", price: "€19 / mo · per apt" },
      ].map((p) => (
        <button
          key={p.id}
          onClick={() => pick(p.id)}
          disabled={busy}
          className={`flex-1 rounded-[3px] border p-4 text-left transition ${
            current === p.id ? "border-gold bg-[rgba(198,167,106,.08)]" : "border-line bg-panel2"
          }`}
        >
          <div className="font-serif text-[17px] font-semibold">{p.label}</div>
          <div className="text-[12px] text-muted mt-1">{p.price}</div>
        </button>
      ))}
    </div>
  );
}
