import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph, organisationSchema } from "@/lib/seo/schema";
import { absoluteUrl, CONTACT_EMAIL, SITE_LANGUAGE, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE_NAME} collects, uses, and protects personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "WebPage",
            "@id": `${absoluteUrl("/privacy")}#privacy`,
            url: absoluteUrl("/privacy"),
            name: `Privacy — ${SITE_NAME}`,
            inLanguage: SITE_LANGUAGE,
          },
          organisationSchema(),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Privacy", url: "/privacy" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-accent">Legal</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] md:text-5xl">Privacy</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              How {SITE_NAME} handles personal information you share with us.
            </p>
          </div>
        </div>

        <article className="mx-auto max-w-3xl space-y-10 px-4 py-14 text-base leading-relaxed text-muted-foreground sm:px-6">
          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">What we collect</h2>
            <p>
              When you subscribe to the newsletter, leave a comment, or send a contact message, we
              collect the details you provide — typically your name and email address, and the
              content of your message or comment.
            </p>
            <p>
              Like most websites, our hosting and analytics providers may process technical data
              such as IP address, browser type, and pages visited. If Plausible analytics is
              enabled, it is privacy-friendly and does not use advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">How we use it</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To send newsletter issues you opted into (double opt-in confirmation required).</li>
              <li>To publish and moderate comments on articles.</li>
              <li>To respond to contact form messages.</li>
              <li>To operate, secure, and improve the site.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Sharing</h2>
            <p>
              We do not sell your personal information. We use service providers (for example email
              delivery and hosting) solely to run {SITE_NAME}. Donation payments are processed by
              Stripe; we do not store your full payment card details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Your choices</h2>
            <p>
              Every newsletter email includes an unsubscribe link. You can also{" "}
              <Link href="/contact" className="text-primary hover:text-primary-hover">
                contact us
              </Link>{" "}
              to ask about access, correction, or deletion of information we hold about you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Contact</h2>
            <p>
              Questions about this policy:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:text-primary-hover"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <p className="text-sm">
              See also our{" "}
              <Link href="/terms" className="text-primary hover:text-primary-hover">
                Terms of use
              </Link>
              .
            </p>
          </section>
        </article>
      </main>

      <PublicFooter />
    </>
  );
}
