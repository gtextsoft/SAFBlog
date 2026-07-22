import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Fragment } from "react";

import { FeaturedPostCard, PostCard } from "@/components/blog/PostCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { SocialShare } from "@/components/blog/SocialShare";
import { InFeedPromotion } from "@/components/promotions/PromotionSlot";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getPromotions } from "@/lib/queries/promotions";
import { getCategoriesWithCounts } from "@/lib/queries/taxonomy";
import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SOCIAL_PROFILES,
} from "@/lib/seo/site";

export const revalidate = 60;

/** Insert the homepage feed promotion after this many latest-story cards. */
const HOME_PROMO_AFTER = 2;

/**
 * Homepage-specific metadata. The root layout default is brand-first; this
 * page is the stories hub, so title/description must say that clearly for
 * SERPs and on-page SEO audits.
 */
export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
  },
};

export default async function HomePage() {
  const [{ items: posts }, homePromotions, categories] = await Promise.all([
    getPublishedPosts(1, 7),
    getPromotions("home_feed", 1),
    getCategoriesWithCounts(),
  ]);
  const [featured, ...rest] = posts;
  const homePromotion = homePromotions[0];
  const topicLinks = categories.filter((c) => c.postCount > 0).slice(0, 6);
  const facebookUrl = SOCIAL_PROFILES[0];

  return (
    <>
      <SiteHeader />

      <main id="main">
        <section className="border-b border-border" aria-labelledby="home-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">
              {SITE_NAME}
            </p>
            <h1
              id="home-heading"
              className="mt-4 max-w-3xl text-4xl leading-[1.08] md:text-6xl"
            >
              Stories of education, empowerment, and lasting change
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Field reporting from the {SITE_NAME} on education, sustainable development, and
              community empowerment across Nigeria and beyond — the programmes, the people, and
              what actually changes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center gap-2 rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
              >
                Read the stories
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-rule-strong"
              >
                About the Foundation
              </Link>
              <Link
                href="/donate"
                className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-rule-strong"
              >
                Support the work
              </Link>
            </div>
            <SocialShare
              className="mt-8"
              url={absoluteUrl("/")}
              title={`${SITE_NAME} — ${SITE_TAGLINE}`}
              description={SITE_DESCRIPTION}
            />
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <div>
              {/*
                Substantive intro copy lives in real paragraphs so crawlers and
                SEO checkers see 250+ useful words, title keywords, and links —
                not only a feed of cards.
              */}
              <section className="measure" aria-labelledby="about-reporting">
                <h2 id="about-reporting" className="text-2xl md:text-3xl">
                  {SITE_TAGLINE} from the {SITE_NAME}
                </h2>
                <div className="prose-editorial mt-6 space-y-5 text-base text-muted-foreground">
                  <p>
                    This blog is the public record of the {SITE_NAME}&rsquo;s work in education,
                    sustainable development, and community empowerment. We publish stories of
                    education in classrooms and communities, profiles of people building new
                    skills, and updates from programmes that turn opportunity into lasting change
                    across Nigeria and beyond.
                  </p>
                  <p>
                    If you are looking for {SITE_TAGLINE.toLowerCase()}, start with the{" "}
                    <Link href="/blog" className="text-primary underline-offset-2 hover:underline">
                      full story archive
                    </Link>
                    . Each piece is written for readers who want clear reporting — what happened,
                    who was involved, and why it matters — rather than slogans. Browse by topic,
                    follow an author, or use{" "}
                    <Link href="/search" className="text-primary underline-offset-2 hover:underline">
                      search
                    </Link>{" "}
                    when you need a specific programme, place, or theme.
                  </p>
                  <p>
                    Education sits at the centre of our reporting: scholarships, school support,
                    skills training, and the everyday barriers families face when quality learning
                    is out of reach. Sustainable development stories cover livelihoods,
                    infrastructure, and community projects that are built to last. Community
                    empowerment pieces follow leadership, youth programmes, and capacity-building
                    that help people shape their own futures.
                  </p>
                  <p>
                    New readers often begin with{" "}
                    <Link href="/about" className="text-primary underline-offset-2 hover:underline">
                      about the Foundation
                    </Link>{" "}
                    for mission and programmes, then return here for field updates. You can{" "}
                    <Link
                      href="/newsletter"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      subscribe to the newsletter
                    </Link>{" "}
                    for stories by email,{" "}
                    <Link href="/contact" className="text-primary underline-offset-2 hover:underline">
                      contact the team
                    </Link>{" "}
                    with questions or partnership ideas, or{" "}
                    <Link href="/donate" className="text-primary underline-offset-2 hover:underline">
                      donate
                    </Link>{" "}
                    to support the work behind these stories.
                  </p>
                  <p>
                    We also share updates on the Foundation&rsquo;s{" "}
                    {facebookUrl ? (
                      <a
                        href={facebookUrl}
                        rel="me noopener"
                        target="_blank"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        Facebook page
                      </a>
                    ) : (
                      "social channels"
                    )}
                    . For a machine-readable feed of recent posts, use the{" "}
                    <Link href="/feed.xml" className="text-primary underline-offset-2 hover:underline">
                      RSS feed
                    </Link>
                    . Whether you are a community member, partner, journalist, or supporter, this
                    site is meant to make the Foundation&rsquo;s education and empowerment work
                    easy to find, read, and share.
                  </p>
                </div>
              </section>

              {posts.length === 0 ? (
                <div className="mt-14 rounded-lg border border-dashed border-border py-20 text-center">
                  <h2 className="font-display text-xl">No stories published yet</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Check back soon, or subscribe to hear when the first one lands.
                  </p>
                  <Link
                    href="/newsletter"
                    className="mt-6 inline-flex min-h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground"
                  >
                    Subscribe
                  </Link>
                </div>
              ) : (
                <>
                  {featured && (
                    <section className="mt-14" aria-labelledby="featured-heading">
                      <h2
                        id="featured-heading"
                        className="mb-6 border-b border-border pb-3 text-2xl"
                      >
                        Featured story
                      </h2>
                      <FeaturedPostCard post={featured} />
                    </section>
                  )}

                  {rest.length > 0 && (
                    <section className="mt-12" aria-labelledby="latest-heading">
                      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                        <h2 id="latest-heading" className="text-2xl">
                          Latest stories
                        </h2>
                        <Link
                          href="/blog"
                          className="inline-flex min-h-11 items-center gap-1 text-sm text-primary transition-colors duration-150 hover:text-primary-hover"
                        >
                          View all stories
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>

                      <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2">
                        {rest.map((post, index) => (
                          <Fragment key={post.id}>
                            <PostCard post={post} />
                            {homePromotion && index === HOME_PROMO_AFTER - 1 && (
                              <InFeedPromotion promotion={homePromotion} />
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              <section className="mt-16 border-t border-border pt-12" aria-labelledby="explore-heading">
                <h2 id="explore-heading" className="text-2xl">
                  Explore the Foundation
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Go deeper into our reporting on education and community empowerment, and the
                  ways you can stay involved with the {SITE_NAME}.
                </p>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      href: "/blog",
                      label: "All stories",
                      hint: "The full archive of field reporting and programme updates",
                    },
                    {
                      href: "/about",
                      label: "About the Foundation",
                      hint: "Mission, vision, and the work behind the stories",
                    },
                    {
                      href: "/newsletter",
                      label: "Newsletter",
                      hint: "New stories delivered by email when they publish",
                    },
                    {
                      href: "/contact",
                      label: "Contact",
                      hint: "Reach the team with questions or partnership ideas",
                    },
                    {
                      href: "/donate",
                      label: "Donate",
                      hint: "Support education and community programmes",
                    },
                    {
                      href: "/search",
                      label: "Search the archive",
                      hint: "Find stories by topic, programme, or place",
                    },
                  ].map(({ href, label, hint }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="group flex min-h-11 flex-col border-b border-border py-3 transition-colors duration-150 hover:border-primary"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {label}
                        </span>
                        <span className="mt-1 text-sm text-muted-foreground">{hint}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {topicLinks.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
                      Browse by topic
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {topicLinks.map((category) => (
                        <li key={category.id}>
                          <Link
                            href={`/category/${category.slug}`}
                            className="inline-flex min-h-9 items-center rounded-sm border border-border px-3 text-sm transition-colors duration-150 hover:border-primary hover:text-primary"
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <BlogSidebar />
            </aside>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
