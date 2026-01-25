import Stripe from "stripe";

// Only initialize Stripe if the secret key is available
// This prevents build errors when env vars aren't set
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { typescript: true })
  : (null as unknown as Stripe);
