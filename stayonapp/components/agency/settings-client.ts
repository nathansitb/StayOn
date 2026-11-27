"use client";

import { createClient } from "@/lib/supabase/client";
import { withDefaults, type AgencySettings } from "@/lib/agency-settings";

type Patch = { [K in keyof AgencySettings]?: AgencySettings[K] extends object ? Partial<AgencySettings[K]> : AgencySettings[K] };

/**
 * Merge a partial change into the agency's settings document and save it.
 * Reads the current row first so two tabs never overwrite each other.
 */
export async function saveAgencySettings(agencyId: string, patch: Patch): Promise<{ ok: boolean; error?: string; settings?: AgencySettings }> {
  const supabase = createClient();
  const { data: row, error: readErr } = await supabase.from("agency_settings").select("data").eq("agency_id", agencyId).maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  const current = withDefaults(row?.data);
  const next = { ...current } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch)) {
    const cur = (current as unknown as Record<string, unknown>)[k];
    next[k] = v && typeof v === "object" && !Array.isArray(v) && cur && typeof cur === "object" ? { ...(cur as object), ...(v as object) } : v;
  }
  const { error } = await supabase
    .from("agency_settings")
    .upsert({ agency_id: agencyId, data: next, updated_at: new Date().toISOString() }, { onConflict: "agency_id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, settings: withDefaults(next) };
}
