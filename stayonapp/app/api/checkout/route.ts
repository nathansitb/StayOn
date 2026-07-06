import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for an apartment extension and returns the
 * hosted-payment URL. The booking itself is created by the webhook once the
 * payment actually succeeds (never before).
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
  if (!code || !flow || typeof amount !== "number" || amount <= 0) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: apt } = await admin
    .from("apartments")
    .select("id, name, agency_id")
    .eq("public_code", code)
    .single();
  if (!apt) return Response.json({ error: "Apartment not found" }, { status: 404 });

  const label =
    flow === "night"
      ? `${apt.name} — extra night ×${nights}`
      : flow === "late"
        ? `${apt.name} — late checkout ${lateTime ?? ""}`
        : `${apt.name} — cleaning ${cleaningSlot ?? ""}`;

  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: label },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        code,
        flow,
        nights: String(nights ?? 0),
        lateTime: lateTime ?? "",
        cleaningSlot: cleaningSlot ?? "",
        guestName: guestName ?? "Guest",
        apartment_id: apt.id,
        agency_id: apt.agency_id,
        amount: String(amount),
      },
      success_url: `${origin}/a/${code}?paid=1&flow=${flow}`,
      cancel_url: `${origin}/a/${code}?canceled=1`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Stripe error" },
      { status: 500 }
    );
  }
}
