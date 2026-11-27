"use client";

import { useState } from "react";
import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";
import { CLEANING_SERVICES, CLEANING_SLOTS, CURRENT_APARTMENT, LATE_OPTIONS } from "@/lib/data";
import type { Booking, FlowType, GuestScreen } from "@/lib/types";
import { PhoneFrame } from "./PhoneFrame";
import { Welcome } from "./Welcome";
import { StayNight } from "./StayNight";
import { LateCheckout } from "./LateCheckout";
import { Cleaning } from "./Cleaning";
import { Summary } from "./Summary";
import { Payment } from "./Payment";
import { Confirmation } from "./Confirmation";
import { ManageBooking } from "./ManageBooking";
import { Unavailable } from "./Unavailable";

/**
 * Guest state machine: scan → extend/late → pay → confirm → manage.
 * On payment, a booking is pushed to the shared app store, so it appears
 * live in the agency dashboard and host space. An "availability" switch
 * previews the sold-out fallback.
 */
function tomorrowISO(): string {
  const d = new Date(Date.now() + 86400000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function GuestFlow() {
  const { lang, t } = useLang();
  const { addBooking, demoIcalUrl } = useApp();
  const [checking, setChecking] = useState(false);
  const [screen, setScreen] = useState<GuestScreen>("welcome");
  const [flow, setFlow] = useState<FlowType>("night");
  const [nights, setNights] = useState(1);
  const [lateIndex, setLateIndex] = useState(2);
  const [cleanService, setCleanService] = useState(0);
  const [cleanSlot, setCleanSlot] = useState(0);
  const [available, setAvailable] = useState(true);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  const scroller = () => {
    const box = document.querySelector(".no-scrollbar");
    if (box) box.scrollTop = 0;
  };
  const goto = (s: GuestScreen) => {
    setScreen(s);
    requestAnimationFrame(scroller);
  };

  async function pick(f: FlowType) {
    setFlow(f);
    if (f === "late") return goto("late");
    if (f === "cleaning") return goto("cleaning");
    // night: if a real iCal URL is configured, check live availability
    if (demoIcalUrl) {
      setChecking(true);
      try {
        const r = await fetch(
          `/api/availability?url=${encodeURIComponent(demoIcalUrl)}&night=${tomorrowISO()}`
        );
        const j = await r.json();
        setChecking(false);
        return goto(r.ok && j.available ? "stay" : "unavailable");
      } catch {
        setChecking(false);
        return goto(available ? "stay" : "unavailable");
      }
    }
    goto(available ? "stay" : "unavailable");
  }

  function priceFor(f: FlowType) {
    if (f === "night") return CURRENT_APARTMENT.extraNightPrice * nights;
    if (f === "late") return LATE_OPTIONS[lateIndex].price;
    return CLEANING_SERVICES[cleanService].price;
  }

  function onPaid() {
    const price = priceFor(flow);
    const booking = addBooking({
      apartmentId: CURRENT_APARTMENT.id,
      apartmentName: CURRENT_APARTMENT.name,
      guestName: "Nathan Sitbon",
      flow,
      nights: flow === "night" ? nights : 0,
      lateTime: flow === "late" ? LATE_OPTIONS[lateIndex].time : undefined,
      cleaningService: flow === "cleaning" ? CLEANING_SERVICES[cleanService].key : undefined,
      cleaningSlot: flow === "cleaning" ? CLEANING_SLOTS[cleanSlot] : undefined,
      price,
      date: CURRENT_APARTMENT.dateEn,
    });
    setLastBooking(booking);
    goto("confirm");
  }

  function restart() {
    setFlow("night");
    setNights(1);
    goto("welcome");
  }

  let body: React.ReactNode;
  switch (screen) {
    case "welcome":
      body = <Welcome onPick={pick} />;
      break;
    case "stay":
      body = (
        <StayNight
          nights={nights}
          onNights={setNights}
          onBack={() => goto("welcome")}
          onContinue={() => goto("summary")}
        />
      );
      break;
    case "late":
      body = (
        <LateCheckout
          selected={lateIndex}
          onSelect={setLateIndex}
          onBack={() => goto("welcome")}
          onContinue={() => goto("summary")}
        />
      );
      break;
    case "cleaning":
      body = (
        <Cleaning
          service={cleanService}
          slot={cleanSlot}
          onService={setCleanService}
          onSlot={setCleanSlot}
          onBack={() => goto("welcome")}
          onContinue={() => goto("summary")}
        />
      );
      break;
    case "summary":
      body = (
        <Summary
          flow={flow}
          nights={nights}
          lateIndex={lateIndex}
          cleanService={cleanService}
          cleanSlot={cleanSlot}
          onBack={() => goto(flow === "night" ? "stay" : flow === "late" ? "late" : "cleaning")}
          onContinue={() => goto("payment")}
        />
      );
      break;
    case "payment":
      body = (
        <Payment
          flow={flow}
          nights={nights}
          lateIndex={lateIndex}
          cleanService={cleanService}
          onBack={() => goto("summary")}
          onPaid={onPaid}
        />
      );
      break;
    case "confirm":
      body = (
        <Confirmation
          flow={flow}
          lateIndex={lateIndex}
          cleanSlot={cleanSlot}
          onManage={() => goto("manage")}
          onRestart={restart}
        />
      );
      break;
    case "manage":
      body = <ManageBooking booking={lastBooking} onBack={() => goto("confirm")} />;
      break;
    case "unavailable":
      body = <Unavailable onBack={() => goto("welcome")} />;
      break;
  }

  if (checking) {
    body = (
      <div className="min-h-full flex flex-col items-center justify-center text-center px-8 animate-fade">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-gold animate-spin" />
        <div className="mt-5 text-[11px] uppercase tracking-[1.5px] text-muted">
          {t("checking")}
        </div>
        <div className="mt-2 font-serif text-[17px] text-creamDim">
          {lang === "fr" ? "Vérification du calendrier…" : "Checking the calendar…"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-[18px]">
      <PhoneFrame>{body}</PhoneFrame>

      {/* demo control: flip availability to preview the sold-out path */}
      <div className="flex items-center gap-2.5">
        <span className="hint">{t("availability")}:</span>
        <button
          onClick={() => {
            const next = !available;
            setAvailable(next);
            if (screen === "stay" && !next) goto("unavailable");
            if (screen === "unavailable" && next) goto("welcome");
          }}
          className="bg-panel border border-line rounded-[2px] p-0"
        >
          <span
            className={`inline-block px-3 py-[7px] rounded-[2px] text-[11px] uppercase tracking-[1px] ${
              available ? "bg-cream text-[#111]" : "text-muted"
            }`}
          >
            {available ? t("available") : t("full")}
          </span>
        </button>
      </div>
    </div>
  );
}
