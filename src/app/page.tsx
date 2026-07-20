import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeaturedPostCard, PostCard } from "@/components/blog/PostCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedPosts } from "@/lib/queries/posts";
import { SITE_TAGLINE } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function HomePage() {
  const { items: posts } = await getPublishedPosts(1, 7);
  const [featured, ...rest] = posts;

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/*
          Editorial masthead. No gradient blobs, no gradient-clipped heading,
          no emoji badge — type and a rule carry it.
        */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">
              Stephen Akintayo Foundation
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[1.08] md:text-6xl">
              {SITE_TAGLINE}, one story at a time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Reporting on education, sustainable development and community empowerment across
              Nigeria and beyond — the programmes, the people, and what actually changes.
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
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          {posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
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
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
              <div>
                {featured && <FeaturedPostCard post={featured} />}

                {rest.length > 0 && (
                  <section className="mt-12">
                    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                      <h2 className="text-2xl">Latest stories</h2>
                      <Link
                        href="/blog"
                        className="inline-flex min-h-11 items-center gap-1 text-sm text-primary transition-colors duration-150 hover:text-primary-hover"
                      >
                        View all
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>

                    <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2">
                      {rest.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <BlogSidebar />
              </aside>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
