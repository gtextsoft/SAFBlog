import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeaturedPostCard, PostCard } from "@/components/blog/PostCard";
import { SubscribeForm } from "@/components/newsletter/SubscribeForm";
import { InFeedPromotion } from "@/components/promotions/PromotionSlot";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedPosts, getTrendingPosts } from "@/lib/queries/posts";
import { getPromotions } from "@/lib/queries/promotions";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/queries/taxonomy";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo/site";

export const revalidate = 60;

const HOME_FETCH = 14;
const LATEST_COUNT = 6;
const PICKS_COUNT = 3;
const INTERVIEWS_COUNT = 3;

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
  const [{ items: posts }, trending, homePromotions, interviewsCategory] = await Promise.all([
    getPublishedPosts(1, HOME_FETCH),
    getTrendingPosts(5),
    getPromotions("home_feed", 2),
    getCategoryBySlug("interviews"),
  ]);

  const [featured, ...afterFeatured] = posts;
  const latest = afterFeatured.slice(0, LATEST_COUNT);
  const editorsPicks = afterFeatured.slice(LATEST_COUNT, LATEST_COUNT + PICKS_COUNT);

  const interviewResults = interviewsCategory
    ? await getPostsByCategory(interviewsCategory.id, 1, INTERVIEWS_COUNT)
    : { items: [] as typeof posts };
  const interviews = interviewResults.items;

  const brandSpotlights = homePromotions;

  return (
    <>
      <SiteHeader />

      <main id="main">
        <section
          className="relative overflow-hidden border-b border-border"
          aria-labelledby="home-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--accent)/0.08),_transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
            <h1
              id="home-heading"
              className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight md:text-7xl"
            >
              {SITE_NAME}
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.14em] text-muted-foreground md:text-[0.8125rem]">
              {SITE_TAGLINE}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Stories, insights, and ideas shaping the future of business, leadership, innovation,
              and impact.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center gap-2 rounded bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
              >
                Latest articles
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex min-h-11 items-center rounded border border-border px-6 text-sm font-medium transition-colors duration-150 hover:border-accent hover:text-accent"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <section className="measure max-w-3xl" aria-labelledby="about-publication">
            <h2 id="about-publication" className="font-display text-2xl md:text-3xl">
              A premium digital publication for ambitious leaders
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {SITE_NAME} covers entrepreneurship, business, wealth, real estate, technology,
              leadership, personal development, brand stories, interviews, company features,
              events, philanthropy, and lifestyle — written for CEOs, founders, investors, and
              global brands.
            </p>
          </section>

          {featured && (
            <section className="mt-16" aria-labelledby="featured-heading">
              <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-4">
                <h2 id="featured-heading" className="font-display text-2xl md:text-3xl">
                  Featured Story
                </h2>
              </div>
              <FeaturedPostCard post={featured} />
            </section>
          )}

          {latest.length > 0 && (
            <section className="mt-20" aria-labelledby="latest-heading">
              <div className="mb-10 flex items-end justify-between gap-4 border-b border-border pb-4">
                <h2 id="latest-heading" className="font-display text-2xl md:text-3xl">
                  Latest Articles
                </h2>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {latest.map((post, index) => (
                  <PostCard key={post.id} post={post} priority={index < 2} />
                ))}
              </div>
            </section>
          )}

          {editorsPicks.length > 0 && (
            <section className="mt-20" aria-labelledby="picks-heading">
              <div className="mb-10 border-b border-border pb-4">
                <h2 id="picks-heading" className="font-display text-2xl md:text-3xl">
                  Editor&rsquo;s Picks
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                {editorsPicks.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-20 grid gap-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
            {trending.length > 0 && (
              <section aria-labelledby="trending-heading">
                <div className="mb-8 border-b border-border pb-4">
                  <h2 id="trending-heading" className="font-display text-2xl md:text-3xl">
                    Trending
                  </h2>
                </div>
                <ol className="space-y-0 divide-y divide-border border-y border-border">
                  {trending.map((post, index) => (
                    <li key={post.id} className="flex gap-5 py-5">
                      <span
                        data-numeric
                        className="font-display text-2xl text-accent/80"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-display text-lg leading-snug">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="transition-colors duration-150 hover:text-accent"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {post.author?.fullName ?? "The Blueprint Editorial Team"}
                          <span aria-hidden="true"> · </span>
                          {post.readingMinutes} min read
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section
              className="border border-border bg-surface-sunken p-8"
              aria-labelledby="newsletter-heading"
            >
              <p className="text-eyebrow uppercase tracking-[0.16em] text-accent">Newsletter</p>
              <h2 id="newsletter-heading" className="mt-3 font-display text-2xl">
                Stay ahead of the conversation
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Briefings from {SITE_NAME} on business, leadership, and the ideas shaping what
                comes next.
              </p>
              <SubscribeForm source="homepage" layout="stacked" className="mt-6" />
            </section>
          </div>

          <section className="mt-20" aria-labelledby="interviews-heading">
            <div className="mb-10 flex items-end justify-between gap-4 border-b border-border pb-4">
              <h2 id="interviews-heading" className="font-display text-2xl md:text-3xl">
                Featured Interviews
              </h2>
              <Link
                href="/category/interviews"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
              >
                All interviews
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            {interviews.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                {interviews.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Conversations with founders, executives, and cultural leaders will appear here.
              </p>
            )}
          </section>

          <section className="mt-20" aria-labelledby="spotlight-heading">
            <div className="mb-10 border-b border-border pb-4">
              <h2 id="spotlight-heading" className="font-display text-2xl md:text-3xl">
                Brand Spotlight
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">Sponsored partnerships</p>
            </div>
            {brandSpotlights.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {brandSpotlights.map((promotion) => (
                  <InFeedPromotion key={promotion.id} promotion={promotion} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Sponsored brand features and partner stories will appear here.
              </p>
            )}
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
