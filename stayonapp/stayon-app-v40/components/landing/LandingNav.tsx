"use client";

import Link from "next/link";
import { useLang } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";

export function LandingNav() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg/70 border-b border-line">
      <nav className="max-w-[1180px] mx-auto px-5 sm:px-7 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center text-cream pt-1.5">
          <Logo size={22} />
        </Link>

        <div className="hidden md:flex items-center gap-7 text-[13.5px] text-creamDim">
          <a href="#how" className="hover:text-cream transition">{t("navHow")}</a>
          <a href="#guests" className="hover:text-cream transition">{t("navGuests")}</a>
          <a href="#hosts" className="hover:text-cream transition">{t("navHosts")}</a>
          <a href="#pricing" className="hover:text-cream transition">{t("navPricing")}</a>
          <Link href="/stay" className="hover:text-cream transition">{t("tryDemo")}</Link>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-panel border border-line rounded-[2px] p-1">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1.5 rounded-[2px] text-[12px] font-medium transition ${
                  lang === l ? "bg-panel2 text-cream" : "text-muted"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link
            href="/login"
            className="hidden sm:inline-flex px-4 py-2 rounded-[2px] bg-cream text-[#111] text-[13px] font-medium"
          >
            {t("navLogin")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
