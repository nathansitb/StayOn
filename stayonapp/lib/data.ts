import type { Apartment, CleaningService, LateOption, NearbyStay } from "./types";

/**
 * Static demo data. Structured so it can later be replaced by a real
 * PMS / channel-manager feed (Guesty, Hostaway, Smoobu, Airbnb, Booking).
 */

export const IMG = {
  hero: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop",
  apt1: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80&auto=format&fit=crop",
  apt2: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80&auto=format&fit=crop",
  apt3: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80&auto=format&fit=crop",
  apt4: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&auto=format&fit=crop",
  apt5: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80&auto=format&fit=crop",
  near1: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&q=80&auto=format&fit=crop",
  near2: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80&auto=format&fit=crop",
  near3: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80&auto=format&fit=crop",
};

/** The apartment tied to the scanned QR code (guest flow). */
export const CURRENT_APARTMENT = {
  id: "apt-sophisticated",
  name: "Sophisticated Apartment",
  addressEn: "Le Marais, 3rd arr. · Paris",
  addressFr: "Le Marais, 3e arr. · Paris",
  image: IMG.hero,
  extraNightPrice: 170,
  dateEn: "Jul 3 – Jul 4, 2026",
  dateFr: "3 – 4 juil. 2026",
};

export const LATE_OPTIONS: LateOption[] = [
  { time: "12:00", price: 15 },
  { time: "13:00", price: 25 },
  { time: "14:00", price: 35 },
  { time: "16:00", price: 55 },
];

/** Housekeeping module: service tiers + available time slots. */
export const CLEANING_SERVICES: CleaningService[] = [
  { key: "refresh", price: 29 },
  { key: "full", price: 49 },
  { key: "linen", price: 19 },
];

export const CLEANING_SLOTS = ["10:00 – 11:00", "11:00 – 12:00", "14:00 – 15:00", "16:00 – 17:00"];

export const NEARBY_STAYS: NearbyStay[] = [
  { id: "n1", name: "Le Petit Loft", image: IMG.near1, distanceKm: 0.4, price: 155 },
  { id: "n2", name: "Marais Maison", image: IMG.near2, distanceKm: 0.7, price: 180 },
  { id: "n3", name: "Rivoli Residence", image: IMG.near3, distanceKm: 1.1, price: 165 },
];

export const APARTMENTS: Apartment[] = [
  { id: "a1", name: "Sophisticated Apartment", location: "Le Marais · Paris", image: IMG.apt1, status: "occupied", extraNight: true, lateCheckout: true, extendPrice: 170 },
  { id: "a2", name: "Riverside Loft", location: "Canal St-Martin", image: IMG.apt2, status: "available", extraNight: true, lateCheckout: true, extendPrice: 140 },
  { id: "a3", name: "Golden Studio", location: "Montmartre", image: IMG.apt3, status: "occupied", extraNight: true, lateCheckout: false, extendPrice: 110 },
  { id: "a4", name: "Opéra Suite", location: "9th arr. · Paris", image: IMG.apt4, status: "available", extraNight: true, lateCheckout: true, extendPrice: 210 },
  { id: "a5", name: "Latin Quarter Nest", location: "5th arr. · Paris", image: IMG.apt5, status: "occupied", extraNight: false, lateCheckout: true, extendPrice: 125 },
];

/** Agency dashboard KPIs (demo). */
export const DASHBOARD = {
  activeQr: 128,
  scans: 842,
  extensionsSold: 61,
  lateCheckoutsSold: 94,
  revenue: 18450,
  conversionRate: 18.4,
  revenueToday: 640,
  revenueMonth: 18450,
  revenueYtd: 163000,
  revenueExtra: 10370,
  revenueLate: 8080,
  monthlyBars: [9, 11, 8, 13, 15, 12, 16, 14, 18, 17, 21, 19], // in €k
  revenueByApartment: [6200, 3100, 1900, 4800, 2450],
};

export const INTEGRATIONS: { name: string; live: boolean }[] = [
  { name: "Stripe", live: true },
  { name: "iCal", live: true },
  { name: "Airbnb", live: true },
  { name: "Guesty", live: false },
  { name: "Hostaway", live: false },
  { name: "Smoobu", live: false },
  { name: "Booking", live: false },
  { name: "PMS", live: false },
];
