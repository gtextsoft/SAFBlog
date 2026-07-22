"use server";

import { cookies } from "next/headers";

import { createPublicClient } from "@/lib/supabase/public";

const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

/**
 * Increment post view_count once per visitor per 24h (cookie dedupe).
 * Uses the public anon client + a SECURITY DEFINER RPC, so it works with the
 * NEXT_PUBLIC Supabase keys already in .env.local (no service role required).
 */
export async function recordPostView(postId: string): Promise<void> {
  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) return;

  const cookieStore = await cookies();
  const key = `viewed_${postId}`;
  if (cookieStore.get(key)?.value) return;

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.rpc("increment_post_view", {
      p_post_id: postId,
    });

    if (error) {
      console.error("recordPostView", error.message);
      return;
    }

    cookieStore.set(key, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  } catch (err) {
    console.error("recordPostView", err instanceof Error ? err.message : err);
  }
}
