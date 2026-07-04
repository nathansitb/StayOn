import Link from "next/link";
import { requireAgency } from "@/lib/agency-auth";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AgencyNav } from "@/components/agency/AgencyNav";

export const dynamic = "force-dynamic";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, agencyName } = await requireAgency();

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
        <AgencyNav />
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
