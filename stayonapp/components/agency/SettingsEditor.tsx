"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SETTINGS_TABS, type AgencySettings, type SettingsTab } from "@/lib/agency-settings";
import { LATE_OPTIONS, CLEANING_SERVICES } from "@/lib/data";
import { saveAgencySettings } from "./settings-client";



const CLEAN_LABEL: Record<string, string> = { refresh: "Refresh (quick tidy)", full: "Full cleaning", linen: "Linen change" };
const LEGAL_FORMS = ["Micro-entreprise", "EI", "SASU", "SAS", "EURL", "SARL", "Other"];
const CHECKOUT_TIMES = ["10:00", "10:30", "11:00", "11:30", "12:00"];

const input = "w-full bg-panel2 border border-line rounded-[2px] px-3.5 py-2.5 text-[14px] text-cream outline-none focus:border-gold placeholder:text-muted";

export function SettingsEditor({
  agencyId,
  initial,
  initialTab,
  agencyName,
  email,
  apartmentCount,
}: {
  agencyId: string;
  initial: AgencySettings;
  initialTab: SettingsTab;
  agencyName: string;
  email: string;
  apartmentCount: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [s, setS] = useState<AgencySettings>(initial);
  const [saved, setSaved] = useState<AgencySettings>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = JSON.stringify(s) !== JSON.stringify(saved);

  function set<K extends keyof AgencySettings>(section: K, patch: Partial<AgencySettings[K]>) {
    setS((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...patch } }));
    setMsg(null);
  }

  async function save(section: keyof AgencySettings) {
    setBusy(true);
    const r = await saveAgencySettings(agencyId, { [section]: s[section] } as never);
    setBusy(false);
    if (r.ok && r.settings) {
      setSaved((prev) => ({ ...prev, [section]: r.settings![section] }));
      setMsg({ ok: true, text: "Saved." });
      router.refresh();
    } else {
      setMsg({ ok: false, text: r.error?.includes("agency_settings") ? "Run db/agency-v2.sql in Supabase first." : r.error ?? "Could not save." });
    }
  }

  function switchTab(t: SettingsTab) {
    setTab(t);
    setMsg(null);
    window.history.replaceState(null, "", `/agency/settings?tab=${t}`);
  }

  const SaveBar = ({ section }: { section: keyof AgencySettings }) => (
    <div className="flex items-center gap-4 mt-7 pt-5 border-t border-line">
      <button
        onClick={() => save(section)}
        disabled={busy || JSON.stringify(s[section]) === JSON.stringify(saved[section])}
        className="text-[11px] uppercase tracking-[1.2px] bg-cream text-[#111] rounded-[2px] px-5 py-3 disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
      {msg && <span className={`text-[13px] ${msg.ok ? "text-gold" : "text-[#c98b7a]"}`}>{msg.text}</span>}
      {!msg && JSON.stringify(s[section]) !== JSON.stringify(saved[section]) && <span className="text-[12px] text-muted">Unsaved changes</span>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 mt-6">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
        {SETTINGS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`text-left px-4 py-2.5 rounded-[2px] text-[13px] whitespace-nowrap transition ${
              tab === t.id ? "bg-panel border border-lineStrong text-cream" : "text-muted hover:text-cream border border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
        {dirty && <div className="hidden lg:block text-[11px] text-muted px-4 pt-3">● Unsaved changes</div>}
      </nav>

      <div className="card p-6 sm:p-8 min-w-0">
        {tab === "profile" && (
          <>
            <Head title="Agency profile" sub="How your agency appears to guests on the StayOn page and in e-mails." />
            <Grid>
              <Field label="Name shown to guests" hint={`Displayed as "Hosted by …". Leave empty to hide.`}>
                <input className={input} value={s.profile.displayName} onChange={(e) => set("profile", { displayName: e.target.value })} placeholder={agencyName} maxLength={60} />
              </Field>
              <Field label="Website">
                <input className={input} value={s.profile.website} onChange={(e) => set("profile", { website: e.target.value })} placeholder="https://" />
              </Field>
              <Field label="Contact e-mail for guests">
                <input type="email" className={input} value={s.profile.contactEmail} onChange={(e) => set("profile", { contactEmail: e.target.value })} placeholder="contact@agency.com" />
              </Field>
              <Field label="Contact phone for guests">
                <input className={input} value={s.profile.contactPhone} onChange={(e) => set("profile", { contactPhone: e.target.value })} placeholder="+33 6 12 34 56 78" />
              </Field>
            </Grid>
            <Field label="Agency address" className="mt-5">
              <input className={input} value={s.profile.address} onChange={(e) => set("profile", { address: e.target.value })} placeholder="12 rue …, 75008 Paris" />
            </Field>
            <SaveBar section="profile" />
          </>
        )}

        {tab === "guest" && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
            <div>
              <Head title="Guest page" sub="What guests see after scanning a plaque. Applies to every apartment." />
              <Field label="Welcome message" hint={`${s.guest.welcomeMessage.length}/240 · Leave empty for the default sentence.`}>
                <textarea rows={3} maxLength={240} className={input + " resize-none"} value={s.guest.welcomeMessage} onChange={(e) => set("guest", { welcomeMessage: e.target.value })} placeholder="Would you like to extend your stay or request a service?" />
              </Field>
              <Grid className="mt-5">
                <Field label="Standard checkout time" hint="Shown on the late-checkout screen.">
                  <select className={input} value={s.guest.checkoutTime} onChange={(e) => set("guest", { checkoutTime: e.target.value })}>
                    {CHECKOUT_TIMES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Max. extra nights per booking" hint="Between 1 and 14.">
                  <input type="number" min={1} max={14} className={input} value={s.guest.maxNights} onChange={(e) => set("guest", { maxNights: Math.max(1, Math.min(14, Number(e.target.value) || 1)) })} />
                </Field>
              </Grid>
              <div className="mt-6 space-y-1">
                <Toggle label="Suggest nearby apartments" desc="When the night is taken, show your nearest free apartments instead of losing the guest." on={s.guest.showNearby} onChange={(v) => set("guest", { showNearby: v })} />
                <Toggle label="Show my contact details" desc="Your phone / e-mail (Profile tab) on the confirmation and 'not available' screens." on={s.guest.showContact} onChange={(v) => set("guest", { showContact: v })} />
              </div>
              <SaveBar section="guest" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[1.5px] text-muted mb-3">Preview</div>
              <div className="rounded-[18px] border border-lineStrong bg-bg p-5 text-center">
                <div className="font-serif text-[22px]">StayOn</div>
                <div className="font-serif text-[17px] font-semibold mt-5">Haussmann 6B</div>
                <div className="text-[11.5px] text-muted mt-0.5">Paris 8e</div>
                {s.profile.displayName && <div className="text-[9.5px] uppercase tracking-[1.4px] text-gold mt-2">Hosted by {s.profile.displayName}</div>}
                <p className="text-[12.5px] text-creamDim leading-[1.55] mt-4 whitespace-pre-line">{s.guest.welcomeMessage || "Would you like to extend your stay or request a service?"}</p>
                <div className="mt-4 space-y-2">
                  {s.services.night && <div className="bg-cream text-[#111] text-[9.5px] uppercase tracking-[1.2px] py-2.5 rounded-[2px]">Stay one more night</div>}
                  {s.services.late && <div className="border border-lineStrong text-[9.5px] uppercase tracking-[1.2px] py-2.5 rounded-[2px]">Request late checkout</div>}
                  {s.services.cleaning && <div className="border border-lineStrong text-[9.5px] uppercase tracking-[1.2px] py-2.5 rounded-[2px]">Book a cleaning</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "services" && (
          <ServicesTab
            s={s}
            set={set}
            agencyId={agencyId}
            apartmentCount={apartmentCount}
            saveBar={<SaveBar section="services" />}
          />
        )}

        {tab === "notifications" && (
          <>
            <Head title="Notifications" sub="Choose what StayOn e-mails you, and where." />
            <Field label="Send notifications to" hint={`Leave empty to use ${email}.`}>
              <input type="email" className={input} value={s.notifications.email} onChange={(e) => set("notifications", { email: e.target.value })} placeholder={email} />
            </Field>
            <div className="mt-6 space-y-1">
              <Toggle label="Every new booking" desc="An e-mail as soon as a guest pays: apartment, service, amount, reference." on={s.notifications.newBooking} onChange={(v) => set("notifications", { newBooking: v })} />
              <Toggle label="Daily digest" desc="Every morning at 8:00: yesterday's bookings and revenue. Sent only if there was activity." on={s.notifications.dailyDigest} onChange={(v) => set("notifications", { dailyDigest: v })} />
              <Toggle label="Weekly report" desc="Every Monday: last week's revenue, bookings, scans and best apartment." on={s.notifications.weeklyReport} onChange={(v) => set("notifications", { weeklyReport: v })} />
              <Toggle label="Set-up alerts in the dashboard" desc="Warn me about apartments without calendar, photo or location, and plaques nobody scans." on={s.notifications.setupAlerts} onChange={(v) => set("notifications", { setupAlerts: v })} />
            </div>
            <SaveBar section="notifications" />
          </>
        )}

        {tab === "billing" && (
          <>
            <Head title="Billing details" sub="Your company details, used on StayOn statements and in the file names of your exports." />
            <Grid>
              <Field label="Company name">
                <input className={input} value={s.billing.companyName} onChange={(e) => set("billing", { companyName: e.target.value })} placeholder="Agency SAS" />
              </Field>
              <Field label="Legal form">
                <select className={input} value={s.billing.legalForm} onChange={(e) => set("billing", { legalForm: e.target.value })}>
                  <option value="">Select…</option>
                  {LEGAL_FORMS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="SIRET" hint={s.billing.siret && s.billing.siret.replace(/\s/g, "").length !== 14 ? "A SIRET has 14 digits." : "14 digits."}>
                <input className={input} value={s.billing.siret} onChange={(e) => set("billing", { siret: e.target.value.replace(/[^\d ]/g, "") })} placeholder="123 456 789 00012" inputMode="numeric" />
              </Field>
              <Field label="VAT number" hint="Optional (FR + 11 characters).">
                <input className={input} value={s.billing.vatNumber} onChange={(e) => set("billing", { vatNumber: e.target.value.toUpperCase() })} placeholder="FR12345678901" />
              </Field>
              <Field label="Billing address">
                <input className={input} value={s.billing.billingAddress} onChange={(e) => set("billing", { billingAddress: e.target.value })} />
              </Field>
              <Field label="Invoices sent to">
                <input type="email" className={input} value={s.billing.invoiceEmail} onChange={(e) => set("billing", { invoiceEmail: e.target.value })} placeholder="accounting@agency.com" />
              </Field>
            </Grid>
            <p className="text-[12px] text-muted mt-5 leading-[1.6]">Payouts go through Stripe: bank details are entered on Stripe&apos;s secure page, never stored by StayOn.</p>
            <SaveBar section="billing" />
          </>
        )}

        {tab === "account" && <AccountTab agencyName={agencyName} email={email} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Services */

function ServicesTab({
  s,
  set,
  agencyId,
  apartmentCount,
  saveBar,
}: {
  s: AgencySettings;
  set: <K extends keyof AgencySettings>(section: K, patch: Partial<AgencySettings[K]>) => void;
  agencyId: string;
  apartmentCount: number;
  saveBar: React.ReactNode;
}) {
  const [what, setWhat] = useState({ services: true, late: true, cleaning: true, night: false });
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function applyAll() {
    if (!apartmentCount) return;
    if (!window.confirm(`Apply these settings to all ${apartmentCount} apartments? Their current prices will be replaced.`)) return;
    setApplying(true);
    setDone(null);
    const patch: Record<string, unknown> = {};
    if (what.services) Object.assign(patch, { extra_night: s.services.night, late_checkout: s.services.late, cleaning: s.services.cleaning });
    if (what.late) patch.late_prices = s.services.latePrices;
    if (what.cleaning) patch.cleaning_prices = s.services.cleaningPrices;
    if (what.night) patch.extend_price = s.services.nightPrice;
    const { error } = await createClient().from("apartments").update(patch).eq("agency_id", agencyId);
    setApplying(false);
    setDone(error ? `Error: ${error.message}` : `Applied to ${apartmentCount} apartments.`);
  }

  return (
    <>
      <Head title="Services & pricing" sub="Default services and prices. Used for every new apartment, and can be applied to all existing ones in one click." />
      <div className="space-y-1">
        <Toggle label="Extra nights" desc="Guests can extend their stay when the next night is free." on={s.services.night} onChange={(v) => set("services", { night: v })} />
        <Toggle label="Late checkout" desc="Guests keep the apartment a few hours longer." on={s.services.late} onChange={(v) => set("services", { late: v })} />
        <Toggle label="Cleaning" desc="Mid-stay cleaning or linen change, on a time slot." on={s.services.cleaning} onChange={(v) => set("services", { cleaning: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-7">
        <div>
          <div className="text-[10px] uppercase tracking-[1.5px] text-muted mb-3">Extra night</div>
          <Price label="Default nightly price" value={s.services.nightPrice} onChange={(v) => set("services", { nightPrice: v })} />
          <p className="text-[11.5px] text-muted mt-2 leading-[1.5]">Each apartment keeps its own nightly price; this one pre-fills new apartments.</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[1.5px] text-muted mb-3">Late checkout · until</div>
          <div className="space-y-2.5">
            {LATE_OPTIONS.map((o) => (
              <Price key={o.time} label={o.time} value={s.services.latePrices[o.time] ?? o.price} onChange={(v) => set("services", { latePrices: { ...s.services.latePrices, [o.time]: v } })} />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[1.5px] text-muted mb-3">Cleaning</div>
          <div className="space-y-2.5">
            {CLEANING_SERVICES.map((c) => (
              <Price key={c.key} label={CLEAN_LABEL[c.key] ?? c.key} value={s.services.cleaningPrices[c.key] ?? c.price} onChange={(v) => set("services", { cleaningPrices: { ...s.services.cleaningPrices, [c.key]: v } })} />
            ))}
          </div>
        </div>
      </div>
      {saveBar}

      <div className="mt-8 rounded-[3px] border border-line p-5" style={{ background: "rgba(198,167,106,.04)" }}>
        <div className="font-serif text-[18px] font-semibold">Apply to all apartments</div>
        <p className="text-[13px] text-creamDim mt-1">Push the settings above to your {apartmentCount} existing apartment{apartmentCount === 1 ? "" : "s"} at once. Save first.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[13px]">
          {([
            ["services", "Services on / off"],
            ["late", "Late-checkout prices"],
            ["cleaning", "Cleaning prices"],
            ["night", "Nightly price"],
          ] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={what[k]} onChange={(e) => setWhat({ ...what, [k]: e.target.checked })} className="accent-[#C6A76A]" />
              {l}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-5">
          <button onClick={applyAll} disabled={applying || !apartmentCount || !Object.values(what).some(Boolean)} className="text-[11px] uppercase tracking-[1.2px] border border-gold text-gold rounded-[2px] px-5 py-3 disabled:opacity-40">
            {applying ? "Applying…" : `Apply to ${apartmentCount} apartment${apartmentCount === 1 ? "" : "s"}`}
          </button>
          {done && <span className="text-[13px] text-creamDim">{done}</span>}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ Account */

function AccountTab({ agencyName, email }: { agencyName: string; email: string }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setMsg({ ok: false, text: "At least 8 characters." });
    if (pw !== pw2) return setMsg({ ok: false, text: "The two passwords differ." });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    setPw(""); setPw2("");
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password updated." });
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <Head title="Account" sub="Your login and your StayOn plan." />
      <div className="text-[14px]">
        {[["Agency", agencyName], ["Login e-mail", email], ["Plan", "Free — commission only on what StayOn sells"]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3 border-b border-line">
            <span className="text-muted">{k}</span>
            <span className="text-cream text-right">{v}</span>
          </div>
        ))}
      </div>

      <form onSubmit={changePassword} className="mt-8 max-w-[420px]">
        <div className="font-serif text-[18px] font-semibold">Change password</div>
        <div className="space-y-3 mt-4">
          <input type="password" className={input} placeholder="New password (8+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          <input type="password" className={input} placeholder="Repeat new password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button disabled={busy || !pw} className="text-[11px] uppercase tracking-[1.2px] bg-cream text-[#111] rounded-[2px] px-5 py-3 disabled:opacity-40">{busy ? "…" : "Update password"}</button>
          {msg && <span className={`text-[13px] ${msg.ok ? "text-gold" : "text-[#c98b7a]"}`}>{msg.text}</span>}
        </div>
      </form>

      <div className="mt-10 pt-6 border-t border-line">
        <button onClick={signOut} className="text-[11px] uppercase tracking-[1.2px] border border-line text-muted hover:text-cream rounded-[2px] px-5 py-3">Sign out</button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ bits */

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <div className="font-serif text-[22px] font-semibold">{title}</div>
      <p className="text-[13px] text-muted mt-1">{sub}</p>
    </div>
  );
}

function Grid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${className}`}>{children}</div>;
}

function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[12px] text-muted tracking-[.3px] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11.5px] text-muted mt-1.5">{hint}</span>}
    </label>
  );
}

function Toggle({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="w-full flex items-start justify-between gap-6 py-3.5 border-b border-line text-left">
      <span>
        <span className="block text-[14px] text-cream">{label}</span>
        <span className="block text-[12.5px] text-muted mt-0.5 leading-[1.5]">{desc}</span>
      </span>
      <span className={`shrink-0 mt-0.5 w-10 h-[22px] rounded-full p-[3px] transition ${on ? "bg-gold" : "bg-panel2 border border-line"}`}>
        <span className={`block w-4 h-4 rounded-full transition ${on ? "translate-x-[18px] bg-[#111]" : "bg-muted"}`} />
      </span>
    </button>
  );
}

function Price({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-creamDim">{label}</span>
      <span className="flex items-center bg-panel2 border border-line rounded-[2px] focus-within:border-gold">
        <span className="pl-3 text-muted text-[13px]">€</span>
        <input type="number" min={0} max={5000} value={value} onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))} className="w-[72px] bg-transparent px-2 py-2 text-[14px] text-cream text-right outline-none" />
      </span>
    </label>
  );
}
