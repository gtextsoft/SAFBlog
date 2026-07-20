import "server-only";

import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";

export type PromotionPlacement = "sidebar" | "in_feed" | "in_article";

export interface Promotion {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string;
  /** Never rendered as an href — clicks route through /go/[id]. */
  targetUrl: string;
  sponsorName: string;
  placement: PromotionPlacement;
}

/**
 * Live promotions for a slot, highest priority first.
 *
 * The "is it live?" test lives in the RLS policy, not here — see the
 * promotions migration. This query only chooses placement and ordering, so an
 * omission in application code cannot expose a draft campaign.
 */
export const getPromotions = cache(
  async (placement: PromotionPlacement, limit = 1): Promise<Promotion[]> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("promotions")
      .select("id, title, body, image_url, cta_label, target_url, sponsor_name, placement")
      .eq("placement", placement)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // A failed ad lookup must never take a page down with it.
      console.error("getPromotions", { placement, message: error.message });
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      imageUrl: row.image_url,
      ctaLabel: row.cta_label,
      targetUrl: row.target_url,
      sponsorName: row.sponsor_name,
      placement: row.placement as PromotionPlacement,
    }));
  },
);
