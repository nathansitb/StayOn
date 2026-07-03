import { getGuestyToken, listGuestyListings, guestyNightAvailable } from "@/lib/guesty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/guesty/connect
 * body: { clientId, clientSecret, night?, listingId? }
 *
 * Validates an agency's Guesty credentials by fetching a real token and its
 * listings. Optionally checks availability for one listing/night.
 * (In production the token/secret are stored encrypted per agency — Phase 0.)
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
