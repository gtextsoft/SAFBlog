import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { Pagination } from "@/components/blog/Pagination";
import { PostCard } from "@/components/blog/PostCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { breadcrumbSchema, jsonLdGraph } from "@/lib/seo/schema";
import { POSTS_PER_PAGE, searchPosts } from "@/lib/queries/posts";
import { SITE_NAME } from "@/lib/seo/site";

/**
 * Never cached.
 *
 * Every distinct `?q=` would otherwise become its own cache entry, so arbitrary
 * queries — from a crawler or anyone else — could grow the cache without
 * bound. Search is a cheap query against a small archive; running it per
 * request is the correct trade.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}): Promise<Metadata> {
  const { q, page } = await searchParams;
  const query = (q ?? "").trim();
  const pageNumber = Math.max(1, Number(page) || 1);

  const title = query
    ? pageNumber > 1
      ? `Search “${query}” — page ${pageNumber}`
      : `Search “${query}”`
    : "Search";

  const description = query
    ? `Stories matching “${query}” from the ${SITE_NAME} — reporting on education, sustainable development and community empowerment.`
    : `Search the ${SITE_NAME} archive for stories on education, sustainable development and community empowerment across Nigeria and beyond.`;

  return {
    title,
    description,
    alternates: {
      canonical: query
        ? pageNumber > 1
          ? `/search?q=${encodeURIComponent(query)}&page=${pageNumber}`
          : `/search?q=${encodeURIComponent(query)}`
        : "/search",
    },
    /*
     * Result pages are noindex; the empty search page is indexable.
     *
     * This was the wrong way round. Indexing `?q=` pages hands crawlers an
     * unbounded URL space of thin, duplicated listings — Google's guidelines
     * specifically advise against indexing internal search results. The bare
     * /search page is a genuine landing page and the entry point the WebSite
     * SearchAction advertises, so it must stay indexable.
     *
     * `follow: true` either way: the links out to real articles should still
     * be crawled and pass equity.
     */
    robots: query ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const query = (q ?? "").trim();
  const pageNumber = Math.max(1, Number(page) || 1);

  const { items: posts, totalPages, total } = query
    ? await searchPosts(query, pageNumber, POSTS_PER_PAGE)
    : { items: [], totalPages: 0, total: 0 };

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Search", url: "/search" },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h1 className="text-4xl md:text-5xl">Search</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Find articles by title or excerpt across the {SITE_NAME} archive.
            </p>

            <form action="/search" method="get" className="relative mt-8 max-w-xl" role="search">
              <label htmlFor="search-q" className="sr-only">
                Search stories
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="search-q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search stories…"
                autoComplete="off"
                className="h-12 w-full rounded border border-border bg-background pl-10 pr-4 text-base outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
              />
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          {!query ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <h2 className="font-display text-xl">Start a search</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Type a word or phrase above. Or{" "}
                <Link href="/blog" className="text-primary underline-offset-2 hover:underline">
                  browse all stories
                </Link>
                .
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <h2 className="font-display text-xl">No matches for “{query}”</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a shorter phrase, or{" "}
                <Link href="/blog" className="text-primary underline-offset-2 hover:underline">
                  browse the archive
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mb-8 text-sm text-muted-foreground">
                <span data-numeric>{total}</span>{" "}
                {total === 1 ? "result" : "results"} for “{query}”
              </p>
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} priority={index < 3} />
                ))}
              </div>
              <Pagination
                page={pageNumber}
                totalPages={totalPages}
                basePath="/search"
                query={{ q: query }}
              />
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
