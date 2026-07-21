"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QrCode } from "@/components/ui/QrCode";
import { LATE_OPTIONS, CLEANING_SERVICES } from "@/lib/data";

const CLEAN_LABEL: Record<string, string> = { refresh: "Refresh", full: "Full", linen: "Linen" };

interface Apt {
  id: string;
  public_code: string;
  name: string;
  location: string | null;
  image_url: string | null;
  extend_price: number;
  extra_night: boolean;
  late_checkout: boolean;
  cleaning: boolean;
  ical_url: string | null;
  lat: number | null;
  lng: number | null;
  late_prices: Record<string, number> | null;
  cleaning_prices: Record<string, number> | null;
}

/** Geocode an address to coordinates (best-effort). */
async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  if (!q || q.trim().length < 3) return null;
  try {
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const j = await r.json();
    return j.found ? { lat: j.lat, lng: j.lng } : null;
  } catch {
    return null;
  }
}

export function ApartmentsManager({ agencyId }: { agencyId: string }) {
  const supabase = createClient();
  const [apts, setApts] = useState<Apt[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(150);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("apartments")
      .select("*")
      .order("created_at", { ascending: false });
    setApts((data as Apt[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
  }, [load]);

  async function addApt(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setBusy(true);
    setErr(null);
    const coords = await geocode(location);
    const { error } = await supabase
      .from("apartments")
      .insert({ name, location, extend_price: price, agency_id: agencyId, lat: coords?.lat ?? null, lng: coords?.lng ?? null });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setName("");
    setLocation("");
    setPrice(150);
    load();
  }

  return (
    <div className="mt-8">
      {/* add form */}
      <div className="card p-6">
        <div className="font-serif text-[18px] font-semibold">Add an apartment</div>
        <form onSubmit={addApt} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_auto] gap-3 mt-4 items-end">
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sophisticated Apartment" required />
          </div>
          <div className="field">
            <label>Short address</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Le Marais · Paris" />
          </div>
          <div className="field">
            <label>Extra night €</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <button className="btn btn-primary !w-auto px-6" disabled={busy}>
            {busy ? "…" : "Add"}
          </button>
        </form>
        {err && <div className="text-[13px] text-[#e0857a] mt-3">{err}</div>}
      </div>

      {/* list */}
      <div className="mt-6 flex flex-col gap-4">
        {loading && <div className="text-muted text-[14px]">Loading…</div>}
        {!loading && apts.length === 0 && (
          <div className="card p-8 text-center text-muted text-[14px]">
            No apartments yet. Add your first one above — it gets a unique link &amp; QR.
          </div>
        )}
        {apts.map((a) => (
          <ApartmentRow key={a.id} apt={a} origin={origin} supabase={supabase} onChange={load} />
        ))}
      </div>
    </div>
  );
}

const OPT_LABEL: Record<"extra_night" | "late_checkout" | "cleaning", string> = {
  extra_night: "Extra night",
  late_checkout: "Late checkout",
  cleaning: "Cleaning",
};

function ApartmentRow({
  apt,
  origin,
  supabase,
  onChange,
}: {
  apt: Apt;
  origin: string;
  supabase: ReturnType<typeof createClient>;
  onChange: () => void;
}) {
  const [ical, setIcal] = useState(apt.ical_url ?? "");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(apt.name);
  const [location, setLocation] = useState(apt.location ?? "");
  const [price, setPrice] = useState(apt.extend_price);
  const [photo, setPhoto] = useState(apt.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [lat, setLat] = useState<number | null>(apt.lat);
  const [lng, setLng] = useState<number | null>(apt.lng);
  const [locating, setLocating] = useState(false);
  const [latePrices, setLatePrices] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    LATE_OPTIONS.forEach((o) => { base[o.time] = apt.late_prices?.[o.time] ?? o.price; });
    return base;
  });
  const [cleanPrices, setCleanPrices] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    CLEANING_SERVICES.forEach((s) => { base[s.key] = apt.cleaning_prices?.[s.key] ?? s.price; });
    return base;
  });
  const [opts, setOpts] = useState({
    extra_night: apt.extra_night,
    late_checkout: apt.late_checkout,
    cleaning: apt.cleaning,
  });
  const link = `${origin}/a/${apt.public_code}`;

  async function saveIcal() {
    await supabase.from("apartments").update({ ical_url: ical }).eq("id", apt.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onChange();
  }
  function copyLink() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  async function toggleOpt(key: "extra_night" | "late_checkout" | "cleaning") {
    const v = !opts[key];
    setOpts((o) => ({ ...o, [key]: v }));
    await supabase.from("apartments").update({ [key]: v }).eq("id", apt.id);
  }
  async function locate() {
    if (!location) return;
    setLocating(true);
    const c = await geocode(location);
    setLocating(false);
    if (c) {
      setLat(c.lat);
      setLng(c.lng);
    } else {
      alert("Address not found — try a more specific address (street, city).");
    }
  }
  async function saveEdit() {
    // Auto-locate if the address is set but we still have no coordinates.
    let la = lat;
    let ln = lng;
    if (location && (la == null || ln == null)) {
      const c = await geocode(location);
      if (c) {
        la = c.lat;
        ln = c.lng;
        setLat(la);
        setLng(ln);
      }
    }
    await supabase
      .from("apartments")
      .update({
        name,
        location,
        extend_price: price,
        image_url: photo || null,
        lat: la,
        lng: ln,
        late_prices: latePrices,
        cleaning_prices: cleanPrices,
      })
      .eq("id", apt.id);
    setEditing(false);
    onChange();
  }
  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${apt.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("apartment-photos")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (!error) {
      const { data } = supabase.storage.from("apartment-photos").getPublicUrl(path);
      const url = data.publicUrl;
      await supabase.from("apartments").update({ image_url: url }).eq("id", apt.id);
      setPhoto(url);
      onChange();
    } else {
      alert(error.message);
    }
    setUploading(false);
  }
  async function del() {
    if (!window.confirm(`Delete "${apt.name}"? This can't be undone.`)) return;
    await supabase.from("apartments").delete().eq("id", apt.id);
    onChange();
  }

  return (
    <div className="card p-5 flex flex-col md:flex-row gap-5">
      <QrCode value={link} apartmentName={apt.name} />

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="field !mt-0">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field !mt-0">
              <label>Address (for nearby suggestions)</label>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setLat(null); setLng(null); }}
                  placeholder="12 Av. des Champs-Élysées, Paris"
                />
                <button
                  type="button"
                  onClick={locate}
                  className="px-3 py-2.5 rounded-[2px] border border-line text-[10px] uppercase tracking-[1px] text-muted hover:text-cream transition shrink-0"
                >
                  {locating ? "…" : "📍 Locate"}
                </button>
              </div>
              <div className="text-[11px] mt-1" style={{ color: lat != null ? "#8fae86" : "#8a857c" }}>
                {lat != null && lng != null ? `Located ✓ (${lat.toFixed(3)}, ${lng.toFixed(3)})` : "Not located — will locate on save"}
              </div>
            </div>
            <div className="field !mt-0">
              <label>Extra night €</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="field !mt-0 sm:col-span-2">
              <label>Photo of the apartment</label>
              <div className="flex items-center gap-3">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="w-16 h-16 rounded-[2px] object-cover border border-line shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-[2px] bg-panel2 border border-line shrink-0" />
                )}
                <label className="px-4 py-2.5 rounded-[2px] border border-line text-[11px] uppercase tracking-[1px] text-muted hover:text-cream transition cursor-pointer">
                  {uploading ? "Uploading…" : photo ? "Change photo" : "Upload from your computer"}
                  <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-[12.5px] text-muted mb-2">Late checkout prices (€)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LATE_OPTIONS.map((o) => (
                  <div key={o.time} className="field !mt-0">
                    <label>{o.time}</label>
                    <input
                      type="number"
                      value={latePrices[o.time] ?? o.price}
                      onChange={(e) => setLatePrices((p) => ({ ...p, [o.time]: Number(e.target.value) }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-[12.5px] text-muted mb-2">Cleaning prices (€)</div>
              <div className="grid grid-cols-3 gap-2">
                {CLEANING_SERVICES.map((s) => (
                  <div key={s.key} className="field !mt-0">
                    <label>{CLEAN_LABEL[s.key] ?? s.key}</label>
                    <input
                      type="number"
                      value={cleanPrices[s.key] ?? s.price}
                      onChange={(e) => setCleanPrices((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button onClick={saveEdit} className="btn btn-primary !w-auto px-6">Save</button>
              <button onClick={() => setEditing(false)} className="btn btn-ghost !w-auto px-6">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-serif text-[18px] font-semibold truncate">{apt.name}</div>
                <div className="text-muted text-[13px]">{apt.location || "—"} · €{apt.extend_price}/night</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-[2px] border border-line text-[10px] uppercase tracking-[1px] text-muted hover:text-cream transition">Edit</button>
                <button onClick={del} className="px-3 py-1.5 rounded-[2px] border border-line text-[10px] uppercase tracking-[1px] text-[#c98b7a] hover:text-[#e0857a] transition">Delete</button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <code className="text-[12px] text-creamDim bg-panel2 border border-line rounded-[2px] px-2.5 py-1.5 truncate">{link}</code>
              <button onClick={copyLink} className="px-3 py-1.5 rounded-[2px] border border-line text-[10px] uppercase tracking-[1px] text-muted hover:text-cream transition shrink-0">{copied ? "Copied" : "Copy"}</button>
              <a href={link} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-[2px] border border-line text-[10px] uppercase tracking-[1px] text-muted hover:text-cream transition shrink-0">Open</a>
            </div>

            {/* option toggles */}
            <div className="flex flex-wrap gap-2 mt-4">
              {(["extra_night", "late_checkout", "cleaning"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => toggleOpt(k)}
                  className={`px-3 py-1.5 rounded-[2px] text-[10px] uppercase tracking-[1px] border transition ${
                    opts[k] ? "pill-on" : "pill-off"
                  }`}
                >
                  {OPT_LABEL[k]} · {opts[k] ? "On" : "Off"}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2 mt-4">
              <div className="field flex-1 !mt-0">
                <label>iCal URL (Airbnb / Booking / Guesty)</label>
                <input value={ical} onChange={(e) => setIcal(e.target.value)} placeholder="https://…​.ics" />
              </div>
              <button onClick={saveIcal} className="btn btn-dark !w-auto px-5">{saved ? "Saved ✓" : "Save"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
