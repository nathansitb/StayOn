"use client";

import { useLang } from "@/lib/store";
import { CLEANING_SLOTS, CURRENT_APARTMENT, LATE_OPTIONS } from "@/lib/data";
import type { FlowType } from "@/lib/types";

export function Confirmation({
  flow,
  lateIndex,
  cleanSlot,
  onManage,
  onRestart,
}: {
  flow: FlowType;
  lateIndex: number;
  cleanSlot: number;
  onManage: () => void;
  onRestart: () => void;
}) {
  const { lang, t } = useLang();
  const title =
    flow === "night"
      ? t("stayExtended")
      : flow === "late"
        ? t("lateConfirmed")
        : t("cleaningConfirmed");
  const label =
    flow === "night"
      ? t("extraNightAdded")
      : flow === "late"
        ? t("newCheckout")
        : t("cleaningBooked");
  const value =
    flow === "night"
      ? lang === "fr"
        ? CURRENT_APARTMENT.dateFr
        : CURRENT_APARTMENT.dateEn
      : flow === "late"
        ? LATE_OPTIONS[lateIndex].time
        : CLEANING_SLOTS[cleanSlot];

  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center px-[30px] py-10 animate-fade">
      <div
        className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-7"
        style={{
          background: "rgba(198,167,106,.08)",
          border: "1px solid #c6a76a",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C6A76A"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <div className="font-serif text-[28px] font-semibold leading-[1.2]">
        {title}
      </div>

      <div className="card px-[22px] py-4 mt-[26px] font-serif text-[18px]">
        <small className="block font-sans text-[11px] tracking-[1.5px] uppercase text-gold mb-1.5">
          {label}
        </small>
        {value}
      </div>

      <div className="text-muted text-[10px] uppercase tracking-[1.5px] mt-4">
        {t("receiptSent")}
      </div>

      <div className="w-full mt-[30px]">
        <button className="btn btn-primary" onClick={onManage}>
          {t("manage")}
        </button>
        <button className="btn btn-ghost mt-3" onClick={onRestart}>
          {t("backStart")}
        </button>
      </div>

      <div className="text-muted text-[13.5px] mt-7">{t("thanks")}</div>
    </div>
  );
}
