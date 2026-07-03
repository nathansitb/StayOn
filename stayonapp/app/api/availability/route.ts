import { checkIcalAvailability } from "@/lib/ical";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/availability?url=<ics>&night=YYYY-MM-DD
 * Reads a real iCal feed server-side and says whether that night is free.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const night = searchParams.get("night");

  if (!url || !night) {
    return Response.json({ error: "Missing 'url' or 'night'." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(night)) {
    return Response.json({ error: "night must be YYYY-MM-DD." }, { status: 400 });
  }

  try {
    const { available, blockedCount } = await checkIcalAvailability(url, night);
    return Response.json({ available, blockedCount, night, source: "ical" });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "iCal error" },
      { status: 502 }
    );
  }
}
