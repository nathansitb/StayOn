"use client";

import Link from "next/link";
import { useLang } from "@/lib/store";

export function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="w-full max-w-[1180px] mx-auto px-7 py-8 mt-auto text-muted text-[12px] text-center border-t border-line">
      <div>{t("footer")}</div>
      <div className="flex justify-center gap-5 mt-3">
        <Link href="/privacy" className="hover:text-cream transition">Privacy</Link>
        <Link href="/terms" className="hover:text-cream transition">Terms</Link>
        <Link href="/mentions-legales" className="hover:text-cream transition">{lang === "fr" ? "Mentions légales" : "Legal notice"}</Link>
      </div>
    </footer>
  );
}
