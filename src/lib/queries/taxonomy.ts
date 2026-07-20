import "server-only";

import { cache } from "react";

import { calculateReadingTime } from "@/lib/reading-time";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Paginated, PostSummary, Tag } from "@/types/blog";
import { POSTS_PER_PAGE } from "@/lib/queries/posts";

export interface CategoryWithCount extends Category {
  postCount: number;
}

export interface TagWithCount extends Tag {
  postCount: number;
}

/**
 * Categories with post counts in a single round-trip.
 *
 * The old sidebar looped over every category and every tag, issuing a junction
 * query plus a count query for each — an N+1 storm on every page load.
 * PostgREST can aggregate the embedded relation instead.
 */
export const getCategoriesWithCounts = cache(async (): Promise<CategoryWithCount[]> => {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, post_categories(count)")
    .order("name");

  if (error) {
    console.error("getCategoriesWithCounts", { message: error.message });
    return [];
  }

  return (data as unknown as (Category & { post_categories: { count: number }[] })[]).map(
    (row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      postCount: row.post_categories?.[0]?.count ?? 0,
    }),
  );
});

export const getTagsWithCounts = cache(async (limit?: number): Promise<TagWithCount[]> => {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, post_tags(count)")
    .order("name");

  if (error) {
    console.error("getTagsWithCounts", { message: error.message });
    return [];
  }

  const mapped = (data as unknown as (Tag & { post_tags: { count: number }[] })[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    postCount: row.post_tags?.[0]?.count ?? 0,
  }));

  // Most-used first when the caller wants a top-N list.
  mapped.sort((a, b) => b.postCount - a.postCount);
  return typeof limit === "number" ? mapped.slice(0, limit) : mapped;
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  return data ?? null;
});

export const getTagBySlug = cache(async (slug: string): Promise<Tag | null> => {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  return data ?? null;
});

/** Shape returned by the taxonomy join below. */
interface TaxonomyPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
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
  post_categories: { category: Category | null }[] | null;
  post_tags: { tag: Tag | null }[] | null;
}

/**
 * Posts in a taxonomy term, paginated.
 *
 * The old category/tag pages fetched every matching post with no limit. The
 * inner-join filter syntax (`post_categories!inner`) lets one query do the
 * filtering and the counting.
 */
async function getPostsByTaxonomy(
  relation: "post_categories" | "post_tags",
  column: "category_id" | "tag_id",
  termId: string,
  page: number,
  perPage: number,
): Promise<Paginated<PostSummary>> {
  const supabase = createPublicClient();
  const from = (page - 1) * perPage;

  const { data, error, count } = await supabase
    .from("posts")
    .select(
      `
        id, title, slug, excerpt, content, cover_image_url, published_at, updated_at,
        author:authors(id, full_name, role, bio, avatar_url),
        post_categories(category:categories(id, name, slug, description)),
        post_tags(tag:tags(id, name, slug)),
        ${relation}!inner(${column})
      `,
      { count: "exact" },
    )
    .eq("status", "published")
    .eq(`${relation}.${column}`, termId)
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) {
    console.error("getPostsByTaxonomy", { relation, termId, message: error.message });
    return { items: [], total: 0, page, perPage, totalPages: 0 };
  }

  const items = (data as unknown as TaxonomyPostRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingMinutes: calculateReadingTime(row.content ?? ""),
    author: row.author
      ? {
          id: row.author.id,
          fullName: row.author.full_name,
          role: row.author.role,
          bio: row.author.bio,
          avatarUrl: row.author.avatar_url,
        }
      : null,
    categories: (row.post_categories ?? []).map((r) => r.category).filter(Boolean) as Category[],
    tags: (row.post_tags ?? []).map((r) => r.tag).filter(Boolean) as Tag[],
  })) satisfies PostSummary[];

  const total = count ?? 0;
  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export const getPostsByCategory = cache(
  (categoryId: string, page = 1, perPage = POSTS_PER_PAGE) =>
    getPostsByTaxonomy("post_categories", "category_id", categoryId, page, perPage),
);

export const getPostsByTag = cache(
  (tagId: string, page = 1, perPage = POSTS_PER_PAGE) =>
    getPostsByTaxonomy("post_tags", "tag_id", tagId, page, perPage),
);
