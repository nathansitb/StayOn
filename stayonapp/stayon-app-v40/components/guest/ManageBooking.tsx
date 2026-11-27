"use client";

import { useLang } from "@/lib/store";
import type { Booking } from "@/lib/types";
import { BackButton } from "./PhoneFrame";
import { Photo } from "./Photo";
import { CURRENT_APARTMENT } from "@/lib/data";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-center py-[15px] border-b border-line last:border-b-0 text-[14.5px]">
      <span className="text-muted">{k}</span>
      <span className="text-cream font-medium text-right">{v}</span>
    </div>
  );
}

export function ManageBooking({
  booking,
  onBack,
}: {
  booking: Booking | null;
  onBack: () => void;
}) {
  const { lang, t, eur } = useLang();
  if (!booking) return null;
  const isNight = booking.flow === "night";
  const date = lang === "fr" ? CURRENT_APARTMENT.dateFr : CURRENT_APARTMENT.dateEn;

  return (
    <div className="animate-fade">
      <BackButton onClick={onBack} />
      <div className="px-[22px] pt-[70px] pb-[26px]">
        <div className="eyebrow">StayOn</div>
        <h1 className="h1">{t("yourBooking")}</h1>

        <Photo
          src={CURRENT_APARTMENT.image}
          className="w-full h-[150px] object-cover rounded-2xl mt-5 border border-line"
        />

        <div className="card px-[18px] py-1.5 mt-5">
          <Row k={t("bookingRef")} v={booking.id.replace("bk_", "SO-").toUpperCase()} />
          <Row k={t("apartment")} v={booking.apartmentName} />
          <Row
            k={t("type")}
            v={
              isNight
                ? `${t("extraNight")} · ${booking.nights} ${
                    booking.nights > 1 ? t("nights") : t("nightLabel")
                  }`
                : booking.flow === "late"
                  ? `${t("lateCheckout")} · ${booking.lateTime}`
                  : `${t("cleaningWord")} · ${booking.cleaningSlot}`
            }
          />
          <Row k={t("date")} v={date} />
          <Row k={t("total")} v={eur(booking.price)} />
        </div>

        <div className="card p-4 mt-4 flex items-center gap-3 text-[13.5px] text-creamDim">
          <span className="w-9 h-9 rounded-full bg-panel2 border border-line flex items-center justify-center text-gold">
            ✓
          </span>
          {isNight
            ? t("stayExtended")
            : booking.flow === "late"
              ? t("lateConfirmed")
              : t("cleaningConfirmed")}
        </div>

        <div className="text-center text-muted text-[12.5px] mt-6">
          {t("needHelp")}
        </div>
      </div>
    </div>
  );
}
