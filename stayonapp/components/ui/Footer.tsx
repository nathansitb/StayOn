"use client";

import { useLang } from "@/lib/store";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="w-full max-w-[1180px] mx-auto px-7 py-8 mt-auto text-muted text-[12px] text-center border-t border-line">
      {t("footer")}
    </footer>
  );
}
