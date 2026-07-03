/**
 * Real Guesty Open API client for StayOn — Phase 1.
 *
 * Each AGENCY generates its own Client ID + Client Secret inside its Guesty
 * account (Integrations → API & Webhooks) and connects it to StayOn. We
 * exchange those for an OAuth2 access token (client_credentials, valid 24h),
 * then read the agency's listings and their availability calendars.
 *
 * All calls run server-side only (secrets never reach the browser).
 */

const BASE = "https://open-api.guesty.com";
const TOKEN_URL = `${BASE}/oauth2/token`;

export interface GuestyToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

export interface GuestyListing {
  id: string;
  title: string;
  address?: string;
  active?: boolean;
}

/** Exchange Client ID/Secret for an access token (client_credentials). */
export async function getGuestyToken(
  clientId: string,
  clientSecret: string
): Promise<GuestyToken> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "open-api",
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Guesty auth failed (${res.status}) ${t.slice(0, 140)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  return {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 86400) * 1000,
  };
}

async function guestyGet<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Guesty GET ${path} failed (${res.status}) ${t.slice(0, 140)}`);
  }
  return (await res.json()) as T;
}

/** List the agency's listings (first page). */
export async function listGuestyListings(
  token: string,
  limit = 25
): Promise<{ listings: GuestyListing[]; total: number }> {
  const data = await guestyGet<{
    results: Array<{ _id: string; title?: string; nickname?: string; address?: { full?: string }; active?: boolean }>;
    count: number;
  }>(token, `/v1/listings?limit=${limit}&skip=0`);
  return {
    total: data.count ?? data.results?.length ?? 0,
    listings: (data.results ?? []).map((l) => ({
      id: l._id,
      title: l.title || l.nickname || "Untitled listing",
      address: l.address?.full,
      active: l.active,
    })),
  };
}

/** Availability calendar for one listing between two YYYY-MM-DD dates. */
export async function getGuestyCalendar(
  token: string,
  listingId: string,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; status: string; available: boolean }>> {
  const data = await guestyGet<{
    data?: { days?: Array<{ date: string; status: string }> };
    days?: Array<{ date: string; status: string }>;
  }>(
    token,
    `/v1/availability-pricing/api/calendar/listings/${listingId}?startDate=${startDate}&endDate=${endDate}`
  );
  const days = data.data?.days ?? data.days ?? [];
  return days.map((d) => ({
    date: d.date,
    status: d.status,
    available: d.status === "available",
  }));
}

/** Is a given night available for a Guesty listing? */
export async function guestyNightAvailable(
  token: string,
  listingId: string,
  night: string
): Promise<boolean> {
  const cal = await getGuestyCalendar(token, listingId, night, night);
  const day = cal.find((d) => d.date === night) ?? cal[0];
  return day ? day.available : false;
}
