import { getGuestyToken, listGuestyListings, guestyNightAvailable } from "@/lib/guesty";
import { saveGuestyCredentials } from "@/lib/guesty-store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/guesty/connect
 * body: { clientId, clientSecret, night?, listingId? }
 *
 * Validates an agency's Guesty credentials by fetching a real token and its
 * listings, then stores them for the signed-in agency so StayOn can read
 * availability and block nights after payment.
 */
export async function POST(req: Request) {
  let body: { clientId?: string; clientSecret?: string; night?: string; listingId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { clientId, clientSecret, night, listingId } = body;
  if (!clientId || !clientSecret) {
    return Response.json(
      { ok: false, error: "Missing clientId or clientSecret." },
      { status: 400 }
    );
  }

  try {
    const token = await getGuestyToken(clientId, clientSecret);
    const { listings, total } = await listGuestyListings(token.accessToken);

    // Credentials are valid → store them for the signed-in agency.
    let stored = false;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("agency_id")
          .eq("id", user.id)
          .single();
        if (profile?.agency_id) {
          await saveGuestyCredentials(profile.agency_id as string, clientId, clientSecret);
          stored = true;
        }
      }
    } catch {
      /* validation still succeeds even if storage fails */
    }

    let availability: { listingId: string; night: string; available: boolean } | undefined;
    if (night && listingId) {
      availability = {
        listingId,
        night,
        available: await guestyNightAvailable(token.accessToken, listingId, night),
      };
    }

    return Response.json({
      ok: true,
      total,
      stored,
      listings: listings.slice(0, 20),
      expiresAt: token.expiresAt,
      availability,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Guesty error" },
      { status: 502 }
    );
  }
}
