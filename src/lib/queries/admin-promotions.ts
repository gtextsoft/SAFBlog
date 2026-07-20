import "server-only";

import { createClient } from "@/lib/supabase/server";

export type PromotionStatus = "draft" | "active" | "paused" | "ended";
export type PromotionPlacement = "sidebar" | "in_feed" | "in_article";

export interface AdminPromotion {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string;
  targetUrl: string;
  sponsorName: string;
  placement: PromotionPlacement;
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
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label,
    targetUrl: row.target_url,
    sponsorName: row.sponsor_name,
    placement: row.placement,
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
