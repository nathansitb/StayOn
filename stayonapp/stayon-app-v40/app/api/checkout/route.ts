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
interface ServiceIn {
  flow: "night" | "late" | "cleaning";
  nights?: number;
  lateTime?: string | null;
  cleaningSlot?: string | null;
  amount: number;
  label?: string;
}

export async function POST(req: Request) {
  let body: {
    code?: string;
    // New: one or more services in a single payment.
    services?: ServiceIn[];
    checkIn?: string;
    // Legacy single-service fields (still supported).
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

  const { code, guestName, checkIn } = body;
  if (!code) return Response.json({ error: "Missing code" }, { status: 400 });

  // Normalise to a services array (accept legacy single-service payloads).
  const services: ServiceIn[] =
    body.services && body.services.length
      ? body.services
      : body.flow && typeof body.amount === "number"
        ? [
            {
              flow: body.flow,
              nights: body.nights,
              lateTime: body.lateTime,
              cleaningSlot: body.cleaningSlot,
              amount: body.amount,
            },
          ]
        : [];

  const total = services.reduce((s, x) => s + (x.amount || 0), 0);
  if (!services.length || total <= 0) {
    return Response.json({ error: "No valid services" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: apt } = await admin
    .from("apartments")
    .select("id, name, agency_id")
    .eq("public_code", code)
    .single();
  if (!apt) return Response.json({ error: "Apartment not found" }, { status: 404 });

  function labelFor(s: ServiceIn): string {
    if (s.label) return s.label;
    if (s.flow === "night") return `extra night ×${s.nights ?? 1}`;
    if (s.flow === "late") return `late checkout ${s.lateTime ?? ""}`;
    return `cleaning ${s.cleaningSlot ?? ""}`;
  }

  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: services.map((s) => ({
        price_data: {
          currency: "eur",
          product_data: { name: `${apt.name} — ${labelFor(s)}` },
          unit_amount: Math.round(s.amount * 100),
        },
        quantity: 1,
      })),
      metadata: {
        code,
        // Compact JSON of the services, parsed by the webhook.
        services: JSON.stringify(
          services.map((s) => ({
            f: s.flow,
            n: s.nights ?? 0,
            lt: s.lateTime ?? "",
            cs: s.cleaningSlot ?? "",
            a: s.amount,
            l: labelFor(s),
          }))
        ).slice(0, 480),
        checkIn: checkIn ?? "",
        guestName: guestName ?? "Guest",
        apartment_id: apt.id,
        agency_id: apt.agency_id,
        amount: String(total),
      },
      success_url: `${origin}/a/${code}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
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
