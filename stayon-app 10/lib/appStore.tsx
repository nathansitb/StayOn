"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Apartment,
  AppNotification,
  Booking,
  FlowType,
  HostSession,
  Plan,
} from "./types";
import { APARTMENTS } from "./data";

/**
 * Shared, persisted application state.
 *
 * This is the seam that makes the demo feel real: a booking paid in the guest
 * flow is pushed here and instantly shows up in the agency dashboard and the
 * host space. A listing added during host onboarding appears in the dashboard.
 * Everything is stored in localStorage so it survives refreshes.
 */

const SEED_BOOKINGS: Booking[] = [
  mkBooking("Sophisticated Apartment", "a1", "Camille R.", "night", 1, 170, "-2h"),
  mkBooking("Opéra Suite", "a4", "James W.", "late", 1, 55, "-5h", "16:00"),
  mkBooking("Riverside Loft", "a2", "Sofia M.", "night", 2, 280, "-9h"),
  mkBooking("Golden Studio", "a3", "Liam T.", "cleaning", 0, 29, "-11h", undefined, "refresh", "11:00 – 12:00"),
  mkBooking("Latin Quarter Nest", "a5", "Ava K.", "late", 1, 35, "-1d", "14:00"),
];

function mkBooking(
  apartmentName: string,
  apartmentId: string,
  guestName: string,
  flow: FlowType,
  nights: number,
  price: number,
  ago: string,
  lateTime?: string,
  cleaningService?: string,
  cleaningSlot?: string
): Booking {
  const now = Date.now();
  const offset =
    ago === "-2h" ? 2 * 3600e3 :
    ago === "-5h" ? 5 * 3600e3 :
    ago === "-9h" ? 9 * 3600e3 :
    ago === "-11h" ? 11 * 3600e3 :
    24 * 3600e3;
  return {
    id: "bk_" + Math.random().toString(36).slice(2, 9),
    apartmentId,
    apartmentName,
    guestName,
    flow,
    nights,
    lateTime,
    cleaningService,
    cleaningSlot,
    price,
    date: "Jul 2026",
    createdAt: now - offset,
    status: "confirmed",
    channel: "QR",
  };
}

interface AppState {
  bookings: Booking[];
  apartments: Apartment[];
  host: HostSession;
  notifications: AppNotification[];
  demoIcalUrl: string;
  setDemoIcalUrl: (url: string) => void;
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status" | "channel">) => Booking;
  addApartment: (a: Omit<Apartment, "id">) => void;
  toggleOption: (id: string, key: "extraNight" | "lateCheckout") => void;
  loginHost: (session: Partial<HostSession>) => void;
  logoutHost: () => void;
  setPlan: (plan: Plan) => void;
  markAllRead: () => void;
  reset: () => void;
}

const DEFAULT_HOST: HostSession = {
  loggedIn: false,
  name: "",
  email: "",
  company: "",
  plan: "free",
};

const Ctx = createContext<AppState | null>(null);
const KEY = "stayon-state-v1";

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [apartments, setApartments] = useState<Apartment[]>(APARTMENTS);
  const [host, setHost] = useState<HostSession>(DEFAULT_HOST);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [demoIcalUrl, setDemoIcalUrl] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) {
        const s = JSON.parse(raw);
        if (s.bookings) setBookings(s.bookings);
        if (s.apartments) setApartments(s.apartments);
        if (s.host) setHost(s.host);
        if (s.notifications) setNotifications(s.notifications);
        if (typeof s.demoIcalUrl === "string") setDemoIcalUrl(s.demoIcalUrl);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ bookings, apartments, host, notifications, demoIcalUrl })
      );
    } catch {
      /* ignore */
    }
  }, [bookings, apartments, host, notifications, demoIcalUrl, hydrated]);

  const value = useMemo<AppState>(() => {
    return {
      bookings,
      apartments,
      host,
      notifications,
      demoIcalUrl,
      setDemoIcalUrl,
      addBooking: (b) => {
        const booking: Booking = {
          ...b,
          id: "bk_" + Math.random().toString(36).slice(2, 9),
          createdAt: Date.now(),
          status: "confirmed",
          channel: "QR",
        };
        setBookings((prev) => [booking, ...prev]);
        const kind =
          b.flow === "night" ? "extension" : b.flow === "late" ? "late" : "cleaning";
        const title =
          b.flow === "night"
            ? `New extension · ${b.apartmentName}`
            : b.flow === "late"
              ? `New late checkout · ${b.apartmentName}`
              : `New cleaning · ${b.apartmentName}`;
        setNotifications((prev) => [
          {
            id: "nt_" + Math.random().toString(36).slice(2, 9),
            kind,
            title,
            detail: `${b.guestName} · €${b.price}`,
            createdAt: Date.now(),
            read: false,
          },
          ...prev,
        ]);
        return booking;
      },
      addApartment: (a) => {
        const apt: Apartment = { ...a, id: "a_" + Math.random().toString(36).slice(2, 7) };
        setApartments((prev) => [apt, ...prev]);
        setNotifications((prev) => [
          {
            id: "nt_" + Math.random().toString(36).slice(2, 9),
            kind: "listing",
            title: `New listing added · ${a.name}`,
            detail: `${a.location} · €${a.extendPrice}/night`,
            createdAt: Date.now(),
            read: false,
          },
          ...prev,
        ]);
      },
      toggleOption: (id, key) =>
        setApartments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, [key]: !a[key] } : a))
        ),
      loginHost: (session) =>
        setHost((prev) => ({ ...prev, ...session, loggedIn: true })),
      logoutHost: () => setHost(DEFAULT_HOST),
      setPlan: (plan) => setHost((prev) => ({ ...prev, plan })),
      markAllRead: () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
      reset: () => {
        setBookings(SEED_BOOKINGS);
        setApartments(APARTMENTS);
        setHost(DEFAULT_HOST);
        setNotifications([]);
        setDemoIcalUrl("");
      },
    };
  }, [bookings, apartments, host, notifications, demoIcalUrl]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
