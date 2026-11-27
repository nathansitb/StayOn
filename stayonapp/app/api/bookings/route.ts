import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bookings
 * Guest-facing (no session): creates a booking for the apartment identified by
 * its public code. Uses the service-role client so it works without a login,
 * and ties the booking to the right apartment + agency.
 */
export async function POST(req: Request) {
  let body: {
    code?: string;
    flow?: "night" | "late" | "cleaning";
    nights?: number;
    lateTime?: string | null;
    cleaningSlot?: string | null;
    amount?: number;
    guestName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { code, flow, nights, lateTime, cleaningSlot, amount, guestName } = body;
  if (!code || !flow || typeof amount !== "number") {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: apt } = await admin
    .from("apartments")
    .select("id, agency_id")
    .eq("public_code", code)
    .single();

  if (!apt) return Response.json({ error: "Apartment not found" }, { status: 404 });

  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      agency_id: apt.agency_id,
      apartment_id: apt.id,
      guest_name: guestName ?? "Guest",
      flow,
      nights: nights ?? 0,
      late_time: lateTime ?? null,
      cleaning_slot: cleaningSlot ?? null,
      amount,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, id: booking?.id });
}
