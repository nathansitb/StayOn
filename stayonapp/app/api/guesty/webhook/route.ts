import { refreshAvailabilityForListing } from "@/lib/guesty-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/guesty/webhook?secret=...
 *
 * Guesty calls this whenever something changes (a reservation is created,
 * updated or cancelled, or a calendar day changes). We use it to keep StayOn's
 * local availability cache in sync, so a night that gets booked elsewhere is
 * never sold again through StayOn.
 *
 * In the agency's Guesty account, register this URL as a webhook:
 *   https://stay-on.app/api/guesty/webhook?secret=YOUR_SECRET
 * and set GUESTY_WEBHOOK_SECRET to the same value in your env.
 */

function extractListingId(evt: unknown): string | null {
  const e = evt as Record<string, unknown>;
  const candidates: unknown[] = [
    e?.listingId,
    (e?.listing as Record<string, unknown>)?._id,
    (e?.reservation as Record<string, unknown>)?.listingId,
    ((e?.reservation as Record<string, unknown>)?.listing as Record<string, unknown>)?._id,
    (e?.payload as Record<string, unknown>)?.listingId,
    (e?.data as Record<string, unknown>)?.listingId,
  ];
  const found = candidates.find((v) => typeof v === "string" && v.length > 0);
  return (found as string) ?? null;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.GUESTY_WEBHOOK_SECRET;
  if (secret && url.searchParams.get("secret") !== secret) {
    return new Response("Forbidden", { status: 401 });
  }

  let event: unknown;
  try {
    event = await req.json();
  } catch {
    // Always ack so Guesty doesn't hammer retries on a malformed body.
    return Response.json({ received: true });
  }

  const listingId = extractListingId(event);
  if (listingId) {
    // Fire-and-forget: refresh this listing's availability from Guesty.
    await refreshAvailabilityForListing(listingId).catch(() => {});
  }

  return Response.json({ received: true, listingId: listingId ?? undefined });
}

// Guesty may send a GET to verify the endpoint exists.
export async function GET() {
  return Response.json({ ok: true, service: "stayon-guesty-webhook" });
}
