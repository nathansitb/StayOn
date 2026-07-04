import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

interface CardDef {
  href: string;
  title: string;
  desc: string;
  external?: boolean;
}

function Card({ c }: { c: CardDef }) {
  return (
    <Link
      href={c.href}
      target={c.external ? "_blank" : undefined}
      className="card p-6 block hover:border-lineStrong transition group"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between">
        <div className="font-serif text-[18px] font-semibold">{c.title}</div>
        <span className="text-muted group-hover:text-gold transition text-[18px]">→</span>
      </div>
      <p className="text-[13px] text-creamDim leading-[1.5] mt-2">{c.desc}</p>
      <code className="text-[11px] text-muted mt-3 inline-block">{c.href}</code>
    </Link>
  );
}

export default async function HubPage() {
  // Try to surface one real apartment link as a live example.
  let exampleCode: string | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("apartments")
      .select("public_code")
      .order("created_at", { ascending: false })
      .limit(1);
    exampleCode = data?.[0]?.public_code ?? null;
  } catch {
    exampleCode = null;
  }

  const live: CardDef[] = [
    { href: "/login", title: "Log in / Sign up", desc: "Agencies create an account and manage their apartments." },
    { href: "/agency", title: "Agency space", desc: "Real dashboard: apartments, bookings, revenue, connections (requires login)." },
    { href: "/admin", title: "Super-admin console", desc: "Every agency, apartment and booking across StayOn (owner only)." },
    ...(exampleCode
      ? [{ href: `/a/${exampleCode}`, title: "Live guest page", desc: "A real per-apartment page — this is what a QR opens.", external: true }]
      : []),
  ];

  const demo: CardDef[] = [
    { href: "/", title: "Landing / pitch", desc: "The public marketing page — hero, benefits, pricing." },
    { href: "/stay", title: "Guest demo", desc: "The scan-to-extend flow on a sample apartment.", external: true },
    { href: "/dashboard", title: "Agency demo dashboard", desc: "Showcase dashboard with simulated data." },
    { href: "/host", title: "Host onboarding demo", desc: "The 5-step host setup wizard (demo)." },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-cream"><Logo size={22} /></Link>
          <span className="text-[11px] uppercase tracking-[1.5px] text-gold">Control room</span>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="font-serif text-[34px] font-semibold">All links, one place</h1>
        <p className="text-muted text-[14px] mt-2">Everything that makes up StayOn — real product and demo showcase.</p>

        <div className="text-[11px] uppercase tracking-[2px] text-gold mt-10 mb-4">Live product · real accounts &amp; data</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {live.map((c) => <Card key={c.href} c={c} />)}
        </div>

        <div className="text-[11px] uppercase tracking-[2px] text-muted mt-12 mb-4">Demo showcase · simulated data</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {demo.map((c) => <Card key={c.href} c={c} />)}
        </div>
      </main>
    </div>
  );
}
