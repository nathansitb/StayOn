import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, guestEmailHtml, agencyEmailHtml } from "@/lib/email";
import { blockNightsForApartment } from "@/lib/guesty-store";

/** The booked night (extension). Today the guest flow books the next night. */
function tomorrowISO(): string {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
}

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
    const paymentId = (session.payment_intent as string) || session.id;
    const admin = createAdminClient();

    // Idempotency: Stripe may deliver the same event more than once.
    const { data: existing } = await admin
      .from("bookings")
      .select("id")
      .eq("stripe_payment_id", paymentId)
      .maybeSingle();
    if (existing) {
      return Response.json({ received: true, duplicate: true });
    }

    const { data: booking, error: insertError } = await admin
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
        stripe_payment_id: paymentId,
      })
      .select("id")
      .single();

    // Surface DB failures so Stripe retries and we can see them in the dashboard.
    if (insertError) {
      return new Response(`Booking insert failed: ${insertError.message}`, {
        status: 500,
      });
    }

    const reference =
      "SO-" + (booking?.id ? booking.id.slice(0, 8) : session.id.slice(-8)).toUpperCase();

    // Write-back: for an extra-night booking, block the night on Guesty so it
    // can't be re-sold on any channel. Best-effort — never blocks the response.
    if (m.flow === "night" && m.apartment_id && m.agency_id) {
      await blockNightsForApartment(
        m.apartment_id,
        m.agency_id,
        tomorrowISO(),
        Number(m.nights || 1)
      ).catch(() => {});
    }

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
