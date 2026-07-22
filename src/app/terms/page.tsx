import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph, organisationSchema } from "@/lib/seo/schema";
import { absoluteUrl, CONTACT_EMAIL, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "WebPage",
            "@id": `${absoluteUrl("/terms")}#terms`,
            url: absoluteUrl("/terms"),
            name: `Terms — ${SITE_NAME}`,
            inLanguage: SITE_LANGUAGE,
          },
          organisationSchema(),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Terms", url: "/terms" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-accent">Legal</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] md:text-5xl">Terms of use</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              The rules for reading, sharing, and interacting with {SITE_NAME}.
            </p>
          </div>
        </div>

        <article className="mx-auto max-w-3xl space-y-10 px-4 py-14 text-base leading-relaxed text-muted-foreground sm:px-6">
          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">The site</h2>
            <p>
              {SITE_NAME} ({SITE_URL}) is a digital publication. By using this site you agree to
              these terms. If you do not agree, please do not use the site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Content</h2>
            <p>
              Articles, images, and other materials on {SITE_NAME} are protected by copyright and
              related rights. You may share links and brief quotations with attribution for
              personal, non-commercial use. Any other reproduction or commercial use needs prior
              written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Comments and submissions</h2>
            <p>
              Comments and contact messages must be lawful and respectful. We may hide, remove, or
              refuse content that is spam, abusive, infringing, or otherwise inappropriate. You
              remain responsible for what you submit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Newsletter and donations</h2>
            <p>
              Newsletter signup is voluntary and uses double opt-in. You can unsubscribe at any
              time. Donations, when offered, are processed by Stripe under Stripe’s terms; gifts
              support editorial work at {SITE_NAME} unless stated otherwise.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Disclaimer</h2>
            <p>
              Content is for general information and editorial commentary. It is not professional
              advice. We aim for accuracy but do not warrant that the site will be uninterrupted or
              error-free.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground">Contact</h2>
            <p>
              Questions:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:text-primary-hover"
              >
                {CONTACT_EMAIL}
              </a>
              . See also our{" "}
              <Link href="/privacy" className="text-primary hover:text-primary-hover">
                Privacy policy
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
