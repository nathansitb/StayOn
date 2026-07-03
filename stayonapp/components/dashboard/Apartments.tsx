"use client";

import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";
import { Photo } from "@/components/guest/Photo";
import { Qr } from "@/components/ui/Qr";

export function Apartments() {
  const { t, eur } = useLang();
  const { apartments: APARTMENTS, toggleOption } = useApp();

  return (
    <div className="card p-1.5 mt-1">
      <div className="font-serif text-[18px] font-semibold px-5 pt-4 pb-2">
        {t("aptsTitle")}
      </div>

      {/* header (desktop) */}
      <div className="hidden md:grid grid-cols-[2.4fr_1fr_1fr_1fr_1.2fr_.8fr] gap-3 px-5 py-3.5 text-[11.5px] tracking-[.6px] uppercase text-muted border-b border-line">
        <div>{t("apartment")}</div>
        <div>{t("cStatus")}</div>
        <div>{t("cExtra")}</div>
        <div>{t("cLate")}</div>
        <div>{t("cPrice")}</div>
        <div>{t("cQR")}</div>
      </div>

      {APARTMENTS.map((a, i) => (
        <div
          key={a.id}
          className="grid grid-cols-1 md:grid-cols-[2.4fr_1fr_1fr_1fr_1.2fr_.8fr] gap-2 md:gap-3 px-4 md:px-5 py-4 border-b border-line last:border-b-0 text-[14px] items-center [&>div]:flex [&>div]:md:block [&>div]:justify-between [&>div]:items-center"
        >
          <div className="!flex items-center gap-3 min-w-0">
            <Photo
              src={a.image}
              className="w-[46px] h-[46px] rounded-[2px] object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="font-medium truncate">{a.name}</div>
              <div className="text-[12px] text-muted">{a.location}</div>
            </div>
          </div>

          <div>
            <span className="md:hidden text-muted text-[12px] uppercase tracking-[.5px]">
              {t("cStatus")}
            </span>
            <span
              className={`badge ${a.status === "available" ? "badge-free" : "badge-busy"}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {a.status === "available" ? t("available") : t("occupied")}
            </span>
          </div>

          <div>
            <span className="md:hidden text-muted text-[12px] uppercase tracking-[.5px]">
              {t("cExtra")}
            </span>
            <button
              onClick={() => toggleOption(a.id, "extraNight")}
              className={`pill ${a.extraNight ? "pill-on" : "pill-off"}`}
            >
              {a.extraNight ? t("on") : t("off")}
            </button>
          </div>

          <div>
            <span className="md:hidden text-muted text-[12px] uppercase tracking-[.5px]">
              {t("cLate")}
            </span>
            <button
              onClick={() => toggleOption(a.id, "lateCheckout")}
              className={`pill ${a.lateCheckout ? "pill-on" : "pill-off"}`}
            >
              {a.lateCheckout ? t("on") : t("off")}
            </button>
          </div>

          <div>
            <span className="md:hidden text-muted text-[12px] uppercase tracking-[.5px]">
              {t("cPrice")}
            </span>
            <span className="font-medium">{eur(a.extendPrice)}</span>
          </div>

          <div>
            <span className="md:hidden text-muted text-[12px] uppercase tracking-[.5px]">
              {t("cQR")}
            </span>
            <span className="w-[34px] h-[34px] rounded-[7px] bg-white p-[3px] inline-block">
              <Qr seed={i + 3} className="w-full h-full" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
