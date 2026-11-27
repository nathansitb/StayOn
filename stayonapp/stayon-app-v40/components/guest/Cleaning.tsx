"use client";

import { useLang } from "@/lib/store";
import { CLEANING_SERVICES, CLEANING_SLOTS } from "@/lib/data";
import type { TKey } from "@/lib/i18n";
import { BackButton } from "./PhoneFrame";
import { ProgressDots } from "./ProgressDots";

const LABEL: Record<string, { name: TKey; desc: TKey }> = {
  refresh: { name: "svc_refresh", desc: "svc_refreshD" },
  full: { name: "svc_full", desc: "svc_fullD" },
  linen: { name: "svc_linen", desc: "svc_linenD" },
};

export function Cleaning({
  service,
  slot,
  onService,
  onSlot,
  onBack,
  onContinue,
}: {
  service: number;
  slot: number;
  onService: (i: number) => void;
  onSlot: (i: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t, eur } = useLang();

  return (
    <div className="animate-fade">
      <BackButton onClick={onBack} />
      <div className="px-[22px] pt-[70px] pb-[26px]">
        <div className="eyebrow">StayOn</div>
        <h1 className="h1">{t("cleaningTitle")}</h1>
        <p className="sub">{t("cleaningSub")}</p>

        {/* service tiers */}
        <div className="text-[13px] text-muted mt-6 mb-2">{t("chooseService")}</div>
        <div className="flex flex-col gap-3">
          {CLEANING_SERVICES.map((s, i) => {
            const sel = i === service;
            return (
              <button
                key={s.key}
                onClick={() => onService(i)}
                className="flex items-center justify-between rounded-[3px] px-[18px] py-[15px] border transition text-left"
                style={{
                  borderColor: sel ? "#c6a76a" : "var(--line)",
                  background: sel ? "rgba(198,167,106,.07)" : "#141311",
                }}
              >
                <span className="flex items-center">
                  <span
                    className="w-5 h-5 rounded-full mr-3.5 relative shrink-0"
                    style={{ border: `1.5px solid ${sel ? "#c6a76a" : "var(--line-strong)"}` }}
                  >
                    {sel && <span className="absolute inset-1 rounded-full bg-gold" />}
                  </span>
                  <span>
                    <span className="block text-[15.5px] font-medium">
                      {t(LABEL[s.key].name)}
                    </span>
                    <span className="block text-[12.5px] text-muted">
                      {t(LABEL[s.key].desc)}
                    </span>
                  </span>
                </span>
                <span className="font-serif text-[18px] font-semibold">{eur(s.price)}</span>
              </button>
            );
          })}
        </div>

        {/* time slots */}
        <div className="text-[13px] text-muted mt-6 mb-2">{t("chooseTime")}</div>
        <div className="grid grid-cols-2 gap-2.5">
          {CLEANING_SLOTS.map((sl, i) => {
            const sel = i === slot;
            return (
              <button
                key={sl}
                onClick={() => onSlot(i)}
                className="rounded-[3px] py-3 text-[13.5px] font-medium border transition"
                style={{
                  borderColor: sel ? "#c6a76a" : "var(--line)",
                  background: sel ? "rgba(198,167,106,.10)" : "#141311",
                  color: sel ? "#F3EDE1" : "#C9C2B4",
                }}
              >
                {sl}
              </button>
            );
          })}
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
