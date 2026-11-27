/**
 * Server-side Guesty glue for StayOn.
 *
 * - Stores each agency's Guesty credentials (service-role only).
 * - Exchanges them for an access token, cached in memory for its lifetime
 *   (Guesty allows only 5 token requests / 24h, so we never fetch per call).
 * - Blocks nights after payment (write-back) and refreshes the local
 *   availability cache from Guesty webhooks.
 *
 * Everything here runs server-side only. Secrets never reach the browser.
 */

import { createAdminClient } from "@/lib/supabase/server";
import {
  getGuestyToken,
  getGuestyCalendar,
  blockGuestyDates,
  type GuestyToken,
} from "@/lib/guesty";

const tokenCache = new Map<string, GuestyToken>();

/** Save / update an agency's Guesty credentials. */
export async function saveGuestyCredentials(
  agencyId: string,
  clientId: string,
  clientSecret: string
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("guesty_credentials").upsert(
    {
      agency_id: agencyId,
      client_id: clientId,
      client_secret: clientSecret,
      status: "connected",
      connected_at: new Date().toISOString(),
    },
    { onConflict: "agency_id" }
  );
  tokenCache.delete(agencyId);
}

/** Get a valid Guesty access token for an agency, or null if not connected. */
export async function getAgencyGuestyToken(agencyId: string): Promise<string | null> {
  const cached = tokenCache.get(agencyId);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.accessToken;

  const admin = createAdminClient();
  const { data } = await admin
    .from("guesty_credentials")
    .select("client_id, client_secret")
    .eq("agency_id", agencyId)
    .maybeSingle();
  if (!data?.client_id || !data?.client_secret) return null;

  try {
    const token = await getGuestyToken(data.client_id, data.client_secret);
    tokenCache.set(agencyId, token);
    return token.accessToken;
  } catch {
    return null;
  }
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Write-back: after a paid extension, block the booked night(s) on Guesty so
 * the room can't be sold again on any channel. Best-effort — never throws.
 */
export async function blockNightsForApartment(
  apartmentId: string,
  agencyId: string,
  startNight: string,
  nights: number
): Promise<{ blocked: boolean; reason?: string }> {
  try {
    const admin = createAdminClient();
    const { data: apt } = await admin
      .from("apartments")
      .select("guesty_listing_id")
      .eq("id", apartmentId)
      .maybeSingle();
    const listingId = apt?.guesty_listing_id as string | undefined;
    if (!listingId) return { blocked: false, reason: "no Guesty listing linked" };

    const token = await getAgencyGuestyToken(agencyId);
    if (!token) return { blocked: false, reason: "agency not connected to Guesty" };

    const endNight = addDaysISO(startNight, Math.max(1, nights) - 1);
    await blockGuestyDates(token, listingId, startNight, endNight);
    return { blocked: true };
  } catch (e) {
    return { blocked: false, reason: e instanceof Error ? e.message : "error" };
  }
}

/**
 * Refresh the local availability cache for the apartment linked to a Guesty
 * listing (called from the Guesty webhook). Best-effort — never throws.
 */
export async function refreshAvailabilityForListing(
  listingId: string,
  days = 120
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: apt } = await admin
      .from("apartments")
      .select("id, agency_id")
      .eq("guesty_listing_id", listingId)
      .maybeSingle();
    if (!apt) return;

    const token = await getAgencyGuestyToken(apt.agency_id as string);
    if (!token) return;

    const start = new Date().toISOString().slice(0, 10);
    const end = addDaysISO(start, days);
    const cal = await getGuestyCalendar(token, listingId, start, end);
    if (!cal.length) return;

    const rows = cal.map((d) => ({
      apartment_id: apt.id as string,
      night: d.date,
      blocked: !d.available,
      synced_at: new Date().toISOString(),
    }));
    await admin.from("availability").upsert(rows, { onConflict: "apartment_id,night" });
  } catch {
    /* best-effort */
  }
}
