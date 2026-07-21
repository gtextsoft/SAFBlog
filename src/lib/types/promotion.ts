export type PromotionPlacement =
  | "sidebar"
  | "in_feed"
  | "in_article"
  | "home_feed"
  | "footer";

export type PromotionStatus = "draft" | "active" | "paused" | "ended";

export const ALL_PLACEMENTS: PromotionPlacement[] = [
  "sidebar",
  "in_feed",
  "home_feed",
  "in_article",
  "footer",
];

export const PLACEMENT_LABEL: Record<PromotionPlacement, string> = {
  sidebar: "Sidebar",
  in_feed: "Between posts (Stories page)",
  home_feed: "Homepage latest stories",
  in_article: "Partway through an article",
  footer: "Site footer",
};

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

/** Admin list/form shape — includes schedule, status, and metrics. */
export interface AdminPromotion {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string;
  targetUrl: string;
  sponsorName: string;
  /** Primary slot (first selected). */
  placement: PromotionPlacement;
  placements: PromotionPlacement[];
  status: PromotionStatus;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  impressions: number;
  clicks: number;
  updatedAt: string;
}
