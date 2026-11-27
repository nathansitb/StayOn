import { createAdminClient } from "@/lib/supabase/server";
import { checkIcalAvailability } from "@/lib/ical";
import { getAgencyGuestyToken } from "@/lib/guesty-store";
import { guestyNightAvailable } from "@/lib/guesty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/nearby?code=<publicCode>&night=YYYY-MM-DD
 * When an apartment is unavailable, returns up to 3 of the agency's OTHER
 * apartments that are closest AND available for that night.
 */

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const night = searchParams.get("night");
  if (!code) return Response.json({ results: [] });

  const admin = createAdminClient();
  const { data: origin } = await admin
    .from("apartments")
    .select("id, agency_id, lat, lng")
    .eq("public_code", code)
    .maybeSingle();
  if (!origin || origin.lat == null || origin.lng == null) {
    return Response.json({ results: [] });
  }

  const { data: others } = await admin
    .from("apartments")
    .select("public_code, name, location, image_url, lat, lng, ical_url, guesty_listing_id, agency_id")
    .eq("agency_id", origin.agency_id)
    .neq("id", origin.id);

  const ranked = (others ?? [])
    .filter((a) => a.lat != null && a.lng != null)
    .map((a) => ({ ...a, dist: haversineKm(origin.lat as number, origin.lng as number, a.lat as number, a.lng as number) }))
    .sort((x, y) => x.dist - y.dist)
    .slice(0, 6);

  const results: Array<{ public_code: string; name: string; location: string | null; image_url: string | null; km: number }> = [];
  for (const a of ranked) {
    let available = true;
    if (night) {
      try {
        if (a.ical_url) {
          available = (await checkIcalAvailability(a.ical_url, night)).available;
        } else if (a.guesty_listing_id) {
          const token = await getAgencyGuestyToken(a.agency_id as string);
          if (token) available = await guestyNightAvailable(token, a.guesty_listing_id as string, night);
        }
      } catch {
        available = true; // if we can't check, don't hide it
      }
    }
    if (available) {
      results.push({
        public_code: a.public_code as string,
        name: a.name as string,
        location: (a.location as string | null) ?? null,
        image_url: (a.image_url as string | null) ?? null,
        km: Math.round((a.dist as number) * 10) / 10,
      });
    }
    if (results.length >= 3) break;
  }

  return Response.json({ results });
}
