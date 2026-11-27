"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "stayon-cookie-consent";

/**
 * Lightweight cookie notice. StayOn only uses strictly-necessary cookies
 * (auth/security), so this is an informational banner — no tracking is loaded
 * either way. Dismissal is remembered locally so it shows only once.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);

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

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-[720px] rounded-[3px] border border-line bg-panel/95 backdrop-blur px-5 py-4 shadow-2xl sm:flex sm:items-center sm:gap-5">
        <p className="text-[13px] leading-[1.6] text-creamDim">
          StayOn n&apos;utilise que des cookies strictement nécessaires à son
          fonctionnement (connexion, sécurité). Pas de publicité, pas de
          traceurs.{" "}
          <Link href="/privacy" className="text-gold hover:text-cream transition">
            En savoir plus
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="mt-3 sm:mt-0 shrink-0 rounded-[2px] bg-cream px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] text-[#111] hover:opacity-90 transition"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
