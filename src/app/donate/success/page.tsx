import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default function DonateSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Donation</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Thank you</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your support helps us keep education and community programmes running. A receipt will
          arrive by email from Stripe.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Read our stories
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium hover:border-rule-strong"
          >
            Home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
