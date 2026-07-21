import { TopBar } from "@/components/ui/TopBar";
import { Footer } from "@/components/ui/Footer";
import { RealGuestFlow } from "@/components/guest/RealGuestFlow";
import { DemoBanner } from "@/components/ui/DemoBanner";
import type { DbApartment } from "@/lib/apartment";

/**
 * Public demo of the guest journey. It renders the exact same component as the
 * real per-apartment page (/a/[code]), with sample data — so the demo always
 * matches the live app. The demo "apartment" has no real code, so paying just
 * shows the confirmation screen (no Stripe charge), and no calendar is checked.
 */
const DEMO_APT: DbApartment = {
  id: "demo",
  public_code: "demo",
  name: "Champs Élysées",
  location: "Paris 8ème",
  image_url: null,
  extend_price: 600,
  extra_night: true,
  late_checkout: true,
  cleaning: true,
  ical_url: null,
  agency_id: "demo",
};

export default function StayPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <TopBar />
      <main className="flex-1 w-full flex justify-center">
        <RealGuestFlow apt={DEMO_APT} />
      </main>
      <Footer />
    </div>
  );
}
