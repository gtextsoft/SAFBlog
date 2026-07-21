import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

/**
 * Publish due scheduled posts. Protect with `Authorization: Bearer <CRON_SECRET>`.
 * Configure in vercel.json crons every 5 minutes.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Service unavailable" },
      { status: 503 },
    );
  }

  const now = new Date().toISOString();
  const { data: due, error } = await supabase
    .from("posts")
    .select("id, slug")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const published: string[] = [];
  for (const post of due ?? []) {
    const { error: upd } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: now,
        scheduled_at: null,
      })
      .eq("id", post.id);

    if (!upd) {
      published.push(post.slug);
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath("/blog");
      revalidatePath("/");
    }
  }

  if (published.length > 0) {
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
  }

  return NextResponse.json({ published });
}
