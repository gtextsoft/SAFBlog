"use server";

import { cookies } from "next/headers";

import { createServiceClient } from "@/lib/supabase/service";

const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

/**
 * Increment post view_count once per visitor per 24h (cookie dedupe).
 * Uses the service role so anonymous viewers can bump the counter without
 * opening a public UPDATE policy on posts.
 */
export async function recordPostView(postId: string): Promise<void> {
  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) return;

  const cookieStore = await cookies();
  const key = `viewed_${postId}`;
  if (cookieStore.get(key)?.value) return;

  try {
    const service = createServiceClient();
    const { data } = await service
      .from("posts")
      .select("view_count")
      .eq("id", postId)
      .maybeSingle();

    if (!data) return;

    await service
      .from("posts")
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq("id", postId);

    cookieStore.set(key, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  } catch (err) {
    console.error("recordPostView", err);
  }
}
