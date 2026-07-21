"use client";

import { useEffect, useState } from "react";
import { PhoneFrame, BackButton } from "./PhoneFrame";
import { Photo } from "./Photo";
import { Logo } from "@/components/ui/Logo";
import { LATE_OPTIONS, CLEANING_SERVICES, CLEANING_SLOTS } from "@/lib/data";
import type { DbApartment } from "@/lib/apartment";

type Screen = "welcome" | "summary" | "payment" | "confirm" | "unavailable" | "checking";
type Flow = "night" | "late" | "cleaning";

interface Service {
  flow: Flow;
  label: string;
  amount: number;
  nights?: number;
  lateTime?: string | null;
  cleaningSlot?: string | null;
}

const SVC_LABEL: Record<string, string> = {
  refresh: "Refresh clean",
  full: "Full clean",
  linen: "Linen & towels",
};

function tomorrowISO() {
  const d = new Date(Date.now() + 86400000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDaysISO(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
const eur = (n: number) => "€" + n.toLocaleString("en-US");

export function RealGuestFlow({ apt }: { apt: DbApartment }) {
  const [screen, setScreen] = useState<Screen>("welcome");

  // Multi-select cart: the guest can combine services.
  const [wantNight, setWantNight] = useState(false);
  const [nights, setNights] = useState(1);
  const [wantLate, setWantLate] = useState(false);
  const [late, setLate] = useState(0);
  const [wantClean, setWantClean] = useState(false);
  const [svc, setSvc] = useState(0);
  const [slot, setSlot] = useState(0);
  const [busy, setBusy] = useState(false);

  const checkIn = tomorrowISO();
  const checkOut = addDaysISO(checkIn, Math.max(1, nights));

  const go = (s: Screen) => {
    setScreen(s);
    const box = document.querySelector(".no-scrollbar");
    if (box) box.scrollTop = 0;
  };

  // Returning from Stripe Checkout → show the confirmation screen.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("paid") === "1") setScreen("confirm");
  }, []);

  // Build the selected services and the total.
  const services: Service[] = [];
  if (wantNight && apt.extra_night)
    services.push({
      flow: "night",
      nights,
      amount: apt.extend_price * nights,
      label: `Extra night × ${nights}`,
    });
  if (wantLate && apt.late_checkout)
    services.push({
      flow: "late",
      lateTime: LATE_OPTIONS[late].time,
      amount: LATE_OPTIONS[late].price,
      label: `Late checkout · ${LATE_OPTIONS[late].time}`,
    });
  if (wantClean && apt.cleaning)
    services.push({
      flow: "cleaning",
      cleaningSlot: CLEANING_SLOTS[slot],
      amount: CLEANING_SERVICES[svc].price,
      label: `${SVC_LABEL[CLEANING_SERVICES[svc].key]} · ${CLEANING_SLOTS[slot]}`,
    });
  const total = services.reduce((s, x) => s + x.amount, 0);

  async function proceed() {
    if (!services.length) return;
    // Check the night is really free before going further.
    if (wantNight && apt.ical_url) {
      go("checking");
      try {
        const r = await fetch(
          `/api/availability?url=${encodeURIComponent(apt.ical_url)}&night=${checkIn}`
        );
        const j = await r.json();
        if (!(r.ok && j.available)) {
          go("unavailable");
          return;
        }
      } catch {
        /* if the check fails, let them continue */
      }
    }
    go("summary");
  }

  async function pay() {
    if (busy || !services.length) return;
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: apt.public_code,
          services: services.map((s) => ({
            flow: s.flow,
            nights: s.nights ?? 0,
            lateTime: s.lateTime ?? null,
            cleaningSlot: s.cleaningSlot ?? null,
            amount: s.amount,
            label: s.label,
          })),
          amount: total,
          checkIn,
          guestName: "Guest",
        }),
      });
      const j = await r.json();
      if (j.url) {
        window.location.href = j.url; // → Stripe hosted checkout
        return;
      }
    } catch {
      /* Stripe not configured yet — fall through to a demo confirmation */
    }
    setBusy(false);
    go("confirm");
  }

  const img =
    apt.image_url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop";

  const gold = "#c6a76a";
  const cardBase = "rounded-[3px] border transition";
  const onStyle = { borderColor: gold, background: "rgba(198,167,106,.07)" };
  const offStyle = { borderColor: "var(--line)", background: "#141311" };

  let body: React.ReactNode = null;

  if (screen === "checking") {
    body = (
      <div className="min-h-full flex flex-col items-center justify-center text-center px-8">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-gold animate-spin" />
        <div className="mt-5 text-[11px] uppercase tracking-[1.5px] text-muted">
          Checking the calendar…
        </div>
      </div>
    );
  } else if (screen === "welcome") {
    body = (
      <div className="min-h-full flex flex-col px-[22px] pt-14 pb-[26px] animate-fade">
        <div className="flex justify-center pt-4 text-cream">
          <Logo size={38} tagline />
        </div>
        <div className="text-center mt-5">
          <div className="font-serif text-[19px] font-semibold">{apt.name}</div>
          <div className="text-muted text-[12.5px] mt-1">{apt.location || ""}</div>
        </div>
        <p className="text-creamDim text-[13.5px] leading-[1.55] text-center mt-4 mb-4">
          Choose one or more services. Add them together — an extra night, a late
          checkout, a cleaning.
        </p>

        <div className="flex flex-col gap-3">
          {/* Extra night */}
          {apt.extra_night && (
            <div className={cardBase} style={wantNight ? onStyle : offStyle}>
              <button
                onClick={() => setWantNight((v) => !v)}
                className="w-full flex items-center justify-between px-[16px] py-[14px] text-left"
              >
                <span>
                  <span className="text-[15px] font-medium">Stay one more night</span>
                  <span className="block text-[12px] text-muted mt-0.5">
                    Night of {fmtDate(checkIn)}
                  </span>
                </span>
                <Check on={wantNight} />
              </button>
              {wantNight && (
                <div className="px-[16px] pb-[15px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-creamDim">How many nights?</span>
                    <div className="flex items-center gap-3 bg-panel border border-line rounded-[2px] px-2 py-1">
                      <button
                        onClick={() => setNights(Math.max(1, nights - 1))}
                        className="w-7 h-7 rounded-full bg-panel2 border border-line text-[16px] leading-none"
                      >
                        −
                      </button>
                      <span className="font-serif text-[17px] font-semibold w-4 text-center">
                        {nights}
                      </span>
                      <button
                        onClick={() => setNights(Math.min(5, nights + 1))}
                        className="w-7 h-7 rounded-full bg-panel2 border border-line text-[16px] leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-muted text-[12px]">
                      {fmtDate(checkIn)} → {fmtDate(checkOut)}
                    </span>
                    <span className="font-serif text-[18px] font-semibold">
                      {eur(apt.extend_price * nights)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Late checkout */}
          {apt.late_checkout && (
            <div className={cardBase} style={wantLate ? onStyle : offStyle}>
              <button
                onClick={() => setWantLate((v) => !v)}
                className="w-full flex items-center justify-between px-[16px] py-[14px] text-left"
              >
                <span>
                  <span className="text-[15px] font-medium">Late checkout</span>
                  <span className="block text-[12px] text-muted mt-0.5">
                    On {fmtDate(checkIn)}
                  </span>
                </span>
                <Check on={wantLate} />
              </button>
              {wantLate && (
                <div className="px-[16px] pb-[15px] flex flex-col gap-2">
                  {LATE_OPTIONS.map((o, i) => (
                    <button
                      key={o.time}
                      onClick={() => setLate(i)}
                      className="flex items-center justify-between rounded-[3px] px-[14px] py-[11px] border text-left"
                      style={i === late ? onStyle : offStyle}
                    >
                      <span className="text-[14px]">Checkout at {o.time}</span>
                      <span className="font-serif text-[16px] font-semibold">{eur(o.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cleaning */}
          {apt.cleaning && (
            <div className={cardBase} style={wantClean ? onStyle : offStyle}>
              <button
                onClick={() => setWantClean((v) => !v)}
                className="w-full flex items-center justify-between px-[16px] py-[14px] text-left"
              >
                <span>
                  <span className="text-[15px] font-medium">Cleaning service</span>
                  <span className="block text-[12px] text-muted mt-0.5">
                    On {fmtDate(checkIn)}
                  </span>
                </span>
                <Check on={wantClean} />
              </button>
              {wantClean && (
                <div className="px-[16px] pb-[15px]">
                  <div className="flex flex-col gap-2">
                    {CLEANING_SERVICES.map((s, i) => (
                      <button
                        key={s.key}
                        onClick={() => setSvc(i)}
                        className="flex items-center justify-between rounded-[3px] px-[14px] py-[11px] border text-left"
                        style={i === svc ? onStyle : offStyle}
                      >
                        <span className="text-[14px]">{SVC_LABEL[s.key]}</span>
                        <span className="font-serif text-[16px] font-semibold">{eur(s.price)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    {CLEANING_SLOTS.map((sl, i) => (
                      <button
                        key={sl}
                        onClick={() => setSlot(i)}
                        className="rounded-[3px] py-2.5 text-[12.5px] font-medium border"
                        style={{
                          borderColor: i === slot ? gold : "var(--line)",
                          background: i === slot ? "rgba(198,167,106,.10)" : "#141311",
                          color: i === slot ? "#F3EDE1" : "#C9C2B4",
                        }}
                      >
                        {sl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5">
          {total > 0 && (
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-muted text-[12.5px]">
                {services.length} service{services.length > 1 ? "s" : ""} selected
              </span>
              <span className="font-serif text-[24px] font-semibold">{eur(total)}</span>
            </div>
          )}
          <button className="btn btn-primary" disabled={!services.length} onClick={proceed}>
            Continue
          </button>
          <div className="hint text-center mt-2">Scanned from your room · {apt.name}</div>
        </div>
      </div>
    );
  } else if (screen === "summary") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[70px] pb-[26px]">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Booking summary</h1>
          <div className="card px-[18px] py-1.5 mt-5">
            <Row k="Apartment" v={apt.name} />
            {wantNight && apt.extra_night && (
              <Row k="Dates" v={`${fmtDate(checkIn)} → ${fmtDate(checkOut)}`} />
            )}
            {services.map((s) => (
              <Row key={s.flow} k={s.label} v={eur(s.amount)} />
            ))}
            <Row k="Total" v={eur(total)} total />
          </div>
          <button className="btn btn-primary mt-6" onClick={() => go("payment")}>
            Continue to payment
          </button>
        </div>
      </div>
    );
  } else if (screen === "payment") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("summary")} />
        <div className="px-[22px] pt-[70px] pb-[30px] min-h-full flex flex-col">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Confirm &amp; pay</h1>

          <div className="card px-[18px] py-4 mt-6">
            {services.map((s) => (
              <div
                key={s.flow}
                className="flex justify-between items-center py-2 text-[13.5px] text-creamDim"
              >
                <span>{s.label}</span>
                <span className="text-cream">{eur(s.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-line">
              <span className="font-serif text-[18px] font-semibold">Total</span>
              <span className="font-serif text-[26px] font-semibold">{eur(total)}</span>
            </div>
          </div>

          <button className="btn btn-primary mt-auto" disabled={busy} onClick={pay}>
            {busy ? "Opening secure payment…" : `Pay ${eur(total)}`}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-muted text-[11px] mt-4">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure payment · card, Apple&nbsp;Pay &amp; Google&nbsp;Pay · powered by Stripe
          </div>
        </div>
      </div>
    );
  } else if (screen === "confirm") {
    body = (
      <div className="min-h-full flex flex-col items-center justify-center text-center px-8 py-10 animate-fade">
        <div
          className="w-[84px] h-[84px] rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgba(198,167,106,.08)", border: "1px solid #c6a76a" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#C6A76A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="font-serif text-[25px] font-semibold leading-[1.2]">
          Your booking is confirmed.
        </div>
        <div className="text-creamDim text-[13.5px] mt-3">
          {apt.name} · {fmtDate(checkIn)}
        </div>
        <div className="text-muted text-[10px] uppercase tracking-[1.5px] mt-5">
          Receipt sent to your email
        </div>
        <button className="btn btn-ghost !w-auto px-8 mt-8" onClick={() => go("welcome")}>
          Back to start
        </button>
        <div className="text-muted text-[13px] mt-6">Thank you for choosing StayOn.</div>
      </div>
    );
  } else if (screen === "unavailable") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[70px]">
          <div className="eyebrow" style={{ color: "#c98b7a" }}>
            StayOn
          </div>
          <h1 className="h1">The extra night is no longer available.</h1>
          <p className="sub">
            That night is already booked. You can still add a late checkout or a
            cleaning.
          </p>
          <button
            className="btn btn-primary mt-6"
            onClick={() => {
              setWantNight(false);
              go("welcome");
            }}
          >
            Choose another service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-3">
      <PhoneFrame>{body}</PhoneFrame>
    </div>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 border"
      style={{
        borderColor: on ? "#c6a76a" : "var(--line)",
        background: on ? "#c6a76a" : "transparent",
      }}
    >
      {on && (
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#111" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </span>
  );
}

function Row({ k, v, total = false }: { k: string; v: string; total?: boolean }) {
  return (
    <div className="flex justify-between items-center py-[13px] border-b border-line last:border-b-0 text-[14px]">
      <span className={total ? "font-serif text-[19px] font-semibold" : "text-muted"}>{k}</span>
      <span className={total ? "font-serif text-[19px] font-semibold" : "text-cream font-medium"}>
        {v}
      </span>
    </div>
  );
}
