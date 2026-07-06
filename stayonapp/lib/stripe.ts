import Stripe from "stripe";

/** Server-side Stripe client (secret key). Never import in client components. */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
