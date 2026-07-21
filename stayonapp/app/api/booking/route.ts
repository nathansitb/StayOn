import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/booking?session_id=cs_...
 * After returning from Stripe, the confirmation screen calls this to show the
 * real booking details (reference, services, total). Built from the Checkout
 * Session metadata, so it works even before the webhook has finished.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id) return Response.json({ found: false });

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    const m = (session.metadata ?? {}) as Record<string, string>;
    const paymentId = (session.payment_intent as string) || session.id;
    const reference = "SO-" + String(paymentId).slice(-8).toUpperCase();

    let services: Array<{ label: string; amount: number }> = [];
    try {
      const arr = JSON.parse(m.services || "[]") as Array<{ l?: string; a?: number }>;
      services = arr.map((x) => ({ label: x.l || "Service", amount: Number(x.a || 0) }));
    } catch {
      /* fall through */
    }
    if (!services.length && m.flow) {
      services = [{ label: m.flow, amount: Number(m.amount || 0) }];
    }

    let aptName = "your apartment";
    if (m.apartment_id) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("apartments")
        .select("name")
        .eq("id", m.apartment_id)
        .maybeSingle();
      if (data?.name) aptName = data.name as string;
    }

    return Response.json({
      found: true,
      reference,
      aptName,
      checkIn: m.checkIn || "",
      total: Number(m.amount || 0),
      services,
      email: session.customer_details?.email ?? null,
    });
  } catch {
    return Response.json({ found: false });
  }
}
