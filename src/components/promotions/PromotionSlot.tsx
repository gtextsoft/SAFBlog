import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import type { Promotion } from "@/lib/queries/promotions";
import { cn } from "@/lib/utils";

/**
 * Promoted placements.
 *
 * Three rules govern every variant, and none of them are stylistic:
 *
 * 1. `rel="sponsored nofollow noopener"` on the outbound link. Google requires
 *    paid or promotional links to be marked; unmarked ones are a link-scheme
 *    violation that risks a manual penalty. Shipping unmarked promos would
 *    actively damage the SEO work this redesign exists to do.
 *
 * 2. A visible "Sponsored" label naming the sponsor. Required for FTC/ASA
 *    disclosure, and it is what keeps the placement from reading as editorial.
 *
 * 3. Reserved space via fixed aspect ratios. An ad slot that grows after load
 *    is the classic cause of a reader tapping the wrong thing — and of a
 *    failing CLS score.
 *
 * Visually they sit on the sunken surface with a rule, so they read as
 * adjacent to the content rather than part of it.
 */

function SponsoredLabel({ sponsor }: { sponsor: string }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      <span className="rounded-sm border border-border px-1.5 py-0.5">Sponsored</span>
      <span className="truncate normal-case tracking-normal">by {sponsor}</span>
    </p>
  );
}

interface PromotionProps {
  promotion: Promotion;
  className?: string;
}

/** Sidebar rail placement. Portrait-ish image over stacked text. */
export function SidebarPromotion({ promotion, className }: PromotionProps) {
  return (
    <aside
      aria-label={`Sponsored content from ${promotion.sponsorName}`}
      className={cn("rounded-lg border border-border bg-surface-sunken p-4", className)}
    >
      <SponsoredLabel sponsor={promotion.sponsorName} />

      {promotion.imageUrl && (
        <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded">
          <Image
            src={promotion.imageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-cover"
          />
        </div>
      )}

      <h3 className="mt-3 text-lg leading-snug">{promotion.title}</h3>
      {promotion.body && (
        <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{promotion.body}</p>
      )}

      <a
        href={`/go/${promotion.id}`}
        rel="sponsored nofollow noopener"
        target="_blank"
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
      >
        {promotion.ctaLabel}
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">(sponsored link, opens in a new tab)</span>
      </a>
    </aside>
  );
}

/**
 * In-feed placement. Matches the post-card grid's footprint so the rhythm of
 * the feed survives, but the sunken surface and label keep it distinguishable.
 */
export function InFeedPromotion({ promotion, className }: PromotionProps) {
  return (
    <aside
      aria-label={`Sponsored content from ${promotion.sponsorName}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-surface-sunken",
        className,
      )}
    >
      {promotion.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={promotion.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <SponsoredLabel sponsor={promotion.sponsorName} />
        <h3 className="mt-2 text-xl leading-snug">{promotion.title}</h3>
        {promotion.body && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{promotion.body}</p>
        )}

        <a
          href={`/go/${promotion.id}`}
          rel="sponsored nofollow noopener"
          target="_blank"
          className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
        >
          {promotion.ctaLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">(sponsored link, opens in a new tab)</span>
        </a>
      </div>
    </aside>
  );
}

/**
 * Mid-article placement.
 *
 * Rendered as a sibling of the article body, never inside it: the prose
 * container feeds `articleBody` in the BlogPosting schema and the llms.txt
 * corpus, and promotional copy must not end up quoted by an AI answer engine
 * as if it were Foundation reporting.
 */
export function InArticlePromotion({ promotion, className }: PromotionProps) {
  return (
    <aside
      aria-label={`Sponsored content from ${promotion.sponsorName}`}
      className={cn(
        "my-10 flex flex-col gap-4 rounded-lg border-y border-border bg-surface-sunken p-5 sm:flex-row sm:items-center",
        className,
      )}
    >
      {promotion.imageUrl && (
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded sm:w-44">
          <Image
            src={promotion.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 176px"
            className="object-cover"
          />
        </div>
      )}

      <div className="min-w-0">
        <SponsoredLabel sponsor={promotion.sponsorName} />
        <h3 className="mt-2 text-lg leading-snug">{promotion.title}</h3>
        {promotion.body && (
          <p className="mt-1.5 text-sm text-muted-foreground">{promotion.body}</p>
        )}

        <a
          href={`/go/${promotion.id}`}
          rel="sponsored nofollow noopener"
          target="_blank"
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
        >
          {promotion.ctaLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">(sponsored link, opens in a new tab)</span>
        </a>
      </div>
    </aside>
  );
}
