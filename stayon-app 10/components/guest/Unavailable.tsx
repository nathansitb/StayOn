"use client";

import { useLang } from "@/lib/store";
import { NEARBY_STAYS } from "@/lib/data";
import { BackButton } from "./PhoneFrame";
import { Photo } from "./Photo";

export function Unavailable({ onBack }: { onBack: () => void }) {
  const { lang, t, eur } = useLang();

  return (
    <div className="animate-fade">
      <BackButton onClick={onBack} />
      <div className="px-[22px] pt-[70px] pb-[26px]">
        <div className="eyebrow" style={{ color: "#c98b7a" }}>
          StayOn
        </div>
        <h1 className="h1">{t("unavailTitle")}</h1>
        <p className="sub">{t("unavailSub")}</p>

        <div className="mt-5 flex flex-col gap-3.5">
          {NEARBY_STAYS.map((n) => (
            <div
              key={n.id}
              className="card flex gap-3.5 p-3 items-center"
            >
              <Photo
                src={n.image}
                className="w-[82px] h-[82px] rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[16px] font-semibold">
                  {n.name}
                </div>
                <div className="text-[12px] text-muted mt-0.5">
                  ◌ {n.distanceKm} km {t("away")}
                </div>
                <div className="text-[14px] mt-1.5 font-medium">
                  {eur(n.price)}{" "}
                  <small className="text-muted font-normal">{t("perNight")}</small>
                </div>
              </div>
              <button
                className="px-3.5 py-2.5 rounded-[2px] text-[11px] font-medium uppercase tracking-[1px] shrink-0 btn-dark"
                style={{ border: "1px solid var(--line-strong)" }}
                onClick={() =>
                  alert(
                    (lang === "fr" ? "Ouverture de " : "Opening ") + n.name
                  )
                }
              >
                {t("viewStay")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
