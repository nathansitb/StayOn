import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { RealGuestFlow } from "@/components/guest/RealGuestFlow";
import type { DbApartment } from "@/lib/apartment";

export const dynamic = "force-dynamic";

export default async function ApartmentGuestPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { paid?: string; canceled?: string };
}) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("apartments")
    .select(
      "id, public_code, name, location, image_url, extend_price, extra_night, late_checkout, cleaning, ical_url, agency_id, late_prices, cleaning_prices"
    )
    .eq("public_code", params.code)
    .single();

  if (!data) notFound();

  // Count a scan on a fresh open (not the redirect back from Stripe).
  if (!searchParams?.paid && !searchParams?.canceled) {
    try {
      await admin.from("scans").insert({ apartment_id: data.id, agency_id: data.agency_id });
    } catch {
      /* never block the guest page on analytics */
    }
  }

  return <RealGuestFlow apt={data as DbApartment} />;
}
