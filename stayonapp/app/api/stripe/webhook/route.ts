import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook
 * Stripe calls this after a payment. On checkout.session.completed we create
 * the booking in the database — so a booking only exists once money is in.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new Response("Webhook not configured", { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return new Response(
      `Signature error: ${e instanceof Error ? e.message : "invalid"}`,
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata ?? {};
    const admin = createAdminClient();
    await admin.from("bookings").insert({
      agency_id: m.agency_id || null,
      apartment_id: m.apartment_id || null,
      guest_name: m.guestName || "Guest",
      flow: m.flow || "night",
      nights: Number(m.nights || 0),
      late_time: m.lateTime || null,
      cleaning_slot: m.cleaningSlot || null,
      amount: Number(m.amount || 0),
      status: "confirmed",
      stripe_payment_id: (session.payment_intent as string) || session.id,
    });
  }

  return Response.json({ received: true });
}
