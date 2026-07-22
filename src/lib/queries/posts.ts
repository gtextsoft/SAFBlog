import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { calculateReadingTime } from "@/lib/reading-time";
import { escapeSearchTerm } from "@/lib/search";
import { createPublicClient } from "@/lib/supabase/public";
import type { Paginated, Post, PostSummary } from "@/types/blog";

export const POSTS_PER_PAGE = 9;

/** Shared tag for list/index caches. */
export const POST_CACHE_TAG = "posts";

/** Per-post tag — purge on create/update/delete. */
export function postCacheTag(slug: string): string {
  return `post:${slug}`;
}

/**
 * One join covering everything a card or article needs. The old app issued a
 * separate round-trip per relation; PostgREST can embed them all.
 */
const POST_SELECT = `
  id, title, slug, excerpt, content, cover_image_url, published_at, updated_at,
  meta_title, meta_description, focus_keyword, og_image_url, canonical_url,
  faq, key_takeaways, reading_minutes, view_count, noindex,
  author:authors(id, full_name, role, bio, avatar_url, slug, twitter_url, linkedin_url, website_url),
  post_categories(category:categories(id, name, slug, description)),
  post_tags(tag:tags(id, name, slug))
` as const;

type FaqRow = { question?: string; answer?: string };

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  faq: FaqRow[] | null;
  key_takeaways: string[] | null;
  reading_minutes: number | null;
  view_count: number | null;
  noindex: boolean | null;
  author: {
    id: string;
    full_name: string;
    role: string | null;
    bio: string | null;
    avatar_url: string | null;
    slug: string | null;
    twitter_url: string | null;
    linkedin_url: string | null;
    website_url: string | null;
  } | null;
  post_categories: { category: NonNullable<Post["categories"][number]> | null }[] | null;
  post_tags: { tag: NonNullable<Post["tags"][number]> | null }[] | null;
};

function mapFaq(faq: FaqRow[] | null): Post["faq"] {
  if (!Array.isArray(faq)) return [];
  return faq
    .filter((item) => item?.question && item?.answer)
    .map((item) => ({ question: String(item.question), answer: String(item.answer) }));
}

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
    readingMinutes: row.reading_minutes ?? calculateReadingTime(row.content),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    focusKeyword: row.focus_keyword,
    ogImageUrl: row.og_image_url,
    canonicalUrl: row.canonical_url,
    faq: mapFaq(row.faq),
    keyTakeaways: row.key_takeaways ?? [],
    noindex: Boolean(row.noindex),
    viewCount: row.view_count ?? 0,
    author: row.author
      ? {
          id: row.author.id,
          fullName: row.author.full_name,
          role: row.author.role,
          bio: row.author.bio,
          avatarUrl: row.author.avatar_url,
          slug: row.author.slug,
          twitterUrl: row.author.twitter_url,
          linkedinUrl: row.author.linkedin_url,
          websiteUrl: row.author.website_url,
        }
      : null,
    categories: (row.post_categories ?? []).map((r) => r.category).filter(Boolean) as Post["categories"],
    tags: (row.post_tags ?? []).map((r) => r.tag).filter(Boolean) as Post["tags"],
  };
}

/** Strip the body and SEO-only fields — list views never need them. */
function toSummary(post: Post): PostSummary {
  const {
    content: _content,
    metaTitle: _metaTitle,
    metaDescription: _metaDescription,
    focusKeyword: _focusKeyword,
    ogImageUrl: _ogImageUrl,
    canonicalUrl: _canonicalUrl,
    faq: _faq,
    keyTakeaways: _keyTakeaways,
    noindex: _noindex,
    viewCount: _viewCount,
    ...summary
  } = post;
  return summary;
}

/**
 * `cache()` dedupes within a single request; `unstable_cache` + tags let
 * admin saves bust the Full Route / Data Cache immediately via revalidateTag.
 */
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  return unstable_cache(
    async () => {
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
    },
    ["post-by-slug", slug],
    { tags: [POST_CACHE_TAG, postCacheTag(slug)], revalidate: 60 },
  )();
});

export const getPublishedPosts = cache(
  async (page = 1, perPage = POSTS_PER_PAGE): Promise<Paginated<PostSummary>> => {
    return unstable_cache(
      async () => {
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
      ["published-posts", String(page), String(perPage)],
      { tags: [POST_CACHE_TAG], revalidate: 60 },
    )();
  },
);

/**
 * Full-text-ish search over published titles and excerpts.
 * Escapes PostgREST / LIKE metacharacters before building the `.or()` filter.
 */
export const searchPosts = cache(
  async (q: string, page = 1, perPage = POSTS_PER_PAGE): Promise<Paginated<PostSummary>> => {
    const term = escapeSearchTerm(q);
    if (!term) {
      return { items: [], total: 0, page, perPage, totalPages: 0 };
    }

    const supabase = createPublicClient();
    const from = (page - 1) * perPage;

    const { data, error, count } = await supabase
      .from("posts")
      .select(POST_SELECT, { count: "exact" })
      .eq("status", "published")
      .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)
      .order("published_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) {
      console.error("searchPosts", { q: term, page, message: error.message });
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

/**
 * Trending list ordered by existing `view_count`. Read-only helper for
 * homepage presentation — no schema or admin changes.
 */
export const getTrendingPosts = cache(async (limit = 5): Promise<PostSummary[]> => {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();

      const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("getTrendingPosts", { message: error.message });
        return [];
      }

      return ((data ?? []) as unknown as PostRow[]).map((row) => toSummary(mapPost(row)));
    },
    ["trending-posts", String(limit)],
    { tags: [POST_CACHE_TAG], revalidate: 60 },
  )();
});

/** Draft/scheduled preview by opaque token. Uses service role (bypasses RLS). */
export async function getPostByPreviewToken(token: string): Promise<Post | null> {
  if (!token) return null;

  const { createServiceClient } = await import("@/lib/supabase/service");
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (err) {
    console.error("getPostByPreviewToken: no service key", err);
    return null;
  }

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("preview_token", token)
    .maybeSingle();

  if (error) {
    console.error("getPostByPreviewToken", { message: error.message });
    return null;
  }

  return data ? mapPost(data as unknown as PostRow) : null;
}
