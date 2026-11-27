import Link from "next/link";
import { requireAgency } from "@/lib/agency-auth";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AgencyNav } from "@/components/agency/AgencyNav";
import { getAgencySettings } from "@/lib/agency-settings";

export const dynamic = "force-dynamic";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, agencyName, supabase, agencyId } = await requireAgency();

  // Badge on the Notifications tab: bookings paid since the last "mark all as read".
  let unread = 0;
  try {
    const settings = await getAgencySettings(supabase, agencyId);
    let q = supabase.from("bookings").select("id", { count: "exact", head: true });
    if (settings.notificationsSeenAt) q = q.gt("created_at", settings.notificationsSeenAt);
    const { count } = await q;
    unread = count ?? 0;
  } catch {
    unread = 0;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-[1180px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-cream">
            <Logo size={22} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-muted hidden sm:inline">
              {agencyName} · {email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-8">
        <AgencyNav unread={unread} />
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
