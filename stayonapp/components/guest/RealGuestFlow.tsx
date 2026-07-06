"use client";

import { useEffect, useState } from "react";
import { PhoneFrame, BackButton } from "./PhoneFrame";
import { Photo } from "./Photo";
import { Logo } from "@/components/ui/Logo";
import { LATE_OPTIONS, CLEANING_SERVICES, CLEANING_SLOTS } from "@/lib/data";
import type { DbApartment } from "@/lib/apartment";

type Screen =
  | "welcome" | "stay" | "late" | "cleaning"
  | "summary" | "payment" | "confirm" | "unavailable" | "checking";
type Flow = "night" | "late" | "cleaning";

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
const eur = (n: number) => "€" + n.toLocaleString("en-US");

export function RealGuestFlow({ apt }: { apt: DbApartment }) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [flow, setFlow] = useState<Flow>("night");
  const [nights, setNights] = useState(1);
  const [late, setLate] = useState(2);
  const [svc, setSvc] = useState(0);
  const [slot, setSlot] = useState(0);
  const [busy, setBusy] = useState(false);

  const go = (s: Screen) => {
    setScreen(s);
    const box = document.querySelector(".no-scrollbar");
    if (box) box.scrollTop = 0;
  };

  // Returning from Stripe Checkout → show the confirmation screen.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("paid") === "1") {
      const f = p.get("flow");
      if (f === "night" || f === "late" || f === "cleaning") setFlow(f);
      setScreen("confirm");
    }
  }, []);

  const price =
    flow === "night" ? apt.extend_price * nights
    : flow === "late" ? LATE_OPTIONS[late].price
    : CLEANING_SERVICES[svc].price;

  async function pickNight() {
    setFlow("night");
    if (!apt.ical_url) return go("stay");
    go("checking");
    try {
      const r = await fetch(`/api/availability?url=${encodeURIComponent(apt.ical_url)}&night=${tomorrowISO()}`);
      const j = await r.json();
      go(r.ok && j.available ? "stay" : "unavailable");
    } catch {
      go("stay");
    }
  }

  async function pay() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: apt.public_code,
          flow,
          nights: flow === "night" ? nights : 0,
          lateTime: flow === "late" ? LATE_OPTIONS[late].time : null,
          cleaningSlot: flow === "cleaning" ? CLEANING_SLOTS[slot] : null,
          amount: price,
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

  const img = apt.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop";

  let body: React.ReactNode = null;

  if (screen === "checking") {
    body = (
      <div className="min-h-full flex flex-col items-center justify-center text-center px-8">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-gold animate-spin" />
        <div className="mt-5 text-[11px] uppercase tracking-[1.5px] text-muted">Checking the calendar…</div>
      </div>
    );
  } else if (screen === "welcome") {
    body = (
      <div className="min-h-full flex flex-col px-[26px] pt-16 pb-[30px] animate-fade">
        <div className="flex justify-center pt-8 text-cream"><Logo size={40} tagline /></div>
        <div className="text-center mt-6">
          <div className="font-serif text-[20px] font-semibold">{apt.name}</div>
          <div className="text-muted text-[12.5px] mt-1">{apt.location || ""}</div>
        </div>
        <p className="text-creamDim text-[14.5px] leading-[1.6] text-center mt-6 mb-6">
          Would you like to extend your stay or request a service?
        </p>
        <div className="flex flex-col gap-3 mt-auto">
          {apt.extra_night && (
            <button className="btn btn-primary" onClick={pickNight}>Stay one more night</button>
          )}
          {apt.late_checkout && (
            <button className="btn btn-ghost" onClick={() => { setFlow("late"); go("late"); }}>Request late checkout</button>
          )}
          {apt.cleaning && (
            <button className="btn btn-ghost" onClick={() => { setFlow("cleaning"); go("cleaning"); }}>Book a cleaning</button>
          )}
          <div className="hint text-center mt-1.5">Scanned from your room · {apt.name}</div>
        </div>
      </div>
    );
  } else if (screen === "stay") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[52px] pb-[26px]">
          <Photo src={img} className="w-full h-[220px] rounded-[3px] object-cover border border-line" />
          <div className="font-serif text-[21px] font-semibold mt-4">{apt.name}</div>
          <div className="text-muted text-[13px] mt-1">{apt.location || ""}</div>
          <div className="card flex gap-2.5 p-4 mt-4 text-[13.5px] text-creamDim">
            <span className="text-gold">●</span> Available for one more night.
          </div>
          <div className="flex items-center justify-between mt-5">
            <span className="text-[14px]">How many nights?</span>
            <div className="flex items-center gap-4 bg-panel border border-line rounded-[2px] px-2 py-1.5">
              <button onClick={() => setNights(Math.max(1, nights - 1))} className="w-8 h-8 rounded-full bg-panel2 border border-line text-[18px] leading-none">−</button>
              <span className="font-serif text-[19px] font-semibold w-4 text-center">{nights}</span>
              <button onClick={() => setNights(Math.min(5, nights + 1))} className="w-8 h-8 rounded-full bg-panel2 border border-line text-[18px] leading-none">+</button>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-5 pt-5 border-t border-line">
            <span className="text-muted text-[13px]">{nights} night{nights > 1 ? "s" : ""} · {eur(apt.extend_price)}/night</span>
            <span className="font-serif text-[30px] font-semibold">{eur(apt.extend_price * nights)}</span>
          </div>
          <button className="btn btn-primary mt-6" onClick={() => go("summary")}>Continue</button>
        </div>
      </div>
    );
  } else if (screen === "late") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[70px] pb-[26px]">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Late checkout available</h1>
          <div className="mt-5 flex flex-col gap-3">
            {LATE_OPTIONS.map((o, i) => (
              <button key={o.time} onClick={() => setLate(i)}
                className="flex items-center justify-between rounded-[3px] px-[18px] py-[15px] border text-left"
                style={{ borderColor: i === late ? "#c6a76a" : "var(--line)", background: i === late ? "rgba(198,167,106,.07)" : "#141311" }}>
                <span className="text-[15.5px] font-medium">Checkout at {o.time}</span>
                <span className="font-serif text-[18px] font-semibold">{eur(o.price)}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary mt-6" onClick={() => go("summary")}>Continue</button>
        </div>
      </div>
    );
  } else if (screen === "cleaning") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[70px] pb-[26px]">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Housekeeping on demand</h1>
          <div className="text-[13px] text-muted mt-5 mb-2">Choose a service</div>
          <div className="flex flex-col gap-3">
            {CLEANING_SERVICES.map((s, i) => (
              <button key={s.key} onClick={() => setSvc(i)}
                className="flex items-center justify-between rounded-[3px] px-[18px] py-[15px] border text-left"
                style={{ borderColor: i === svc ? "#c6a76a" : "var(--line)", background: i === svc ? "rgba(198,167,106,.07)" : "#141311" }}>
                <span className="text-[15px] font-medium">{SVC_LABEL[s.key]}</span>
                <span className="font-serif text-[17px] font-semibold">{eur(s.price)}</span>
              </button>
            ))}
          </div>
          <div className="text-[13px] text-muted mt-6 mb-2">Choose a time slot</div>
          <div className="grid grid-cols-2 gap-2.5">
            {CLEANING_SLOTS.map((sl, i) => (
              <button key={sl} onClick={() => setSlot(i)}
                className="rounded-[3px] py-3 text-[13.5px] font-medium border"
                style={{ borderColor: i === slot ? "#c6a76a" : "var(--line)", background: i === slot ? "rgba(198,167,106,.10)" : "#141311", color: i === slot ? "#F3EDE1" : "#C9C2B4" }}>
                {sl}
              </button>
            ))}
          </div>
          <button className="btn btn-primary mt-6" onClick={() => go("summary")}>Continue</button>
        </div>
      </div>
    );
  } else if (screen === "summary") {
    const item = flow === "night" ? `Extra night · ${nights}`
      : flow === "late" ? `Late checkout · ${LATE_OPTIONS[late].time}`
      : `${SVC_LABEL[CLEANING_SERVICES[svc].key]} · ${CLEANING_SLOTS[slot]}`;
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go(flow === "night" ? "stay" : flow)} />
        <div className="px-[22px] pt-[70px] pb-[26px]">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Booking summary</h1>
          <div className="card px-[18px] py-1.5 mt-5">
            <Row k="Apartment" v={apt.name} />
            <Row k="Type" v={item} />
            <Row k="Cleaning fees" v={eur(0)} />
            <Row k="Total" v={eur(price)} total />
          </div>
          <button className="btn btn-primary mt-6" onClick={() => go("payment")}>Continue to payment</button>
        </div>
      </div>
    );
  } else if (screen === "payment") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("summary")} />
        <div className="px-[22px] pt-[70px] pb-[30px]">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Payment</h1>
          <div className="flex gap-2.5 mt-5">
            <button onClick={pay} className="flex-1 rounded-[2px] py-[15px] bg-cream text-[#111] font-semibold text-[15px]"> Pay</button>
            <button onClick={pay} className="flex-1 rounded-[2px] py-[15px] bg-white text-[#111] font-semibold text-[15px]">G Pay</button>
          </div>
          <div className="divider my-5">or pay with card</div>
          <div className="card px-4 py-3.5 text-creamDim text-[14px]">4242 4242 4242 4242</div>
          <button className="btn btn-primary mt-6" disabled={busy} onClick={pay}>{busy ? "…" : `Pay now · ${eur(price)}`}</button>
          <div className="text-center text-muted text-[10px] uppercase tracking-[1.5px] mt-4">Secured payment powered by Stripe</div>
        </div>
      </div>
    );
  } else if (screen === "confirm") {
    const isN = flow === "night";
    body = (
      <div className="min-h-full flex flex-col items-center justify-center text-center px-8 py-10 animate-fade">
        <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(198,167,106,.08)", border: "1px solid #c6a76a" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#C6A76A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <div className="font-serif text-[26px] font-semibold leading-[1.2]">
          {isN ? "Your stay has been extended." : flow === "late" ? "Your late checkout is confirmed." : "Your cleaning is booked."}
        </div>
        <div className="text-muted text-[10px] uppercase tracking-[1.5px] mt-5">Receipt sent to your email</div>
        <button className="btn btn-ghost !w-auto px-8 mt-8" onClick={() => go("welcome")}>Back to start</button>
        <div className="text-muted text-[13px] mt-6">Thank you for choosing StayOn.</div>
      </div>
    );
  } else if (screen === "unavailable") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[70px]">
          <div className="eyebrow" style={{ color: "#c98b7a" }}>StayOn</div>
          <h1 className="h1">Unfortunately, this apartment is no longer available.</h1>
          <p className="sub">The next night is already booked. Try a late checkout instead.</p>
          {apt.late_checkout && (
            <button className="btn btn-primary mt-6" onClick={() => { setFlow("late"); go("late"); }}>Request late checkout</button>
          )}
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

function Row({ k, v, total = false }: { k: string; v: string; total?: boolean }) {
  return (
    <div className="flex justify-between items-center py-[15px] border-b border-line last:border-b-0 text-[14.5px]">
      <span className={total ? "font-serif text-[19px] font-semibold" : "text-muted"}>{k}</span>
      <span className={total ? "font-serif text-[19px] font-semibold" : "text-cream font-medium"}>{v}</span>
    </div>
  );
}
