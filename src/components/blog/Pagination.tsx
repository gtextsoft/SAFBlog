import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Pagination.
 *
 * Real links with real hrefs. The old version rendered `href="#"` with
 * preventDefault and kept the page number in component state, so page 2
 * onwards had no URL — unshareable, unbookmarkable, and invisible to
 * crawlers, which is why deep posts were never indexed.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  query,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  /** Extra query params preserved across pages (e.g. `{ q: "education" }`). */
  query?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const href = (n: number) => {
    const params = new URLSearchParams(query);
    if (n > 1) params.set("page", String(n));
    else params.delete("page");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Compact window around the current page; always show first and last.
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const visible = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          rel="prev"
          className="inline-flex min-h-11 items-center gap-1 rounded px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Link>
      )}

      <ol className="flex items-center gap-1">
        {visible.map((n, i) => {
          const gap = i > 0 && n - visible[i - 1] > 1;

          return (
            <li key={n} className="flex items-center">
              {gap && (
                <span className="px-2 text-muted-foreground" aria-hidden="true">
                  …
                </span>
              )}
              <Link
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Page ${n}`}
                className={cn(
                  "inline-flex h-11 min-w-11 items-center justify-center rounded px-3 text-sm transition-colors duration-150",
                  n === page
                    ? "bg-primary-subtle font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n}
              </Link>
            </li>
          );
        })}
      </ol>

      {page < totalPages && (
        <Link
          href={href(page + 1)}
          rel="next"
          className="inline-flex min-h-11 items-center gap-1 rounded px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
