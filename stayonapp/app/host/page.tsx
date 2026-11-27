import { TopBar } from "@/components/ui/TopBar";
import { Footer } from "@/components/ui/Footer";
import { HostOnboarding } from "@/components/host/HostOnboarding";

export default function HostPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 w-full">
        <HostOnboarding />
      </main>
      <Footer />
    </div>
  );
}
