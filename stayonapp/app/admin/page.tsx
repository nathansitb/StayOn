import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") redirect("/agency");

  // Super-admin: read everything with the service-role client (bypasses RLS).
  const admin = createAdminClient();
  const { data: agencies } = await admin
    .from("agencies")
    .select("id, name, plan, created_at")
    .order("created_at", { ascending: false });
  const { count: apartmentCount } = await admin
    .from("apartments")
    .select("id", { count: "exact", head: true });
  const { count: bookingCount } = await admin
    .from("bookings")
    .select("id", { count: "exact", head: true });

  const list = agencies ?? [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-[1180px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-cream">
            <Logo size={22} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[11px] uppercase tracking-[1.5px] text-gold">Super admin</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-12">
        <h1 className="font-serif text-[34px] font-semibold">Platform console</h1>
        <p className="text-muted text-[14px] mt-2">All agencies and apartments across StayOn.</p>

        <div className="grid grid-cols-3 gap-4 mt-8 max-w-[560px]">
          {[
            { l: "Agencies", n: list.length },
            { l: "Apartments", n: apartmentCount ?? 0 },
            { l: "Bookings", n: bookingCount ?? 0 },
          ].map((s) => (
            <div key={s.l} className="card p-5">
              <div className="text-[10px] uppercase tracking-[1.5px] text-muted">{s.l}</div>
              <div className="font-serif text-[28px] font-semibold mt-2">{s.n}</div>
            </div>
          ))}
        </div>

        <div className="card p-1.5 mt-8">
          <div className="font-serif text-[18px] font-semibold px-5 pt-4 pb-2">Agencies</div>
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line">
            <div>Name</div>
            <div>Plan</div>
            <div>Joined</div>
          </div>
          {list.length === 0 && (
            <div className="px-5 py-10 text-center text-muted text-[14px]">
              No agencies yet. When a conciergerie signs up at /login, it appears here.
            </div>
          )}
          {list.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-2 md:gap-3 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px]"
            >
              <div className="font-medium">{a.name}</div>
              <div className="text-creamDim uppercase text-[11px] tracking-[1px]">{a.plan}</div>
              <div className="text-muted text-[13px]">
                {new Date(a.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
