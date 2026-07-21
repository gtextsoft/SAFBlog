/**
 * Public Stripe Payment Link for donations (customer picks any amount).
 * Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK to a buy.stripe.com / payment link URL.
 */
export function getDonationPaymentLink(): string | null {
  const raw = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  if (!raw) return null;
  const url = raw.trim().replace(/^["']|["']$/g, "");
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
