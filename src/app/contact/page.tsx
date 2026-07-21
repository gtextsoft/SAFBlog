import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph, organisationSchema } from "@/lib/seo/schema";
import { absoluteUrl, CONTACT_EMAIL, SITE_LANGUAGE, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${SITE_NAME}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "ContactPage",
            "@id": `${absoluteUrl("/contact")}#contact`,
            url: absoluteUrl("/contact"),
            name: `Contact ${SITE_NAME}`,
            inLanguage: SITE_LANGUAGE,
            mainEntity: { "@id": `${absoluteUrl("/")}#organization` },
          },
          organisationSchema(),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Contact", url: "/contact" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Contact</p>
            <h1 className="mt-4 max-w-2xl text-4xl leading-[1.1] md:text-5xl">
              Write to the Foundation
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Questions about programmes, partnerships, or this site — send a note and we&rsquo;ll
              get back to you. You can also email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary transition-colors hover:text-primary-hover"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
          <ContactForm />
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
