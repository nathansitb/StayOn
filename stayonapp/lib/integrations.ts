import type { Apartment, Booking, FlowType } from "./types";
import { CURRENT_APARTMENT, LATE_OPTIONS } from "./data";

/**
 * Integration layer — STUBBED for the beta.
 *
 * Every function returns a resolved Promise with mocked data, but the
 * signatures match what a real backend would expose. Swap the bodies for
 * real calls (Stripe, iCal, Guesty, Hostaway, Smoobu, Airbnb, Booking)
 * without touching the UI components.
 */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Check whether the current apartment can be extended one more night. */
export async function checkAvailability(
  apartmentId: string,
  _date?: string
): Promise<{ available: boolean; price: number }> {
  await wait(300);
  return { available: true, price: CURRENT_APARTMENT.extraNightPrice };
}

/** Create a booking (extra night or late checkout). */
export async function createBooking(input: {
  apartmentId: string;
  flow: FlowType;
  nights?: number;
  lateTimeIndex?: number;
}): Promise<Booking> {
  await wait(300);
  const nights = input.nights ?? 1;
  const price =
    input.flow === "night"
      ? CURRENT_APARTMENT.extraNightPrice * nights
      : LATE_OPTIONS[input.lateTimeIndex ?? 0].price;
  return {
    id: "bk_" + Math.random().toString(36).slice(2, 9),
    apartmentId: input.apartmentId,
    apartmentName: CURRENT_APARTMENT.name,
    guestName: "You",
    flow: input.flow,
    nights,
    price,
    date: CURRENT_APARTMENT.dateEn,
    lateTime:
      input.flow === "late"
        ? LATE_OPTIONS[input.lateTimeIndex ?? 0].time
        : undefined,
    createdAt: Date.now(),
    status: "confirmed",
    channel: "QR",
  };
}

/** Simulated Stripe PaymentIntent. */
export async function processPayment(input: {
  amount: number;
  method: "apple" | "google" | "card";
}): Promise<{ status: "succeeded"; id: string }> {
  await wait(600);
  return { status: "succeeded", id: "pi_demo_" + Math.random().toString(36).slice(2, 10) };
}

/** Nearby alternatives when the apartment is fully booked. */
export async function findNearbyStays(
  _apartmentId: string
): Promise<Apartment[]> {
  await wait(300);
  return [];
}
