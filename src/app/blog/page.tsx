import { Fragment } from "react";
import type { Metadata } from "next";

import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Pagination } from "@/components/blog/Pagination";
import { PostCard } from "@/components/blog/PostCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { InFeedPromotion } from "@/components/promotions/PromotionSlot";
import { blogSchema, breadcrumbSchema, collectionSchema, jsonLdGraph } from "@/lib/seo/schema";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedPosts, POSTS_PER_PAGE } from "@/lib/queries/posts";
import { getPromotions } from "@/lib/queries/promotions";
import { SITE_NAME } from "@/lib/seo/site";

export const revalidate = 60;

/** Insert the in-feed promotion after this many cards. */
const PROMO_AFTER = 4;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  return {
    title: pageNumber > 1 ? `Articles — page ${pageNumber}` : "Articles",
    description: `Stories, insights, and ideas from ${SITE_NAME} on business, leadership, innovation, and impact.`,
    alternates: { canonical: pageNumber > 1 ? `/blog?page=${pageNumber}` : "/blog" },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  const [{ items: posts, totalPages, total }, promotions] = await Promise.all([
    getPublishedPosts(pageNumber, POSTS_PER_PAGE),
    getPromotions("in_feed", 1),
  ]);

  const promotion = promotions[0];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          blogSchema(),
          collectionSchema({
            name: "Articles",
            description: `Articles from ${SITE_NAME}.`,
            url: "/blog",
            posts,
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Articles", url: "/blog" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16">
            <h1 className="font-display text-4xl md:text-5xl">Articles</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Stories, insights, and ideas shaping the future of business, leadership, innovation,
              and impact.
            </p>
            {total > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                <span data-numeric>{total}</span> {total === 1 ? "article" : "articles"} published
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <div>
              {posts.length === 0 ? (
                <div className="border border-dashed border-border py-20 text-center">
                  <h2 className="font-display text-xl">Nothing here yet</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pageNumber > 1
                      ? "That page is beyond the end of the archive."
                      : "The first article is on its way."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
                    {posts.map((post, index) => (
                      // Fragment carries the key; the promotion is a sibling
                      // cell so the feed's grid rhythm is preserved rather
                      // than being interrupted by a full-width band.
                      <Fragment key={post.id}>
                        <PostCard post={post} priority={index < 2} />
                        {promotion && index === PROMO_AFTER - 1 && (
                          <InFeedPromotion promotion={promotion} />
                        )}
                      </Fragment>
                    ))}
                  </div>

                  <Pagination page={pageNumber} totalPages={totalPages} basePath="/blog" />
                </>
              )}
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
