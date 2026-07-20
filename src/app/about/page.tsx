import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph, organisationSchema } from "@/lib/seo/schema";
import { absoluteUrl, SITE_LANGUAGE, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Stephen Akintayo Foundation empowers underserved communities through education, sustainable development, and capacity-building programmes.",
  alternates: { canonical: "/about" },
};

/**
 * Copy is carried over verbatim from the previous About page. It describes
 * real programmes and commitments, so it is content to preserve, not to
 * rewrite — any change to what the Foundation claims about itself should come
 * from the Foundation.
 */
const PILLARS = [
  {
    title: "Mission",
    body: "To empower underserved communities through quality education, sustainable development programs, and capacity-building initiatives that create lasting positive change.",
  },
  {
    title: "Vision",
    body: "A world where every individual has access to the resources, education, and opportunities needed to reach their full potential and contribute meaningfully to society.",
  },
  {
    title: "Values",
    body: "Integrity, excellence, compassion, sustainability, and community-driven impact guide every decision we make and every program we implement.",
  },
];

const PROGRAMMES = [
  {
    title: "Education & Scholarship",
    body: "Providing access to quality education through scholarships, school supplies, and educational infrastructure support for underserved communities.",
  },
  {
    title: "Youth Empowerment",
    body: "Equipping young people with skills, mentorship, and resources to become leaders and change-makers in their communities.",
  },
  {
    title: "Community Development",
    body: "Supporting sustainable community projects that improve infrastructure, create economic opportunities, and enhance quality of life.",
  },
  {
    title: "Capacity Building",
    body: "Training programs and workshops that develop leadership, entrepreneurship, and professional skills for community members.",
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
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">About us</p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[1.1] md:text-5xl">
              Building a better tomorrow through education, empowerment, and sustainable
              development
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <section aria-labelledby="pillars">
            <h2 id="pillars" className="sr-only">
              Our mission, vision and values
            </h2>
            <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
              {PILLARS.map(({ title, body }) => (
                <div key={title} className="bg-card p-6">
                  <h3 className="text-eyebrow uppercase tracking-[0.14em] text-primary">{title}</h3>
                  <p className="mt-3 text-base text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="story" className="mt-16 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
            <h2 id="story" className="text-2xl lg:text-3xl">
              Our story
            </h2>
            <div className="prose-editorial measure">
              <p>
                The Stephen Akintayo Foundation (SAF) was founded with a simple yet powerful
                belief: that every person deserves the opportunity to build a better life for
                themselves and their community.
              </p>
              <p>
                Founded by visionary leader Stephen Akintayo, SAF has grown from a small community
                initiative into a comprehensive development organization serving thousands across
                multiple communities.
              </p>
              <p>
                Over the years, we&rsquo;ve witnessed incredible transformations — from young
                people gaining access to quality education for the first time, to communities
                developing sustainable income sources, to leaders emerging where there were none.
              </p>
              <p>
                Today, SAF continues to innovate and expand its impact, always staying true to our
                core mission of empowering individuals and communities to create lasting positive
                change.
              </p>
            </div>
          </section>

          <section aria-labelledby="programmes" className="mt-16">
            <h2 id="programmes" className="border-b border-border pb-3 text-2xl lg:text-3xl">
              What we do
            </h2>
            <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {PROGRAMMES.map(({ title, body }, index) => (
                <div key={title}>
                  <p
                    data-numeric
                    className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-xl">{title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-lg border border-border bg-surface-sunken p-8 text-center">
            <h2 className="text-2xl">Follow the work</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Read field reporting and programme updates, or get them by email as they publish.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
              >
                Read the stories
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-rule-strong"
              >
                Subscribe
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
