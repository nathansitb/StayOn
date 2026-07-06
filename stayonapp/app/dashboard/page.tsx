import { TopBar } from "@/components/ui/TopBar";
import { Footer } from "@/components/ui/Footer";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DemoBanner } from "@/components/ui/DemoBanner";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <TopBar />
      <main className="flex-1 w-full px-4 sm:px-7 pt-2 pb-14">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}
