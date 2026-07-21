import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PromotionPlacement } from "@/lib/types/promotion";

export type PromotionStatus = "draft" | "active" | "paused" | "ended";
export type { PromotionPlacement };

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

/* eslint-disable @typescript-eslint/no-explicit-any */
function map(row: any): AdminPromotion {
  const placements = (row.placements?.length
    ? row.placements
    : [row.placement]) as PromotionPlacement[];

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label,
    targetUrl: row.target_url,
    sponsorName: row.sponsor_name,
    placement: (row.placement ?? placements[0]) as PromotionPlacement,
    placements,
    status: row.status,
    priority: row.priority,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    impressions: row.impressions,
    clicks: row.clicks,
    updatedAt: row.updated_at,
  };
}

/**
 * Every promotion, including drafts and expired ones.
 *
 * Uses the session-bound client so RLS applies the admin policy. A
 * non-admin reaching this would simply get an empty list rather than a leak.
 */
export async function listPromotions(): Promise<AdminPromotion[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("status")
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listPromotions", { message: error.message });
    return [];
  }

  return (data ?? []).map(map);
}

export async function getPromotion(id: string): Promise<AdminPromotion | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("promotions").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("getPromotion", { id, message: error.message });
    return null;
  }

  return data ? map(data) : null;
}

/**
 * Live campaigns are those an anonymous reader would actually be served.
 * Mirrors the RLS predicate so the admin list can flag "active but outside
 * its window", which is otherwise a confusing silent no-show.
 */
export function isCurrentlyLive(promotion: AdminPromotion, now = new Date()): boolean {
  if (promotion.status !== "active") return false;
  if (promotion.startsAt && new Date(promotion.startsAt) > now) return false;
  if (promotion.endsAt && new Date(promotion.endsAt) <= now) return false;
  return true;
}

/**
 * For each placement slot, which live campaign currently wins (highest priority).
 * Used in the admin list so outranked campaigns are not mistaken for broken ones.
 */
export function winningPromotionsBySlot(
  promotions: AdminPromotion[],
): Partial<Record<PromotionPlacement, AdminPromotion>> {
  const live = promotions.filter((p) => isCurrentlyLive(p));
  const winners: Partial<Record<PromotionPlacement, AdminPromotion>> = {};

  for (const slot of ALL_PLACEMENTS) {
    const candidates = live
      .filter((p) => p.placements.includes(slot))
      .sort((a, b) => b.priority - a.priority || b.updatedAt.localeCompare(a.updatedAt));
    if (candidates[0]) winners[slot] = candidates[0];
  }

  return winners;
}
