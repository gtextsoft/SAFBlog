import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph, organisationSchema } from "@/lib/seo/schema";
import { absoluteUrl, SITE_LANGUAGE, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} is a premium digital publication covering business, leadership, innovation, and impact. ${SITE_TAGLINE}.`,
  alternates: { canonical: "/about" },
};

const BEATS = [
  {
    title: "Business & Entrepreneurship",
    body: "Strategy, markets, company building, and the operators shaping modern commerce.",
  },
  {
    title: "Wealth & Real Estate",
    body: "Investment thinking, property, and the long game of capital allocation.",
  },
  {
    title: "Technology & Innovation",
    body: "Platforms, tools, and ideas transforming how ambitious organisations compete.",
  },
  {
    title: "Leadership & Development",
    body: "Executive judgment, culture, personal growth, and the craft of leading at scale.",
  },
  {
    title: "Brand Stories & Interviews",
    body: "Conversations and features with founders, executives, and cultural leaders.",
  },
  {
    title: "Lifestyle, Events & Philanthropy",
    body: "How influential people live, gather, and give back — with editorial rigor.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "AboutPage",
            "@id": `${absoluteUrl("/about")}#about`,
            url: absoluteUrl("/about"),
            name: `About ${SITE_NAME}`,
            inLanguage: SITE_LANGUAGE,
            mainEntity: { "@id": `${absoluteUrl("/")}#organization` },
          },
          organisationSchema(),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "About", url: "/about" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-accent">About</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.08] md:text-6xl">
              {SITE_NAME}
            </h1>
            <p className="mt-3 text-sm uppercase tracking-[0.14em] text-muted-foreground">
              {SITE_TAGLINE}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Stories, insights, and ideas shaping the future of business, leadership, innovation,
              and impact written for CEOs, entrepreneurs, investors, executives, and global
              brands.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <section
            aria-labelledby="story"
            className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]"
          >
            <h2 id="story" className="font-display text-2xl lg:text-3xl">
              Our mission
            </h2>
            <div className="prose-editorial measure">
              <p>
                {SITE_NAME} is a premium digital publication built for an executive audience. We
                publish ambitious journalism and analysis across entrepreneurship, business, wealth,
                real estate, technology, leadership, personal development, brand stories,
                interviews, company features, events, philanthropy, and lifestyle.
              </p>
              <p>
                Our standard is the company of Forbes, Fast Company, Inc., Entrepreneur, and
                Monocle: clean design, high trust, and editorial clarity that respects the
                reader&rsquo;s time.
              </p>
              <p>
                {SITE_TAGLINE}. We exist to inform decisions, surface ideas, and spotlight the
                people and organisations shaping what comes next.
              </p>
            </div>
          </section>

          <section aria-labelledby="coverage" className="mt-20">
            <h2 id="coverage" className="border-b border-border pb-4 font-display text-2xl lg:text-3xl">
              What we cover
            </h2>
            <div className="mt-10 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {BEATS.map(({ title, body }, index) => (
                <div key={title}>
                  <p
                    data-numeric
                    className="text-eyebrow uppercase tracking-[0.16em] text-accent"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-xl">{title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 border border-border bg-surface-sunken px-8 py-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl">Read the latest</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Explore featured stories, interviews, and analysis — or get them by email as they
              publish.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
              >
                Latest articles
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-accent"
              >
                Subscribe
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-accent"
              >
                Contact
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
