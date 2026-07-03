"use client";

import { useLang } from "@/lib/store";
import { LATE_OPTIONS } from "@/lib/data";
import { BackButton } from "./PhoneFrame";
import { ProgressDots } from "./ProgressDots";

export function LateCheckout({
  selected,
  onSelect,
  onBack,
  onContinue,
}: {
  selected: number;
  onSelect: (i: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t, eur } = useLang();

  return (
    <div className="animate-fade">
      <BackButton onClick={onBack} />
      <div className="px-[22px] pt-[70px] pb-[26px]">
        <div className="eyebrow">StayOn</div>
        <h1 className="h1">{t("lateTitle")}</h1>
        <p className="sub">{t("lateSub")}</p>

        <div className="mt-[22px] flex flex-col gap-3">
          {LATE_OPTIONS.map((o, i) => {
            const sel = i === selected;
            return (
              <button
                key={o.time}
                onClick={() => onSelect(i)}
                className="flex items-center justify-between rounded-[3px] px-[18px] py-[17px] border transition text-left"
                style={{
                  borderColor: sel ? "#c6a76a" : "var(--line)",
                  background: sel ? "rgba(198,167,106,.07)" : "#141311",
                }}
              >
                <span className="flex items-center">
                  <span
                    className="w-5 h-5 rounded-full mr-3.5 relative shrink-0 transition"
                    style={{
                      border: `1.5px solid ${sel ? "#c6a76a" : "var(--line-strong)"}`,
                    }}
                  >
                    {sel && (
                      <span className="absolute inset-1 rounded-full bg-gold" />
                    )}
                  </span>
                  <span className="text-[16px] font-medium">
                    {t("checkoutAt")} {o.time}
                  </span>
                </span>
                <span className="font-serif text-[19px] font-semibold">
                  {eur(o.price)}
                </span>
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
