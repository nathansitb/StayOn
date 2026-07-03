export type Lang = "en" | "fr";

export type FlowType = "night" | "late" | "cleaning";

export type GuestScreen =
  | "welcome"
  | "stay"
  | "late"
  | "cleaning"
  | "summary"
  | "payment"
  | "confirm"
  | "manage"
  | "unavailable";

export interface Apartment {
  id: string;
  name: string;
  location: string;
  image: string;
  status: "available" | "occupied";
  extraNight: boolean;
  lateCheckout: boolean;
  extendPrice: number;
}

export interface LateOption {
  time: string;
  price: number;
}

export interface NearbyStay {
  id: string;
  name: string;
  image: string;
  distanceKm: number;
  price: number;
}

export interface Booking {
  id: string;
  apartmentId: string;
  apartmentName: string;
  guestName: string;
  flow: FlowType;
  nights: number;
  lateTime?: string;
  cleaningService?: string;
  cleaningSlot?: string;
  price: number;
  date: string;
  createdAt: number;
  status: "confirmed";
  channel: "QR";
}

export interface CleaningService {
  key: string;
  price: number;
}

export type Plan = "free" | "premium";

export interface HostSession {
  loggedIn: boolean;
  name: string;
  email: string;
  company: string;
  plan: Plan;
}

export interface AppNotification {
  id: string;
  kind: "extension" | "late" | "cleaning" | "listing";
  title: string;
  detail: string;
  createdAt: number;
  read: boolean;
}
