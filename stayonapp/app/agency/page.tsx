import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AgencyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (profile?.role === "super_admin") redirect("/admin");

  const { data: agency } = await supabase
    .from("agencies")
    .select("name, plan")
    .eq("id", profile?.agency_id)
    .single();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-[1180px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-cream">
            <Logo size={22} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-muted hidden sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-12">
        <div className="text-[11px] uppercase tracking-[2px] text-gold">Agency space</div>
        <h1 className="font-serif text-[34px] font-semibold mt-3">
          {agency?.name ?? "Your agency"}
        </h1>
        <p className="text-muted text-[14px] mt-2">
          Signed in as {user.email} · plan: {agency?.plan ?? "free"}
        </p>

        <div className="card p-8 mt-8 max-w-[560px]">
          <div className="font-serif text-[18px] font-semibold">You&apos;re connected. ✓</div>
          <p className="text-creamDim text-[14px] leading-[1.6] mt-3">
            Your account and agency are live in the database. Next, we add your
            apartments here — each one gets its own unique link &amp; QR code, plus
            iCal / Guesty / Stripe connections.
          </p>
          <Link href="/dashboard" className="btn btn-ghost !w-auto px-6 mt-6 inline-flex">
            Open the demo dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
