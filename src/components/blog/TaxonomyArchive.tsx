import Link from "next/link";

import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Pagination } from "@/components/blog/Pagination";
import { PostCard } from "@/components/blog/PostCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { Paginated, PostSummary } from "@/types/blog";

/**
 * Shared archive layout for category and tag pages.
 *
 * The old CategoryPosts and TagPosts were near-identical 200-line files that
 * drifted independently; both also fetched every matching post with no
 * pagination and used hardcoded `text-white` that broke in dark mode.
 */
export function TaxonomyArchive({
  kind,
  name,
  description,
  results,
  basePath,
}: {
  kind: "Topic" | "Tag";
  name: string;
  description?: string | null;
  results: Paginated<PostSummary>;
  basePath: string;
}) {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <nav aria-label="Breadcrumb" className="text-sm">
              <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                <li>
                  <Link href="/" className="transition-colors duration-150 hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="transition-colors duration-150 hover:text-foreground">
                    Stories
                  </Link>
                </li>
              </ol>
            </nav>

            <p className="mt-6 text-eyebrow uppercase tracking-[0.14em] text-primary">{kind}</p>
            <h1 className="mt-2 text-4xl md:text-5xl">{name}</h1>

            {description && (
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{description}</p>
            )}

            <p className="mt-3 text-sm text-muted-foreground">
              <span data-numeric>{results.total}</span>{" "}
              {results.total === 1 ? "story" : "stories"}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <div>
              {results.items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-20 text-center">
                  <h2 className="font-display text-xl">No stories here yet</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nothing has been published under {name} so far.
                  </p>
                  <Link
                    href="/blog"
                    className="mt-6 inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium"
                  >
                    Browse all stories
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
                    {results.items.map((post, index) => (
                      <PostCard key={post.id} post={post} priority={index < 2} />
                    ))}
                  </div>

                  <Pagination
                    page={results.page}
                    totalPages={results.totalPages}
                    basePath={basePath}
                  />
                </>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <BlogSidebar />
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
