/**
 * Real iCal (.ics) engine for StayOn — Phase 1.
 *
 * Airbnb, Booking and Guesty all expose a public `.ics` calendar per listing
 * that lists the BOOKED / blocked date ranges. We fetch it server-side (to
 * avoid browser CORS) and compute which nights are free.
 *
 * An iCal VEVENT blocks nights [DTSTART, DTEND) — DTEND is the checkout day
 * and is itself NOT a blocked night.
 */

export interface IcalEvent {
  start: string; // YYYY-MM-DD (first blocked night)
  end: string; // YYYY-MM-DD (checkout day, exclusive)
  summary?: string;
}

/** Unfold folded lines (RFC 5545: continuation lines start with space/tab). */
function unfold(raw: string): string[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

/** Extract YYYY-MM-DD from a DTSTART/DTEND value (date or datetime). */
function toDate(value: string): string | null {
  const m = value.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/** Parse a raw .ics string into blocked events. */
export function parseIcs(text: string): IcalEvent[] {
  const lines = unfold(text);
  const events: IcalEvent[] = [];
  let cur: Partial<IcalEvent> | null = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      cur = {};
    } else if (line.startsWith("END:VEVENT")) {
      if (cur && cur.start && cur.end) {
        events.push({ start: cur.start, end: cur.end, summary: cur.summary });
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).toUpperCase();
      const val = line.slice(idx + 1).trim();
      if (key.startsWith("DTSTART")) cur.start = toDate(val) ?? cur.start;
      else if (key.startsWith("DTEND")) cur.end = toDate(val) ?? cur.end;
      else if (key.startsWith("SUMMARY")) cur.summary = val;
    }
  }
  return events;
}

const DAY = 86400000;
function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + n * DAY;
  const dt = new Date(t);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

/** Set of all blocked nights (YYYY-MM-DD) from a list of events. */
export function blockedNights(events: IcalEvent[]): Set<string> {
  const set = new Set<string>();
  for (const e of events) {
    let cursor = e.start;
    // guard against malformed / huge ranges
    for (let i = 0; i < 400 && cursor < e.end; i++) {
      set.add(cursor);
      cursor = addDays(cursor, 1);
    }
  }
  return set;
}

/** Is a given night (YYYY-MM-DD) free according to this .ics text? */
export function isNightAvailable(icsText: string, night: string): boolean {
  return !blockedNights(parseIcs(icsText)).has(night);
}

/** Fetch an .ics URL server-side and return its raw text. */
export async function fetchIcal(url: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) throw new Error("Invalid iCal URL");
  const res = await fetch(url, {
    headers: { "User-Agent": "StayOn/1.0 (+https://stayon.app)" },
    // calendars change slowly; cache a bit at the edge
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`iCal fetch failed (${res.status})`);
  const text = await res.text();
  if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Not a valid iCal feed");
  return text;
}

/** High-level: given a URL + night, is it available? (+ some context) */
export async function checkIcalAvailability(
  url: string,
  night: string
): Promise<{ available: boolean; blockedCount: number }> {
  const text = await fetchIcal(url);
  const blocked = blockedNights(parseIcs(text));
  return { available: !blocked.has(night), blockedCount: blocked.size };
}
