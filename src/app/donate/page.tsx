import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDonationPaymentLink } from "@/lib/donate";
import { breadcrumbSchema, jsonLdGraph, organisationSchema } from "@/lib/seo/schema";
import { absoluteUrl, SITE_LANGUAGE, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Donate",
  description: `Support the work of the ${SITE_NAME} with a one-time donation.`,
  alternates: { canonical: "/donate" },
};

export default function DonatePage() {
  const paymentLink = getDonationPaymentLink();

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
              Choose any amount on the secure Stripe checkout page.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
          {paymentLink ? (
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Donate with Stripe
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <p
              role="alert"
              className="rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
            >
              Donation link is not configured yet. Set{" "}
              <code className="text-xs">NEXT_PUBLIC_STRIPE_PAYMENT_LINK</code> in{" "}
              <code className="text-xs">.env.local</code> to your Stripe Payment Link URL.
            </p>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            You’ll enter the amount you want to give on Stripe. Receipts are emailed by Stripe.
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
