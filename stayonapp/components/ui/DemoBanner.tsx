import Link from "next/link";

/** Thin banner marking the showcase (simulated data) pages, with a link to the real app. */
export function DemoBanner() {
  return (
    <div className="w-full bg-panel2 border-b border-line text-center py-2 px-4 text-[10.5px] uppercase tracking-[1.5px] text-muted">
      Demo · simulated data —{" "}
      <Link href="/login" className="text-gold hover:text-cream transition">
        go to the real app →
      </Link>
    </div>
  );
}
