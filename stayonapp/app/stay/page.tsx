import { TopBar } from "@/components/ui/TopBar";
import { Footer } from "@/components/ui/Footer";
import { GuestFlow } from "@/components/guest/GuestFlow";
import { DemoBanner } from "@/components/ui/DemoBanner";

export default function StayPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <TopBar />
      <main className="flex-1 w-full flex justify-center px-3 sm:px-5 pt-2.5 pb-14">
        <GuestFlow />
      </main>
      <Footer />
    </div>
  );
}
