import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, guestEmailHtml, agencyEmailHtml } from "@/lib/email";

function typeLabel(m: Record<string, string>): string {
  if (m.flow === "night") return `Extra night ×${m.nights || 1}`;
  if (m.flow === "late") return `Late checkout ${m.lateTime || ""}`;
  return `Cleaning ${m.cleaningSlot || ""}`;
}

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
    const m = (session.metadata ?? {}) as Record<string, string>;
    const guestEmail = session.customer_details?.email ?? null;
    const guestName = session.customer_details?.name || guestEmail || m.guestName || "Guest";
    const amount = Number(m.amount || 0);
    const admin = createAdminClient();

    const { data: booking } = await admin
      .from("bookings")
      .insert({
        agency_id: m.agency_id || null,
        apartment_id: m.apartment_id || null,
        guest_name: guestName,
        flow: m.flow || "night",
        nights: Number(m.nights || 0),
        late_time: m.lateTime || null,
        cleaning_slot: m.cleaningSlot || null,
        amount,
        status: "confirmed",
        stripe_payment_id: (session.payment_intent as string) || session.id,
      })
      .select("id")
      .single();

    const reference =
      "SO-" + (booking?.id ? booking.id.slice(0, 8) : session.id.slice(-8)).toUpperCase();

    // Notify the guest and the agency (best-effort).
    const [{ data: apt }, { data: profs }] = await Promise.all([
      admin.from("apartments").select("name, location").eq("id", m.apartment_id).maybeSingle(),
      admin.from("profiles").select("email").eq("agency_id", m.agency_id).limit(1),
    ]);
    const aptName = apt?.name ?? "your apartment";
    const address = apt?.location ?? "";
    const agencyEmail = profs?.[0]?.email as string | undefined;
    const label = typeLabel(m);
    const nightsN = Number(m.nights || 1);
    const when =
      m.flow === "night"
        ? `${nightsN} night${nightsN > 1 ? "s" : ""}`
        : m.flow === "late"
          ? `Checkout at ${m.lateTime || ""}`
          : m.cleaningSlot || "";
    const amountStr = "€" + amount.toLocaleString("en-US");

    if (guestEmail) {
      await sendEmail({
        to: guestEmail,
        subject: "Your StayOn booking is confirmed",
        html: guestEmailHtml({ aptName, address, typeLabel: label, when, amount: amountStr, reference }),
      });
    }
    if (agencyEmail) {
      await sendEmail({
        to: agencyEmail,
        subject: `New booking · ${aptName}`,
        html: agencyEmailHtml({ aptName, address, typeLabel: label, amount: amountStr, guest: guestName, reference }),
      });
    }
  }

  return Response.json({ received: true });
}
