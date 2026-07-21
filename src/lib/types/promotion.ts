export type PromotionPlacement =
  | "sidebar"
  | "in_feed"
  | "in_article"
  | "home_feed"
  | "footer";

export interface Promotion {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string;
  /** Never rendered as an href — clicks route through /go/[id]. */
  targetUrl: string;
  sponsorName: string;
  /** Primary slot (first selected). Kept for display / legacy callers. */
  placement: PromotionPlacement;
  /** Every slot this campaign is eligible for. */
  placements: PromotionPlacement[];
}
