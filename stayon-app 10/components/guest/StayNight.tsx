"use client";

import { useLang } from "@/lib/store";
import { CURRENT_APARTMENT } from "@/lib/data";
import { BackButton } from "./PhoneFrame";
import { Photo } from "./Photo";
import { ProgressDots } from "./ProgressDots";

export function StayNight({
  nights,
  onNights,
  onBack,
  onContinue,
}: {
  nights: number;
  onNights: (n: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { lang, t, eur } = useLang();
  const date = lang === "fr" ? CURRENT_APARTMENT.dateFr : CURRENT_APARTMENT.dateEn;
  const unit = CURRENT_APARTMENT.extraNightPrice;
  const total = unit * nights;

  return (
    <div className="animate-fade">
      <BackButton onClick={onBack} />
      <div className="px-[22px] pt-[52px] pb-[26px]">
        <Photo
          src={CURRENT_APARTMENT.image}
          className="w-full h-[230px] rounded-[3px] object-cover border border-line"
        />
        <div className="font-serif text-[22px] font-semibold mt-[18px]">
          {CURRENT_APARTMENT.name}
        </div>
        <div className="text-muted text-[13.5px] mt-1 flex items-center gap-1.5">
          ◌ {t("address")}
        </div>

        <div className="card flex gap-2.5 p-4 mt-5 text-[14px] text-creamDim leading-[1.5]">
          <span className="text-gold">●</span>
          <span>{t("goodNews")}</span>
        </div>

        {/* nights stepper */}
        <div className="flex items-center justify-between mt-5">
          <span className="text-[14.5px]">{t("howManyNights")}</span>
          <div className="flex items-center gap-4 bg-panel border border-line rounded-full px-2 py-1.5">
            <button
              onClick={() => onNights(Math.max(1, nights - 1))}
              className="w-8 h-8 rounded-full bg-panel2 border border-line text-[18px] leading-none flex items-center justify-center disabled:opacity-40"
              disabled={nights <= 1}
              aria-label="minus"
            >
              −
            </button>
            <span className="font-serif text-[20px] font-semibold w-4 text-center">
              {nights}
            </span>
            <button
              onClick={() => onNights(Math.min(5, nights + 1))}
              className="w-8 h-8 rounded-full bg-panel2 border border-line text-[18px] leading-none flex items-center justify-center disabled:opacity-40"
              disabled={nights >= 5}
              aria-label="plus"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-[22px] pt-5 border-t border-line">
          <span className="text-muted text-[13px]">
            {nights} {nights > 1 ? t("nights") : t("nightLabel")} · {eur(unit)}
            {t("perNight")}
          </span>
          <span className="font-serif text-[34px] font-semibold">{eur(total)}</span>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button className="btn btn-gold" onClick={onContinue}>
            {t("continue")} <span className="text-[18px]">↗</span>
          </button>
        </div>
        <ProgressDots step={1} />
      </div>
    </div>
  );
}
