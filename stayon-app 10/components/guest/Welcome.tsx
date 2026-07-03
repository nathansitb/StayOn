"use client";

import { useLang } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";
import type { FlowType } from "@/lib/types";

export function Welcome({ onPick }: { onPick: (f: FlowType) => void }) {
  const { t } = useLang();
  return (
    <div className="min-h-full flex flex-col px-[26px] pt-16 pb-[30px] animate-fade">
      <div className="flex justify-center pt-10 text-cream">
        <Logo size={46} tagline />
      </div>

      <p className="text-creamDim text-[15.5px] leading-[1.6] text-center mx-1 mt-[38px] mb-[30px]">
        {t("welcomeQ")}
      </p>

      <div className="flex flex-col gap-3 mt-auto pt-6">
        <button className="btn btn-gold" onClick={() => onPick("night")}>
          {t("stayNight")} <span className="text-[18px]">↗</span>
        </button>
        <button className="btn btn-ghost" onClick={() => onPick("late")}>
          {t("lateCheckout")}
        </button>
        <button className="btn btn-ghost" onClick={() => onPick("cleaning")}>
          {t("cleaningCta")}
        </button>
        <div className="hint text-center mt-1.5">{t("scanHint")}</div>
      </div>
    </div>
  );
}
