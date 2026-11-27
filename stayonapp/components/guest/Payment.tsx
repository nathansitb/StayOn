"use client";

import { useState } from "react";
import { useLang } from "@/lib/store";
import { CLEANING_SERVICES, CURRENT_APARTMENT, LATE_OPTIONS } from "@/lib/data";
import { processPayment } from "@/lib/integrations";
import type { FlowType } from "@/lib/types";
import { BackButton } from "./PhoneFrame";
import { ProgressDots } from "./ProgressDots";

export function Payment({
  flow,
  nights,
  lateIndex,
  cleanService,
  onBack,
  onPaid,
}: {
  flow: FlowType;
  nights: number;
  lateIndex: number;
  cleanService: number;
  onBack: () => void;
  onPaid: () => void;
}) {
  const { t, eur } = useLang();
  const [busy, setBusy] = useState(false);
  const price =
    flow === "night"
      ? CURRENT_APARTMENT.extraNightPrice * nights
      : flow === "late"
        ? LATE_OPTIONS[lateIndex].price
        : CLEANING_SERVICES[cleanService].price;

  async function pay(method: "apple" | "google" | "card") {
    if (busy) return;
    setBusy(true);
    await processPayment({ amount: price, method });
    onPaid();
  }

  return (
    <div className="animate-fade">
      <BackButton onClick={onBack} />
      <div className="px-[22px] pt-[70px] pb-[30px]">
        <div className="eyebrow">StayOn</div>
        <h1 className="h1">{t("payTitle")}</h1>
        <p className="sub">{t("paySub")}</p>

        <div className="flex gap-2.5 mt-[22px]">
          <button
            onClick={() => pay("apple")}
            className="flex-1 rounded-[2px] py-[15px] bg-cream text-[#111] flex items-center justify-center font-semibold text-[15px] gap-1.5"
          >
             Pay
          </button>
          <button
            onClick={() => pay("google")}
            className="flex-1 rounded-[2px] py-[15px] bg-white text-[#111] flex items-center justify-center font-semibold text-[15px] gap-1.5"
          >
            G Pay
          </button>
        </div>

        <div className="divider my-[22px]">{t("orCard")}</div>

        <div className="field">
          <label>{t("cardNumber")}</label>
          <input inputMode="numeric" defaultValue="4242 4242 4242 4242" placeholder="4242 4242 4242 4242" />
        </div>
        <div className="flex gap-3">
          <div className="field flex-1 mt-3.5">
            <label>{t("exp")}</label>
            <input defaultValue="09 / 28" placeholder="09 / 28" />
          </div>
          <div className="field flex-1 mt-3.5">
            <label>{t("cvc")}</label>
            <input defaultValue="123" placeholder="123" />
          </div>
        </div>
        <div className="field mt-3.5">
          <label>{t("cardName")}</label>
          <input defaultValue="Nathan Sitbon" placeholder="Nathan Sitbon" />
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button className="btn btn-gold" disabled={busy} onClick={() => pay("card")}>
            {busy ? "…" : `${t("payNow")} · ${eur(price)}`}
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-muted text-[10px] uppercase tracking-[1.5px] mt-[18px]">
          {t("secured")}
        </div>
        <ProgressDots step={3} />
      </div>
    </div>
  );
}
