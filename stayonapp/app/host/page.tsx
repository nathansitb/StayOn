import { TopBar } from "@/components/ui/TopBar";
import { Footer } from "@/components/ui/Footer";
import { HostOnboarding } from "@/components/host/HostOnboarding";
import { DemoBanner } from "@/components/ui/DemoBanner";

export default function HostPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <TopBar />
      <main className="flex-1 w-full">
        <HostOnboarding />
      </main>
      <Footer />
    </div>
  );
}
