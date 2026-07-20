import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { PromotionRow } from "@/components/admin/PromotionRow";
import { isCurrentlyLive, listPromotions } from "@/lib/queries/admin-promotions";

export const dynamic = "force-dynamic";

const PLACEMENT_LABEL = {
  sidebar: "Sidebar",
  in_feed: "In feed",
  in_article: "In article",
} as const;

export default async function PromotionsPage() {
  const promotions = await listPromotions();

  const liveCount = promotions.filter((p) => isCurrentlyLive(p)).length;
  const totalClicks = promotions.reduce((sum, p) => sum + p.clicks, 0);
  const totalImpressions = promotions.reduce((sum, p) => sum + p.impressions, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Promotions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sponsored placements shown alongside articles. Every placement is labelled
            &ldquo;Sponsored&rdquo; and its link marked <code className="text-xs">nofollow</code> for
            readers and search engines.
          </p>
        </div>

        <Link
          href="/admin/promotions/new"
          className="inline-flex min-h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New promotion
        </Link>
      </div>

      {promotions.length > 0 && (
        <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {[
            ["Live now", liveCount.toLocaleString("en-NG")],
            ["Impressions", totalImpressions.toLocaleString("en-NG")],
            ["Clicks", totalClicks.toLocaleString("en-NG")],
          ].map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <dt className="text-eyebrow uppercase text-muted-foreground">{label}</dt>
              <dd data-numeric className="mt-1 font-display text-2xl">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {promotions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Megaphone className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">No promotions yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Create one to show a sponsored placement in the sidebar, between posts in the feed, or
            partway through an article.
          </p>
          <Link
            href="/admin/promotions/new"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create the first promotion
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {promotions.map((promotion) => (
            <PromotionRow
              key={promotion.id}
              promotion={promotion}
              live={isCurrentlyLive(promotion)}
              placementLabel={PLACEMENT_LABEL[promotion.placement]}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
