"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";

export function TopBar() {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const isAgency = pathname.startsWith("/dashboard");

  return (
    <header className="w-full max-w-[1180px] mx-auto px-5 sm:px-7 py-5 flex items-center justify-between gap-4 flex-wrap">
      <Link href="/" className="flex items-center text-cream pt-1.5">
        <Logo size={22} />
      </Link>

      <div className="flex items-center gap-2.5">
        {/* mode switch */}
        <div className="flex bg-panel border border-line rounded-[2px] p-1">
          <Link
            href="/stay"
            className={`px-4 py-2 rounded-[2px] text-[13px] tracking-[.2px] transition ${
              !isAgency ? "bg-cream text-[#111] font-medium" : "text-muted"
            }`}
          >
            {t("guest")}
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-[2px] text-[13px] tracking-[.2px] transition ${
              isAgency ? "bg-cream text-[#111] font-medium" : "text-muted"
            }`}
          >
            {t("agency")}
          </Link>
        </div>

        {/* language */}
        <div className="flex bg-panel border border-line rounded-[2px] p-1">
          {(["en", "fr"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-2 rounded-[2px] text-[12px] font-medium transition ${
                lang === l ? "bg-panel2 text-cream" : "text-muted"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
