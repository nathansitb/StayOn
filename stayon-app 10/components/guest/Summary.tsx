"use client";

import { useLang } from "@/lib/store";
import { CLEANING_SERVICES, CLEANING_SLOTS, CURRENT_APARTMENT, LATE_OPTIONS } from "@/lib/data";
import type { FlowType } from "@/lib/types";

const SVC_KEY = { refresh: "svc_refresh", full: "svc_full", linen: "svc_linen" } as const;
import { BackButton } from "./PhoneFrame";
import { Photo } from "./Photo";
import { ProgressDots } from "./ProgressDots";

function Row({
  k,
  v,
  total = false,
}: {
  k: string;
  v: string;
  total?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-[15px] border-b border-line last:border-b-0 ${
        total ? "" : "text-[14.5px]"
      }`}
    >
      <span className={total ? "font-serif text-[20px] font-semibold" : "text-muted"}>
        {k}
      </span>
      <span
        className={
          total
            ? "font-serif text-[20px] font-semibold text-cream"
            : "text-cream text-right font-medium"
        }
      >
        {v}
      </span>
    </div>
  );
}

export function Summary({
  flow,
  nights,
  lateIndex,
  cleanService,
  cleanSlot,
  onBack,
  onContinue,
}: {
  flow: FlowType;
  nights: number;
  lateIndex: number;
  cleanService: number;
  cleanSlot: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { lang, t, eur } = useLang();
  const date = lang === "fr" ? CURRENT_APARTMENT.dateFr : CURRENT_APARTMENT.dateEn;
  const svc = CLEANING_SERVICES[cleanService];

  const price =
    flow === "night"
      ? CURRENT_APARTMENT.extraNightPrice * nights
      : flow === "late"
        ? LATE_OPTIONS[lateIndex].price
        : svc.price;

  const item =
    flow === "night"
      ? `${t("extraNight")} · ${nights} ${nights > 1 ? t("nights") : t("nightLabel")}`
      : flow === "late"
        ? `${t("lateCheckout")} · ${LATE_OPTIONS[lateIndex].time}`
        : `${t(SVC_KEY[svc.key as keyof typeof SVC_KEY])} · ${CLEANING_SLOTS[cleanSlot]}`;

  return (
    <div className="animate-fade">
      <BackButton onClick={onBack} />
      <div className="px-[22px] pt-[70px] pb-[26px]">
        <div className="eyebrow">StayOn</div>
        <h1 className="h1">{t("summaryTitle")}</h1>
        <p className="sub">{t("review")}</p>

        <Photo
          src={CURRENT_APARTMENT.image}
          className="w-full h-[150px] object-cover rounded-2xl mt-5 border border-line"
        />

        <div className="card px-[18px] py-1.5 mt-[22px]">
          <Row k={t("apartment")} v={CURRENT_APARTMENT.name} />
          <Row k={t("type")} v={item} />
          <Row k={t("date")} v={date} />
          <Row k={t("price")} v={eur(price)} />
          <Row k={t("cleaning")} v={eur(0)} />
          <Row k={t("taxes")} v={t("included")} />
          <Row k={t("total")} v={eur(price)} total />
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button className="btn btn-gold" onClick={onContinue}>
            {t("continuePay")} <span className="text-[18px]">↗</span>
          </button>
        </div>
        <ProgressDots step={2} />
      </div>
    </div>
  );
}
