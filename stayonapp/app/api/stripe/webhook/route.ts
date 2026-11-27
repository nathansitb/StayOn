import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, guestEmailHtml, agencyEmailHtml } from "@/lib/email";
import { blockNightsForApartment } from "@/lib/guesty-store";

/** The booked night (extension). Today the guest flow books the next night. */
function tomorrowISO(): string {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
}

interface WSvc {
  flow: "night" | "late" | "cleaning";
  nights: number;
  lateTime: string | null;
  cleaningSlot: string | null;
  amount: number;
  label: string;
}

function legacyLabel(m: Record<string, string>): string {
  if (m.flow === "night") return `Extra night ×${m.nights || 1}`;
  if (m.flow === "late") return `Late checkout ${m.lateTime || ""}`;
  return `Cleaning ${m.cleaningSlot || ""}`;
}

/** Read the selected services from metadata (new multi-service or legacy single). */
function parseServices(m: Record<string, string>): WSvc[] {
  if (m.services) {
    try {
      const arr = JSON.parse(m.services) as Array<{
        f?: string; n?: number; lt?: string; cs?: string; a?: number; l?: string;
      }>;
      if (Array.isArray(arr) && arr.length) {
        return arr.map((x) => ({
          flow: x.f === "late" || x.f === "cleaning" ? x.f : "night",
          nights: Number(x.n || 0),
          lateTime: x.lt || null,
          cleaningSlot: x.cs || null,
          amount: Number(x.a || 0),
          label: x.l || "",
        }));
      }
    } catch {
      /* fall back to legacy */
    }
  }
  return [
    {
      flow: m.flow === "late" || m.flow === "cleaning" ? m.flow : "night",
      nights: Number(m.nights || 0),
      lateTime: m.lateTime || null,
      cleaningSlot: m.cleaningSlot || null,
      amount: Number(m.amount || 0),
      label: legacyLabel(m),
    },
  ];
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
    const totalAmount = Number(m.amount || 0);
    const paymentId = (session.payment_intent as string) || session.id;
    const checkIn = m.checkIn || tomorrowISO();
    const admin = createAdminClient();

    // Idempotency: Stripe may deliver the same event more than once. Multi-service
    // payments store ids as `${paymentId}#i`, so match on the prefix.
    const { data: existing } = await admin
      .from("bookings")
      .select("id")
      .like("stripe_payment_id", `${paymentId}%`)
      .maybeSingle();
    if (existing) {
      return Response.json({ received: true, duplicate: true });
    }

    const services = parseServices(m);

    // One booking row per selected service.
    let firstId: string | null = null;
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      const payId = services.length > 1 ? `${paymentId}#${i}` : paymentId;
      const { data: booking, error: insertError } = await admin
        .from("bookings")
        .insert({
          agency_id: m.agency_id || null,
          apartment_id: m.apartment_id || null,
          guest_name: guestName,
          flow: s.flow,
          nights: s.nights,
          late_time: s.lateTime,
          cleaning_slot: s.cleaningSlot,
          amount: s.amount,
          status: "confirmed",
          stripe_payment_id: payId,
        })
        .select("id")
        .single();

      // Surface DB failures so Stripe retries and we can see them in the dashboard.
      if (insertError) {
        return new Response(`Booking insert failed: ${insertError.message}`, { status: 500 });
      }
      if (!firstId) firstId = booking?.id ?? null;

      // Write-back: block the booked night(s) on Guesty. Best-effort.
      if (s.flow === "night" && m.apartment_id && m.agency_id) {
        await blockNightsForApartment(
          m.apartment_id,
          m.agency_id,
          checkIn,
          s.nights || 1
        ).catch(() => {});
      }
    }

    void firstId;
    // Reference derived from the payment id so it matches the confirmation screen.
    const reference = "SO-" + String(paymentId).slice(-8).toUpperCase();

    // Notify the guest and the agency (best-effort).
    const [{ data: apt }, { data: profs }] = await Promise.all([
      admin.from("apartments").select("name, location").eq("id", m.apartment_id).maybeSingle(),
      admin.from("profiles").select("email").eq("agency_id", m.agency_id).limit(1),
    ]);
    const aptName = apt?.name ?? "your apartment";
    const address = apt?.location ?? "";
    const agencyEmail = profs?.[0]?.email as string | undefined;
    const label = services.map((s) => s.label).join("  +  ");
    const hasNight = services.some((s) => s.flow === "night");
    const when = hasNight ? `From ${checkIn}` : services.map((s) => s.label).join(", ");
    const amountStr = "€" + totalAmount.toLocaleString("en-US");

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
