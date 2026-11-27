"use client";

import { useEffect, useState } from "react";

export interface AgencyRow {
  id: string;
  name: string;
  plan: string;
  created_at: string;
  apartmentCount: number;
  revenue: number;
}
export interface ApartmentRow {
  id: string;
  public_code: string;
  name: string;
  location: string | null;
  extend_price: number;
  ical_url: string | null;
  agencyName: string;
}
export interface BookingRow {
  id: string;
  guest_name: string | null;
  flow: string;
  nights: number;
  late_time: string | null;
  cleaning_slot: string | null;
  amount: number;
  created_at: string;
  apartmentName: string;
  agencyName: string;
}

type Tab = "agencies" | "apartments" | "bookings";
const eur = (n: number) => "€" + n.toLocaleString("en-US");

function bookingType(b: BookingRow) {
  if (b.flow === "night") return `Extra night ×${b.nights}`;
  if (b.flow === "late") return `Late checkout ${b.late_time ?? ""}`;
  return `Cleaning ${b.cleaning_slot ?? ""}`;
}

export function AdminConsole({
  agencies,
  apartments,
  bookings,
  totalRevenue,
}: {
  agencies: AgencyRow[];
  apartments: ApartmentRow[];
  bookings: BookingRow[];
  totalRevenue: number;
}) {
  const [tab, setTab] = useState<Tab>("agencies");
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "agencies", label: "Agencies" },
    { id: "apartments", label: "Apartments" },
    { id: "bookings", label: "Bookings" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {[
          { l: "Agencies", n: String(agencies.length) },
          { l: "Apartments", n: String(apartments.length) },
          { l: "Bookings", n: String(bookings.length) },
          { l: "Revenue", n: eur(totalRevenue), gold: true },
        ].map((s) => (
          <div key={s.l} className="card p-5" style={s.gold ? { borderColor: "rgba(198,167,106,.35)" } : {}}>
            <div className="text-[10px] uppercase tracking-[1.5px] text-muted">{s.l}</div>
            <div className={`font-serif text-[26px] font-semibold mt-2 ${s.gold ? "text-gold" : ""}`}>{s.n}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 bg-panel border border-line rounded-[2px] p-[5px] mt-8 mb-5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-[2px] text-[11px] uppercase tracking-[1px] transition ${
              tab === t.id ? "bg-cream text-[#111] font-medium" : "text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "agencies" && (
        <Table head={["Agency", "Plan", "Apartments", "Revenue", "Joined"]}>
          {agencies.length === 0 && <Empty>No agencies yet.</Empty>}
          {agencies.map((a) => (
            <Row key={a.id} cells={[
              <span key="n" className="font-medium">{a.name}</span>,
              <span key="p" className="uppercase text-[11px] tracking-[1px] text-creamDim">{a.plan}</span>,
              String(a.apartmentCount),
              <span key="r" className="font-serif">{eur(a.revenue)}</span>,
              <span key="d" className="text-muted text-[13px]">{new Date(a.created_at).toLocaleDateString()}</span>,
            ]} />
          ))}
        </Table>
      )}

      {tab === "apartments" && (
        <Table head={["Apartment", "Agency", "Price", "iCal", "Link"]}>
          {apartments.length === 0 && <Empty>No apartments yet.</Empty>}
          {apartments.map((a) => (
            <Row key={a.id} cells={[
              <span key="n"><span className="font-medium">{a.name}</span><span className="block text-[12px] text-muted">{a.location || "—"}</span></span>,
              a.agencyName,
              <span key="p" className="font-serif">{eur(a.extend_price)}</span>,
              a.ical_url
                ? <span key="i" className="badge badge-free">On</span>
                : <span key="i" className="badge pill-off">Off</span>,
              <a key="l" href={`${origin}/a/${a.public_code}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-[2px] border border-line text-[10px] uppercase tracking-[1px] text-muted hover:text-cream transition">Open</a>,
            ]} />
          ))}
        </Table>
      )}

      {tab === "bookings" && (
        <Table head={["Guest", "Apartment", "Agency", "Type", "Amount", "When"]}>
          {bookings.length === 0 && <Empty>No bookings yet.</Empty>}
          {bookings.map((b) => (
            <Row key={b.id} cells={[
              <span key="g" className="font-medium">{b.guest_name || "Guest"}</span>,
              b.apartmentName,
              b.agencyName,
              <span key="t" className="pill pill-on">{bookingType(b)}</span>,
              <span key="a" className="font-serif">{eur(b.amount)}</span>,
              <span key="w" className="text-muted text-[13px]">{new Date(b.created_at).toLocaleString()}</span>,
            ]} />
          ))}
        </Table>
      )}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card p-1.5">
      <div className="hidden md:grid gap-3 px-5 py-3 text-[10px] uppercase tracking-[1px] text-muted border-b border-line"
        style={{ gridTemplateColumns: `repeat(${head.length}, minmax(0,1fr))` }}>
        {head.map((h) => <div key={h}>{h}</div>)}
      </div>
      {children}
    </div>
  );
}
function Row({ cells }: { cells: React.ReactNode[] }) {
  return (
    <div className="grid grid-cols-1 md:gap-3 gap-2 px-5 py-3.5 border-b border-line last:border-b-0 text-[14px] items-center"
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0,1fr))` }}>
      {cells.map((c, i) => <div key={i} className="min-w-0 truncate">{c}</div>)}
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-10 text-center text-muted text-[14px]">{children}</div>;
}
