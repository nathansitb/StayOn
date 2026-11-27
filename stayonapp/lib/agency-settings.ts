import type { SupabaseClient } from "@supabase/supabase-js";
import { LATE_OPTIONS, CLEANING_SERVICES } from "./data";

/**
 * Every customisation option of an agency, stored as one JSON document in
 * `agency_settings.data` (see db/agency-v2.sql). Missing keys always fall back
 * to DEFAULT_SETTINGS, so older rows keep working when new options are added.
 */
export interface AgencySettings {
  profile: {
    displayName: string;      // shown to guests ("Hosted by …")
    contactEmail: string;     // shown to guests if guest.showContact
    contactPhone: string;
    website: string;
    address: string;
  };
  guest: {
    welcomeMessage: string;   // replaces the default line on the guest welcome screen
    checkoutTime: string;     // standard checkout, shown on the late-checkout screen
    showNearby: boolean;      // suggest nearby apartments when a night is taken
    showContact: boolean;     // show the agency contact on confirmation / unavailable screens
    maxNights: number;        // max extra nights a guest can add in one go
  };
  services: {
    night: boolean;           // defaults for NEW apartments + "apply to all"
    late: boolean;
    cleaning: boolean;
    nightPrice: number;
    latePrices: Record<string, number>;
    cleaningPrices: Record<string, number>;
  };
  notifications: {
    email: string;            // recipient; empty = the account e-mail
    newBooking: boolean;      // e-mail on every paid booking
    dailyDigest: boolean;     // 8:00 summary of yesterday
    weeklyReport: boolean;    // Monday summary of last week
    setupAlerts: boolean;     // show set-up alerts in the Notifications tab
  };
  billing: {
    companyName: string;
    legalForm: string;
    siret: string;
    vatNumber: string;
    billingAddress: string;
    invoiceEmail: string;
  };
  notificationsSeenAt: string | null;
}

export const DEFAULT_SETTINGS: AgencySettings = {
  profile: { displayName: "", contactEmail: "", contactPhone: "", website: "", address: "" },
  guest: { welcomeMessage: "", checkoutTime: "11:00", showNearby: true, showContact: true, maxNights: 7 },
  services: {
    night: true,
    late: true,
    cleaning: true,
    nightPrice: 150,
    latePrices: Object.fromEntries(LATE_OPTIONS.map((o) => [o.time, o.price])),
    cleaningPrices: Object.fromEntries(CLEANING_SERVICES.map((s) => [s.key, s.price])),
  },
  notifications: { email: "", newBooking: true, dailyDigest: false, weeklyReport: true, setupAlerts: true },
  billing: { companyName: "", legalForm: "", siret: "", vatNumber: "", billingAddress: "", invoiceEmail: "" },
  notificationsSeenAt: null,
};

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v);
const obj = (v: unknown): Json => (isObj(v) ? v : {});

/** Fill every missing option with its default (section by section). */
export function withDefaults(raw: unknown): AgencySettings {
  const r = obj(raw);
  const d = DEFAULT_SETTINGS;
  const rs = obj(r.services);
  return {
    profile: { ...d.profile, ...obj(r.profile) } as AgencySettings["profile"],
    guest: { ...d.guest, ...obj(r.guest) } as AgencySettings["guest"],
    services: {
      ...d.services,
      ...rs,
      latePrices: { ...d.services.latePrices, ...obj(rs.latePrices) },
      cleaningPrices: { ...d.services.cleaningPrices, ...obj(rs.cleaningPrices) },
    } as AgencySettings["services"],
    notifications: { ...d.notifications, ...obj(r.notifications) } as AgencySettings["notifications"],
    billing: { ...d.billing, ...obj(r.billing) } as AgencySettings["billing"],
    notificationsSeenAt: typeof r.notificationsSeenAt === "string" ? r.notificationsSeenAt : null,
  };
}

/** Read an agency's settings (RLS client for the agency, or the admin client on the server). */
export async function getAgencySettings(supabase: SupabaseClient, agencyId: string): Promise<AgencySettings> {
  if (!agencyId) return DEFAULT_SETTINGS;
  const { data } = await supabase.from("agency_settings").select("data").eq("agency_id", agencyId).maybeSingle();
  return withDefaults(data?.data);
}

/** The subset of settings the public guest page needs (never billing details). */
export interface GuestBranding {
  displayName: string;
  welcomeMessage: string;
  checkoutTime: string;
  showNearby: boolean;
  contactEmail: string;
  contactPhone: string;
  maxNights: number;
}

export function guestBranding(s: AgencySettings): GuestBranding {
  return {
    displayName: s.profile.displayName,
    welcomeMessage: s.guest.welcomeMessage,
    checkoutTime: s.guest.checkoutTime,
    showNearby: s.guest.showNearby,
    contactEmail: s.guest.showContact ? s.profile.contactEmail : "",
    contactPhone: s.guest.showContact ? s.profile.contactPhone : "",
    maxNights: Math.max(1, Math.min(30, s.guest.maxNights || 7)),
  };
}

/** Sub-tabs of the Settings page (kept here so server and client share them). */
export const SETTINGS_TABS = [
  { id: "profile", label: "Profile" },
  { id: "guest", label: "Guest page" },
  { id: "services", label: "Services & pricing" },
  { id: "notifications", label: "Notifications" },
  { id: "billing", label: "Billing" },
  { id: "account", label: "Account" },
] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number]["id"];
