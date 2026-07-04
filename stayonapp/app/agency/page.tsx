import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ApartmentsManager } from "@/components/agency/ApartmentsManager";

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

        {profile?.agency_id && <ApartmentsManager agencyId={profile.agency_id} />}
      </main>
    </div>
  );
}
