"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/store";

const KEY = "stayon-cookie-consent";

/**
 * Information notice only: StayOn uses strictly-necessary cookies (login,
 * security), which need no consent under CNIL rules. It is therefore never
 * shown on the guest pages (/a/…, /stay), where it would hide the booking buttons.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);
  const path = usePathname() || "";
  const { lang } = useLang();

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show || path.startsWith("/a/") || path.startsWith("/stay")) return null;
  const fr = lang === "fr";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-[620px] rounded-[3px] border border-line bg-panel/95 backdrop-blur px-4 py-3 shadow-2xl flex items-center gap-4">
        <p className="text-[12px] leading-[1.5] text-creamDim flex-1">
          {fr
            ? "Uniquement des cookies indispensables (connexion, sécurité). Aucun traceur."
            : "Only essential cookies (login, security). No tracking."}{" "}
          <Link href="/privacy" className="text-gold hover:text-cream transition">
            {fr ? "En savoir plus" : "Learn more"}
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-[2px] bg-cream px-4 py-2 text-[10.5px] font-medium uppercase tracking-[1.3px] text-[#111] hover:opacity-90 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
}
