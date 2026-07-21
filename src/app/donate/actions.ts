"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { z } from "zod";

import { absoluteUrl } from "@/lib/seo/site";

const PRESETS = [1000, 2500, 5000] as const; // USD cents: $10 / $25 / $50

const AmountSchema = z.coerce.number().refine(
  (n): n is (typeof PRESETS)[number] => (PRESETS as readonly number[]).includes(n),
  { message: "Choose a donation amount." },
);

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function createCheckoutSession(formData: FormData): Promise<void> {
  const parsed = AmountSchema.safeParse(formData.get("amount"));
  if (!parsed.success) {
    redirect("/donate?error=amount");
  }

  const stripe = getStripe();
  if (!stripe) {
    redirect("/donate?error=config");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: parsed.data,
          product_data: {
            name: "Donation to Stephen Akintayo Foundation",
            description: "Thank you for supporting our programmes.",
          },
        },
      },
    ],
    success_url: absoluteUrl("/donate/success?session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: absoluteUrl("/donate"),
  });

  if (!session.url) {
    redirect("/donate?error=session");
  }

  redirect(session.url);
}
