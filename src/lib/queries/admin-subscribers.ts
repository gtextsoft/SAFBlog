import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface AdminSubscriber {
  id: string;
  email: string;
  fullName: string | null;
  status: "pending" | "subscribed" | "unsubscribed";
  source: string | null;
  createdAt: string;
  unsubscribedAt: string | null;
}

export const SUBSCRIBERS_PER_PAGE = 50;

/**
 * Subscribers, paginated.
 *
 * The old screen loaded every row into the browser at once. A mailing list
 * grows without bound, so that gets slower forever and ships the entire list
 * of personal data to the client in one payload.
 */
export async function listSubscribers(
  page = 1,
  perPage = SUBSCRIBERS_PER_PAGE,
  status?: AdminSubscriber["status"],
): Promise<{ items: AdminSubscriber[]; total: number; totalPages: number; page: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;

  let query = supabase
    .from("newsletter_subscribers")
    .select("id, email, full_name, status, source, created_at, unsubscribed_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("listSubscribers", { message: error.message });
    return { items: [], total: 0, totalPages: 1, page };
  }

  const total = count ?? 0;

  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      status: row.status as AdminSubscriber["status"],
      source: row.source,
      createdAt: row.created_at,
      unsubscribedAt: row.unsubscribed_at,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    page,
  };
}

/** Headline counts, computed in the database rather than over a fetched page. */
export async function getSubscriberStats(): Promise<{
  subscribed: number;
  unsubscribed: number;
  pending: number;
}> {
  const supabase = await createClient();

  const [subscribedRes, unsubscribedRes, pendingRes] = await Promise.all([
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed"),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "unsubscribed"),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    subscribed: subscribedRes.count ?? 0,
    unsubscribed: unsubscribedRes.count ?? 0,
    pending: pendingRes.count ?? 0,
  };
}
