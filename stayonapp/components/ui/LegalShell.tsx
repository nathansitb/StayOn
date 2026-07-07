import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-[780px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-cream">
            <Logo size={22} />
          </Link>
          <Link href="/" className="text-[12px] text-muted hover:text-cream transition">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-[780px] mx-auto px-6 py-14">
        <h1 className="font-serif text-[36px] font-semibold">{title}</h1>
        <p className="text-muted text-[13px] mt-2">Last updated: {updated}</p>
        <div className="mt-10 space-y-8 text-[14.5px] leading-[1.75] text-creamDim">
          {children}
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-[780px] mx-auto px-6 py-8 flex items-center justify-between text-[12px] text-muted">
          <span>© {new Date().getFullYear()} StayOn</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-cream transition">Privacy</Link>
            <Link href="/terms" className="hover:text-cream transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-[20px] font-semibold text-cream">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
