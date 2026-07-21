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

interface Service {
  flow: Flow;
  label: string;
  amount: number;
  date: string;          // YYYY-MM-DD (check-in / service day)
  nights?: number;
  lateTime?: string | null;
  cleaningSlot?: string | null;
}

const SVC_LABEL: Record<string, string> = {
  refresh: "Refresh clean",
  full: "Full clean",
  linen: "Linen & towels",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function tomorrowISO() {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}
function addDaysISO(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function fmtDate(iso: string) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
const eur = (n: number) => "€" + n.toLocaleString("en-US");

export function RealGuestFlow({ apt }: { apt: DbApartment }) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [cart, setCart] = useState<Service[]>([]);
  const [busy, setBusy] = useState(false);
  const [nearby, setNearby] = useState<
    Array<{ public_code: string; name: string; location: string | null; km: number }>
  >([]);
  const [booking, setBooking] = useState<{
    reference: string;
    aptName: string;
    checkIn: string;
    total: number;
    services: Array<{ label: string; amount: number }>;
    email: string | null;
  } | null>(null);

  // Draft config for each service screen
  const [nightDate, setNightDate] = useState(tomorrowISO());
  const [nights, setNights] = useState(1);
  const [lateDate, setLateDate] = useState(tomorrowISO());
  const [late, setLate] = useState(0);
  const [cleanDate, setCleanDate] = useState(tomorrowISO());
  const [svc, setSvc] = useState(0);
  const [slot, setSlot] = useState(0);

  const go = (s: Screen) => {
    setScreen(s);
    const box = document.querySelector(".no-scrollbar");
    if (box) box.scrollTop = 0;
  };

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("paid") === "1") {
      setScreen("confirm");
      const sid = p.get("session_id");
      if (sid) {
        fetch(`/api/booking?session_id=${sid}`)
          .then((r) => r.json())
          .then((j) => { if (j.found) setBooking(j); })
          .catch(() => {});
      }
    }
  }, []);

  const total = cart.reduce((s, x) => s + x.amount, 0);
  const inCart = (f: Flow) => cart.find((c) => c.flow === f);
  function upsert(s: Service) {
    setCart((prev) => [...prev.filter((c) => c.flow !== s.flow), s]);
  }
  function removeFlow(f: Flow) {
    setCart((prev) => prev.filter((c) => c.flow !== f));
  }

  async function addNight() {
    // Check the chosen night is really free before adding.
    if (apt.ical_url) {
      go("checking");
      try {
        const r = await fetch(
          `/api/availability?url=${encodeURIComponent(apt.ical_url)}&night=${nightDate}`
        );
        const j = await r.json();
        if (!(r.ok && j.available)) {
          // Fetch the nearest available apartments to suggest instead.
          try {
            const nr = await fetch(
              `/api/nearby?code=${encodeURIComponent(apt.public_code)}&night=${nightDate}`
            );
            const nj = await nr.json();
            setNearby(Array.isArray(nj.results) ? nj.results : []);
          } catch {
            setNearby([]);
          }
          go("unavailable");
          return;
        }
      } catch {
        /* if the check fails, allow it */
      }
    }
    upsert({
      flow: "night",
      date: nightDate,
      nights,
      amount: apt.extend_price * nights,
      label: `Extra night × ${nights}`,
    });
    go("summary");
  }
  function addLate() {
    upsert({
      flow: "late",
      date: lateDate,
      lateTime: LATE_OPTIONS[late].time,
      amount: LATE_OPTIONS[late].price,
      label: `Late checkout · ${LATE_OPTIONS[late].time}`,
    });
    go("summary");
  }
  function addClean() {
    upsert({
      flow: "cleaning",
      date: cleanDate,
      cleaningSlot: CLEANING_SLOTS[slot],
      amount: CLEANING_SERVICES[svc].price,
      label: `${SVC_LABEL[CLEANING_SERVICES[svc].key]} · ${CLEANING_SLOTS[slot]}`,
    });
    go("summary");
  }

  async function pay() {
    if (busy || !cart.length) return;
    setBusy(true);
    const nightSvc = cart.find((c) => c.flow === "night");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: apt.public_code,
          services: cart.map((s) => ({
            flow: s.flow,
            nights: s.nights ?? 0,
            lateTime: s.lateTime ?? null,
            cleaningSlot: s.cleaningSlot ?? null,
            amount: s.amount,
            label: s.label,
            date: s.date,
          })),
          amount: total,
          checkIn: nightSvc?.date ?? cart[0]?.date ?? tomorrowISO(),
          guestName: "Guest",
        }),
      });
      const j = await r.json();
      if (j.url) {
        window.location.href = j.url;
        return;
      }
    } catch {
      /* Stripe not configured — demo confirmation */
    }
    setBusy(false);
    go("confirm");
  }

  const img =
    apt.image_url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop";

  const dateInput =
    "bg-panel border border-line rounded-[2px] px-3 py-2 text-[14px] text-cream w-full";

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
    // Simple entry chooser (also reached from "Add another service").
    body = (
      <div className="min-h-full flex flex-col px-[26px] pt-16 pb-[30px] animate-fade">
        <div className="flex justify-center pt-8 text-cream">
          <Logo size={40} tagline />
        </div>
        <div className="text-center mt-6">
          <div className="font-serif text-[20px] font-semibold">{apt.name}</div>
          <div className="text-muted text-[12.5px] mt-1">{apt.location || ""}</div>
        </div>
        <p className="text-creamDim text-[14.5px] leading-[1.6] text-center mt-6 mb-6">
          Would you like to extend your stay or request a service?
        </p>
        <div className="flex flex-col gap-3 mt-auto">
          {apt.extra_night && (
            <button className="btn btn-primary" onClick={() => go("stay")}>Stay one more night</button>
          )}
          {apt.late_checkout && (
            <button className="btn btn-ghost" onClick={() => go("late")}>Request late checkout</button>
          )}
          {apt.cleaning && (
            <button className="btn btn-ghost" onClick={() => go("cleaning")}>Book a cleaning</button>
          )}
          {cart.length > 0 && (
            <button className="btn btn-ghost mt-1" style={{ borderColor: "#c6a76a", color: "#F3EDE1" }} onClick={() => go("summary")}>
              Review booking · {eur(total)}
            </button>
          )}
          <div className="hint text-center mt-1.5">Scanned from your room · {apt.name}</div>
        </div>
      </div>
    );
  } else if (screen === "stay") {
    const out = addDaysISO(nightDate, Math.max(1, nights));
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[52px] pb-[26px]">
          <Photo src={img} className="w-full h-[210px] rounded-[3px] object-cover border border-line" />
          <div className="font-serif text-[21px] font-semibold mt-4">{apt.name}</div>
          <div className="text-muted text-[13px] mt-1">{apt.location || ""}</div>
          <div className="card flex gap-2.5 p-4 mt-4 text-[13.5px] text-creamDim">
            <span className="text-gold">●</span> Extend your stay — choose your dates.
          </div>

          <div className="mt-5">
            <label className="text-[12.5px] text-muted">First night</label>
            <input
              type="date"
              min={todayISO()}
              value={nightDate}
              onChange={(e) => setNightDate(e.target.value)}
              className={dateInput + " mt-1.5"}
              style={{ colorScheme: "dark" }}
            />
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
            <span className="text-muted text-[13px]">{fmtDate(nightDate)} → {fmtDate(out)}</span>
            <span className="font-serif text-[30px] font-semibold">{eur(apt.extend_price * nights)}</span>
          </div>
          <button className="btn btn-primary mt-6" onClick={addNight}>
            {inCart("night") ? "Update booking" : "Add to booking"}
          </button>
          {inCart("night") && (
            <button className="btn btn-ghost mt-2.5" onClick={() => { const rest = cart.filter((c) => c.flow !== "night"); removeFlow("night"); go(rest.length ? "summary" : "welcome"); }}>Remove</button>
          )}
        </div>
      </div>
    );
  } else if (screen === "late") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[70px] pb-[26px]">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Late checkout</h1>
          <div className="mt-5">
            <label className="text-[12.5px] text-muted">Date</label>
            <input
              type="date"
              min={todayISO()}
              value={lateDate}
              onChange={(e) => setLateDate(e.target.value)}
              className={dateInput + " mt-1.5"}
              style={{ colorScheme: "dark" }}
            />
          </div>
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
          <button className="btn btn-primary mt-6" onClick={addLate}>
            {inCart("late") ? "Update booking" : "Add to booking"}
          </button>
          {inCart("late") && (
            <button className="btn btn-ghost mt-2.5" onClick={() => { const rest = cart.filter((c) => c.flow !== "late"); removeFlow("late"); go(rest.length ? "summary" : "welcome"); }}>Remove</button>
          )}
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
          <div className="mt-5">
            <label className="text-[12.5px] text-muted">Date</label>
            <input
              type="date"
              min={todayISO()}
              value={cleanDate}
              onChange={(e) => setCleanDate(e.target.value)}
              className={dateInput + " mt-1.5"}
              style={{ colorScheme: "dark" }}
            />
          </div>
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
          <button className="btn btn-primary mt-6" onClick={addClean}>
            {inCart("cleaning") ? "Update booking" : "Add to booking"}
          </button>
          {inCart("cleaning") && (
            <button className="btn btn-ghost mt-2.5" onClick={() => { removeFlow("cleaning"); go("welcome"); }}>Remove</button>
          )}
        </div>
      </div>
    );
  } else if (screen === "summary") {
    const nightSvc = cart.find((c) => c.flow === "night");
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("welcome")} />
        <div className="px-[22px] pt-[70px] pb-[26px]">
          <div className="eyebrow">StayOn</div>
          <h1 className="h1">Booking summary</h1>
          <div className="card px-[18px] py-1.5 mt-5">
            <Row k="Apartment" v={apt.name} />
            {nightSvc && (
              <Row k="Dates" v={`${fmtDate(nightSvc.date)} → ${fmtDate(addDaysISO(nightSvc.date, nightSvc.nights || 1))}`} />
            )}
            {cart.map((s) => (
              <Row key={s.flow} k={`${s.label}${s.flow !== "night" ? " · " + fmtDate(s.date) : ""}`} v={eur(s.amount)} />
            ))}
            <Row k="Total" v={eur(total)} total />
          </div>
          <button className="btn btn-ghost mt-4" onClick={() => go("welcome")}>+ Add another service</button>
          <button className="btn btn-primary mt-2.5" onClick={() => go("payment")}>Continue to payment</button>
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
            {cart.map((s) => (
              <div key={s.flow} className="flex justify-between items-center py-2 text-[13.5px] text-creamDim">
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
            Secure payment · card, Apple&nbsp;Pay &amp; Google&nbsp;Pay · via Stripe
          </div>
        </div>
      </div>
    );
  } else if (screen === "confirm") {
    const nightSvc = cart.find((c) => c.flow === "night");
    const fallbackWhen = nightSvc ? fmtDate(nightSvc.date) : fmtDate(cart[0]?.date || tomorrowISO());
    const when = booking?.checkIn ? fmtDate(booking.checkIn) : fallbackWhen;
    const svcList = booking?.services ?? cart.map((c) => ({ label: c.label, amount: c.amount }));
    const totalPaid = booking?.total ?? total;
    body = (
      <div className="min-h-full flex flex-col px-8 pt-16 pb-10 animate-fade">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(198,167,106,.08)", border: "1px solid #c6a76a" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C6A76A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div className="font-serif text-[25px] font-semibold leading-[1.2]">Your booking is confirmed.</div>
          <div className="text-creamDim text-[13.5px] mt-3">{booking?.aptName ?? apt.name} · {when}</div>

          {svcList.length > 0 && (
            <div className="card w-full px-[18px] py-1 mt-6 text-left">
              {svcList.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-line last:border-b-0 text-[13.5px]">
                  <span className="text-creamDim">{s.label}</span>
                  <span className="text-cream">{eur(s.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between w-full mt-3.5 items-baseline">
            <span className="text-muted text-[13px]">Total paid</span>
            <span className="font-serif text-[19px] font-semibold">{eur(totalPaid)}</span>
          </div>

          {booking?.reference && (
            <div className="text-muted text-[11px] uppercase tracking-[1.5px] mt-6">Reference · {booking.reference}</div>
          )}
          <div className="text-muted text-[12px] mt-1.5">
            Receipt sent{booking?.email ? ` to ${booking.email}` : " to your email"}
          </div>
        </div>
        <button className="btn btn-ghost mt-6" onClick={() => { setCart([]); setBooking(null); go("welcome"); }}>Back to start</button>
      </div>
    );
  } else if (screen === "unavailable") {
    body = (
      <div className="animate-fade">
        <BackButton onClick={() => go("stay")} />
        <div className="px-[22px] pt-[70px]">
          <div className="eyebrow" style={{ color: "#c98b7a" }}>StayOn</div>
          <h1 className="h1">That night is not available.</h1>
          <p className="sub">{fmtDate(nightDate)} is already booked here.</p>

          {nearby.length > 0 && (
            <div className="mt-6">
              <div className="text-[12.5px] text-muted mb-2.5">
                Available nearby that night:
              </div>
              <div className="flex flex-col gap-2.5">
                {nearby.map((n) => (
                  <a
                    key={n.public_code}
                    href={`/a/${n.public_code}`}
                    className="card px-[16px] py-[14px] flex items-center justify-between hover:border-gold transition"
                  >
                    <span className="min-w-0">
                      <span className="text-[14.5px] font-medium block truncate">{n.name}</span>
                      <span className="block text-[12px] text-muted mt-0.5 truncate">
                        {n.location ? `${n.location} · ` : ""}{n.km} km away
                      </span>
                    </span>
                    <span className="text-gold text-[13px] shrink-0 ml-2">View →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary mt-6" onClick={() => go("stay")}>Choose another date</button>
          <button className="btn btn-ghost mt-2.5" onClick={() => go("welcome")}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-stretch sm:items-center justify-center px-0 py-0 sm:px-3 sm:py-8">
      <PhoneFrame>{body}</PhoneFrame>
    </div>
  );
}

function Row({ k, v, total = false }: { k: string; v: string; total?: boolean }) {
  return (
    <div className="flex justify-between items-center py-[14px] border-b border-line last:border-b-0 text-[14px]">
      <span className={total ? "font-serif text-[19px] font-semibold" : "text-muted"}>{k}</span>
      <span className={total ? "font-serif text-[19px] font-semibold" : "text-cream font-medium"}>{v}</span>
    </div>
  );
}
