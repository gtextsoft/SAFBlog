import type { Metadata } from "next";
import Link from "next/link";

import { createCheckoutSession } from "@/app/donate/actions";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph, organisationSchema } from "@/lib/seo/schema";
import { absoluteUrl, SITE_LANGUAGE, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Donate",
  description: `Support the work of the ${SITE_NAME} with a one-time donation.`,
  alternates: { canonical: "/donate" },
};

const PRESETS = [
  { amount: 1000, label: "$10" },
  { amount: 2500, label: "$25" },
  { amount: 5000, label: "$50" },
] as const;

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "WebPage",
            "@id": `${absoluteUrl("/donate")}#donate`,
            url: absoluteUrl("/donate"),
            name: `Donate — ${SITE_NAME}`,
            inLanguage: SITE_LANGUAGE,
          },
          organisationSchema(),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Donate", url: "/donate" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Give</p>
            <h1 className="mt-4 max-w-2xl text-4xl leading-[1.1] md:text-5xl">
              Support the Foundation
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Your gift funds education, youth empowerment, and community development programmes.
              Choose an amount to continue securely with Stripe.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
          {error && (
            <p role="alert" className="mb-6 rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {error === "config"
                ? "Donations are temporarily unavailable. Please try again later."
                : "Something went wrong starting checkout. Please try again."}
            </p>
          )}

          <form action={createCheckoutSession} className="space-y-4">
            <fieldset>
              <legend className="mb-3 text-sm font-medium">Select an amount (USD)</legend>
              <div className="grid grid-cols-3 gap-3">
                {PRESETS.map(({ amount, label }, index) => (
                  <label
                    key={amount}
                    className="relative flex cursor-pointer flex-col items-center justify-center rounded border border-border bg-card px-3 py-6 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-subtle"
                  >
                    <input
                      type="radio"
                      name="amount"
                      value={amount}
                      defaultChecked={index === 1}
                      className="sr-only"
                    />
                    <span className="font-display text-2xl" data-numeric>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Continue to checkout
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Payments are processed by Stripe. You will receive a receipt by email.
          </p>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Prefer another route?{" "}
            <Link href="/contact" className="text-primary hover:text-primary-hover">
              Contact us
            </Link>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
