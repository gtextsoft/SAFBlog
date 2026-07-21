import Link from "next/link";

import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * 404. Returns a real 404 status because it is Next's not-found convention —
 * the old SPA rendered its "not found" screen with HTTP 200, which keeps dead
 * URLs in the index indefinitely.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Error 404</p>
        <h1 className="mt-3 text-4xl md:text-5xl">We can&rsquo;t find that page</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          It may have been moved, or the link that brought you here may be out of date.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            Browse all stories
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-rule-strong"
          >
            Go to the homepage
          </Link>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
