"use client";

import { useState } from "react";
import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";

function tomorrow(): string {
  const d = new Date(Date.now() + 86400000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function Connections() {
  const { t } = useLang();
  const { demoIcalUrl, setDemoIcalUrl } = useApp();

  // iCal
  const [ical, setIcal] = useState(demoIcalUrl);
  const [icalBusy, setIcalBusy] = useState(false);
  const [icalRes, setIcalRes] = useState<{ available: boolean; blockedCount: number } | null>(null);
  const [icalErr, setIcalErr] = useState<string | null>(null);

  async function testIcal() {
    setIcalBusy(true); setIcalErr(null); setIcalRes(null);
    try {
      const r = await fetch(`/api/availability?url=${encodeURIComponent(ical)}&night=${tomorrow()}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "error");
      setIcalRes({ available: j.available, blockedCount: j.blockedCount });
    } catch (e) {
      setIcalErr(e instanceof Error ? e.message : "error");
    } finally {
      setIcalBusy(false);
    }
  }

  // Guesty
  const [cid, setCid] = useState("");
  const [secret, setSecret] = useState("");
  const [gBusy, setGBusy] = useState(false);
  const [gRes, setGRes] = useState<{ total: number; listings: { id: string; title: string }[] } | null>(null);
  const [gErr, setGErr] = useState<string | null>(null);

  async function connectGuesty() {
    setGBusy(true); setGErr(null); setGRes(null);
    try {
      const r = await fetch("/api/guesty/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: cid, clientSecret: secret }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "error");
      setGRes({ total: j.total, listings: j.listings ?? [] });
    } catch (e) {
      setGErr(e instanceof Error ? e.message : "error");
    } finally {
      setGBusy(false);
    }
  }

  const usingThis = demoIcalUrl && demoIcalUrl === ical;

  return (
    <div className="mt-1">
      <div className="font-serif text-[20px] font-semibold">{t("connTitle")}</div>
      <div className="text-muted text-[13px] mt-1">{t("connSub")}</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        {/* iCal */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <span className="badge badge-free">iCal</span>
            <span className="font-serif text-[17px] font-semibold">{t("icalTitle")}</span>
          </div>
          <p className="text-[13px] text-muted mt-2 leading-[1.5]">{t("icalSub")}</p>

          <div className="field mt-4">
            <label>URL .ics</label>
            <input value={ical} onChange={(e) => setIcal(e.target.value)} placeholder={t("icalPlaceholder")} />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn btn-primary !w-auto px-5" disabled={!ical || icalBusy} onClick={testIcal}>
              {icalBusy ? t("checking") : t("testAvailability")}
            </button>
            <button
              className="btn btn-ghost !w-auto px-5"
              disabled={!ical}
              onClick={() => setDemoIcalUrl(ical)}
            >
              {usingThis ? t("inUse") : t("useForDemo")}
            </button>
          </div>

          {icalRes && (
            <div className="mt-4 text-[13px] flex items-center gap-2">
              <span className={`badge ${icalRes.available ? "badge-free" : "badge-busy"}`}>
                {icalRes.available ? t("icalOkAvail") : t("icalOkBusy")}
              </span>
              <span className="text-muted">{icalRes.blockedCount} {t("blockedNightsN")}</span>
            </div>
          )}
          {icalErr && <div className="mt-4 text-[13px] text-[#e0857a]">{t("connError")} — {icalErr}</div>}
        </div>

        {/* Guesty */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <span className="badge badge-busy">API</span>
            <span className="font-serif text-[17px] font-semibold">{t("guestyTitle")}</span>
          </div>
          <p className="text-[13px] text-muted mt-2 leading-[1.5]">{t("guestySub")}</p>

          <div className="field mt-4">
            <label>{t("clientId")}</label>
            <input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="0oa…" />
          </div>
          <div className="field mt-3">
            <label>{t("clientSecret")}</label>
            <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="••••••••" />
          </div>

          <button className="btn btn-primary !w-auto px-5 mt-4" disabled={!cid || !secret || gBusy} onClick={connectGuesty}>
            {gBusy ? t("connecting") : t("connectBtn")}
          </button>

          {gRes && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="badge badge-free">{t("guestyConnected")}</span>
                <span className="text-muted">{gRes.total} {t("listingsFound")}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {gRes.listings.slice(0, 6).map((l) => (
                  <li key={l.id} className="text-[13px] text-creamDim flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gold" /> {l.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {gErr && <div className="mt-4 text-[13px] text-[#e0857a]">{t("connError")} — {gErr}</div>}
        </div>
      </div>
    </div>
  );
}
