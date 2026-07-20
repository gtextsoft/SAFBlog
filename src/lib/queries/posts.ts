import "server-only";

import { cache } from "react";

import { calculateReadingTime } from "@/lib/reading-time";
import { createPublicClient } from "@/lib/supabase/public";
import type { Paginated, Post, PostSummary } from "@/types/blog";

export const POSTS_PER_PAGE = 9;

/**
 * One join covering everything a card or article needs. The old app issued a
 * separate round-trip per relation; PostgREST can embed them all.
 */
const POST_SELECT = `
  id, title, slug, excerpt, content, cover_image_url, published_at, updated_at,
  author:authors(id, full_name, role, bio, avatar_url),
  post_categories(category:categories(id, name, slug, description)),
  post_tags(tag:tags(id, name, slug))
` as const;

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  updated_at: string;
  author: {
    id: string;
    full_name: string;
    role: string | null;
    bio: string | null;
    avatar_url: string | null;
  } | null;
  post_categories: { category: NonNullable<Post["categories"][number]> | null }[] | null;
  post_tags: { tag: NonNullable<Post["tags"][number]> | null }[] | null;
};

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content,
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingMinutes: calculateReadingTime(row.content),
    author: row.author
      ? {
          id: row.author.id,
          fullName: row.author.full_name,
          role: row.author.role,
          bio: row.author.bio,
          avatarUrl: row.author.avatar_url,
        }
      : null,
    // `.filter(Boolean)` guards against a relation row whose target was deleted.
    categories: (row.post_categories ?? []).map((r) => r.category).filter(Boolean) as Post["categories"],
    tags: (row.post_tags ?? []).map((r) => r.tag).filter(Boolean) as Post["tags"],
  };
}

/** Strip the body — list views never need it, and it dominates payload size. */
function toSummary(post: Post): PostSummary {
  const { content: _content, ...summary } = post;
  return summary;
}

/**
 * `cache()` dedupes within a single request, so generateMetadata and the page
 * component can each ask for the same post without a second query.
 */
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getPostBySlug", { slug, message: error.message });
    return null;
  }

  return data ? mapPost(data as unknown as PostRow) : null;
});

export const getPublishedPosts = cache(
  async (page = 1, perPage = POSTS_PER_PAGE): Promise<Paginated<PostSummary>> => {
    const supabase = createPublicClient();
    const from = (page - 1) * perPage;

    const { data, error, count } = await supabase
      .from("posts")
      .select(POST_SELECT, { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) {
      console.error("getPublishedPosts", { page, message: error.message });
      return { items: [], total: 0, page, perPage, totalPages: 0 };
    }

    const total = count ?? 0;
    return {
      items: (data as unknown as PostRow[]).map((row) => toSummary(mapPost(row))),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  },
);

/** Every published slug — drives generateStaticParams and the sitemap. */
export const getAllPostSlugs = cache(
  async (): Promise<{ slug: string; updatedAt: string }[]> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("getAllPostSlugs", { message: error.message });
      return [];
    }

    return data.map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
  },
);

/**
 * Posts sharing a category or tag with the given one.
 *
 * The Vite version computed `categoryIds` and then never used it, so "related
 * posts" were three arbitrary recent posts. This actually filters on the
 * relation, falling back to recent posts only when nothing overlaps.
 */
export const getRelatedPosts = cache(
  async (postId: string, limit = 3): Promise<PostSummary[]> => {
    const supabase = createPublicClient();

    const [{ data: categoryRows }, { data: tagRows }] = await Promise.all([
      supabase.from("post_categories").select("category_id").eq("post_id", postId),
      supabase.from("post_tags").select("tag_id").eq("post_id", postId),
    ]);

    const categoryIds = (categoryRows ?? []).map((r) => r.category_id);
    const tagIds = (tagRows ?? []).map((r) => r.tag_id);

    const relatedIds = new Set<string>();

    if (categoryIds.length > 0) {
      const { data } = await supabase
        .from("post_categories")
        .select("post_id")
        .in("category_id", categoryIds)
        .neq("post_id", postId);
      for (const row of data ?? []) relatedIds.add(row.post_id);
    }

    if (tagIds.length > 0) {
      const { data } = await supabase
        .from("post_tags")
        .select("post_id")
        .in("tag_id", tagIds)
        .neq("post_id", postId);
      for (const row of data ?? []) relatedIds.add(row.post_id);
    }

    if (relatedIds.size === 0) {
      // No overlap — fall back to recent posts so the slot is never empty.
      const { data } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "published")
        .neq("id", postId)
        .order("published_at", { ascending: false })
        .limit(limit);

      return ((data ?? []) as unknown as PostRow[]).map((row) => toSummary(mapPost(row)));
    }

    const { data } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .in("id", [...relatedIds])
      .order("published_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as unknown as PostRow[]).map((row) => toSummary(mapPost(row)));
  },
);

/**
 * Previous/next by publication date. The old implementation fetched every
 * published post to the browser to work this out; two bounded queries suffice.
 */
export const getAdjacentPosts = cache(
  async (
    publishedAt: string,
  ): Promise<{ previous: PostSummary | null; next: PostSummary | null }> => {
    const supabase = createPublicClient();

    const [{ data: previous }, { data: next }] = await Promise.all([
      supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "published")
        .lt("published_at", publishedAt)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "published")
        .gt("published_at", publishedAt)
        .order("published_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      previous: previous ? toSummary(mapPost(previous as unknown as PostRow)) : null,
      next: next ? toSummary(mapPost(next as unknown as PostRow)) : null,
    };
  },
);
