"use client";

import { useState } from "react";
import Link from "next/link";

export function AgencyConnections() {
  const [cid, setCid] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ total: number; listings: { id: string; title: string }[]; stored?: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const webhookUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/guesty/webhook` : "/api/guesty/webhook";

  async function copyWebhook() {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function connect() {
    setBusy(true);
    setErr(null);
    setRes(null);
    try {
      const r = await fetch("/api/guesty/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: cid, clientSecret: secret }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "error");
      setRes({ total: j.total, listings: j.listings ?? [] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {/* iCal */}
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <span className="badge badge-free">iCal</span>
          <span className="font-serif text-[17px] font-semibold">Calendars</span>
        </div>
        <p className="text-[13px] text-muted mt-2 leading-[1.5]">
          iCal is set per apartment. Open the Apartments tab, paste each listing&apos;s
          .ics export (Airbnb / Booking / Guesty) and save.
        </p>
        <Link href="/agency/apartments" className="btn btn-ghost !w-auto px-5 mt-4 inline-flex">
          Go to apartments
        </Link>
      </div>

      {/* Stripe */}
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <span className="badge pill-off">Soon</span>
          <span className="font-serif text-[17px] font-semibold">Stripe payouts</span>
        </div>
        <p className="text-[13px] text-muted mt-2 leading-[1.5]">
          Connect your Stripe account so extensions are paid straight to you.
          Coming in the next update.
        </p>
        <button disabled className="btn btn-ghost !w-auto px-5 mt-4 opacity-50">
          Connect Stripe
        </button>
      </div>

      {/* Guesty */}
      <div className="card p-6 lg:col-span-2">
        <div className="flex items-center gap-2">
          <span className="badge badge-busy">API</span>
          <span className="font-serif text-[17px] font-semibold">Guesty (PMS)</span>
        </div>
        <p className="text-[13px] text-muted mt-2 leading-[1.5]">
          Paste the Client ID &amp; Secret from your Guesty account
          (Integrations → API &amp; Webhooks) to pull your listings and their
          cross-platform availability.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="field">
            <label>Client ID</label>
            <input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="0oa…" />
          </div>
          <div className="field">
            <label>Client Secret</label>
            <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <button className="btn btn-primary !w-auto px-6 mt-4" disabled={!cid || !secret || busy} onClick={connect}>
          {busy ? "Connecting…" : "Connect"}
        </button>

        {res && (
          <div className="mt-4">
            <span className="badge badge-free">
              Connected · {res.total} listings{res.stored ? " · saved" : ""}
            </span>
            <ul className="mt-3 space-y-1.5">
              {res.listings.slice(0, 8).map((l) => (
                <li key={l.id} className="text-[13px] text-creamDim flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold" /> {l.title}
                </li>
              ))}
            </ul>
          </div>
        )}
        {err && <div className="mt-4 text-[13px] text-[#e0857a]">Connection failed — {err}</div>}

        {/* Webhook URL to paste into Guesty */}
        <div className="mt-6 pt-5 border-t border-line">
          <div className="text-[13px] font-medium">Real-time sync (webhook)</div>
          <p className="text-[12.5px] text-muted mt-1 leading-[1.5]">
            In Guesty (Integrations → Webhooks), add this URL so availability stays
            in sync and a night booked elsewhere is never sold twice:
          </p>
          <div className="flex items-center gap-2 mt-3">
            <code className="flex-1 text-[12px] bg-panel2 rounded-[2px] px-3 py-2 overflow-x-auto whitespace-nowrap">
              {webhookUrl}
            </code>
            <button onClick={copyWebhook} className="btn btn-ghost !w-auto px-4 text-[12px]">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
