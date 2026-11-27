import { LandingNav } from "@/components/landing/LandingNav";
import { Landing } from "@/components/landing/Landing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <Landing />
    </div>
  );
}
