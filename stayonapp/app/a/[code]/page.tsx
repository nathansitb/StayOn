import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { RealGuestFlow } from "@/components/guest/RealGuestFlow";
import type { DbApartment } from "@/lib/apartment";

export const dynamic = "force-dynamic";

export default async function ApartmentGuestPage({
  params,
}: {
  params: { code: string };
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

  return <RealGuestFlow apt={data as DbApartment} />;
}
