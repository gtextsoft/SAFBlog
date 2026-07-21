import type { Metadata } from "next";
import { BookOpen, Mail, ShieldCheck } from "lucide-react";

import { SubscribeForm } from "@/components/newsletter/SubscribeForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph } from "@/lib/seo/schema";
import { absoluteUrl, SITE_LANGUAGE, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Get field reporting and programme updates from the Stephen Akintayo Foundation by email. No spam, unsubscribe any time.",
  alternates: { canonical: "/newsletter" },
};

const REASONS = [
  {
    Icon: BookOpen,
    title: "Stories from the field",
    body: "Reporting on what the programmes actually change, written up as it happens.",
  },
  {
    Icon: Mail,
    title: "Only when there's something to say",
    body: "We send when a story publishes, not on a schedule that needs filling.",
  },
  {
    Icon: ShieldCheck,
    title: "Your address stays yours",
    body: "We never sell or share it, and every email carries a one-click unsubscribe link.",
  },
];

export default function NewsletterPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "WebPage",
            "@id": `${absoluteUrl("/newsletter")}#page`,
            url: absoluteUrl("/newsletter"),
            name: `Newsletter — ${SITE_NAME}`,
            inLanguage: SITE_LANGUAGE,
          },
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Newsletter", url: "/newsletter" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Newsletter</p>
            <h1 className="mt-4 max-w-2xl text-4xl leading-[1.1] md:text-5xl">
              The Foundation&rsquo;s work, in your inbox
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Field reporting, programme updates and long-form pieces on education, sustainable
              development and community empowerment.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-20">
            <section aria-labelledby="why">
              <h2 id="why" className="text-2xl">
                What you&rsquo;ll get
              </h2>
              <ul className="mt-8 space-y-8">
                {REASONS.map(({ Icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="text-lg">{title}</h3>
                      <p className="mt-1 text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-xl">Subscribe</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  One field. That&rsquo;s all we need.
                </p>
                <SubscribeForm source="newsletter-page" showName className="mt-5" />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
