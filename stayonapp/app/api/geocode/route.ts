export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/geocode?q=<address>
 * Turns a free-text address into coordinates using OpenStreetMap Nominatim
 * (free, no key). Used when an agency saves an apartment so we can later find
 * the nearest available ones.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q");
  if (!q || q.trim().length < 3) {
    return Response.json({ found: false });
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent": "StayOn/1.0 (contact@stay-on.app)",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    const j = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!Array.isArray(j) || !j.length) return Response.json({ found: false });
    return Response.json({
      found: true,
      lat: Number(j[0].lat),
      lng: Number(j[0].lon),
      display: j[0].display_name,
    });
  } catch {
    return Response.json({ found: false, error: "geocode failed" }, { status: 502 });
  }
}
