import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const stripe = new Stripe(key);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("stripe webhook verify", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" || session.status === "complete") {
      try {
        const service = createServiceClient();
        const amount = session.amount_total ?? 0;
        const currency = (session.currency ?? "usd").toLowerCase();
        const email =
          session.customer_details?.email ?? session.customer_email ?? null;

        const { error } = await service.from("donations").upsert(
          {
            stripe_session_id: session.id,
            amount,
            currency,
            email,
          },
          { onConflict: "stripe_session_id" },
        );

        if (error) {
          console.error("donations insert", error.message);
          return NextResponse.json({ error: "db" }, { status: 500 });
        }
      } catch (err) {
        console.error("donations webhook", err);
        return NextResponse.json({ error: "db" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
