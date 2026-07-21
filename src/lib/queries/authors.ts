import "server-only";

import { cache } from "react";

import { calculateReadingTime } from "@/lib/reading-time";
import { POSTS_PER_PAGE } from "@/lib/queries/posts";
import { createPublicClient } from "@/lib/supabase/public";
import type { Author, Paginated, Post, PostSummary } from "@/types/blog";

// Re-implement mapping locally to avoid circular imports with posts.ts.
// Author archive uses the same shape as taxonomy archives.

const POST_SELECT = `
  id, title, slug, excerpt, content, cover_image_url, published_at, updated_at,
  meta_title, meta_description, focus_keyword, og_image_url, canonical_url,
  faq, key_takeaways, reading_minutes, view_count, noindex,
  author:authors(id, full_name, role, bio, avatar_url, slug, twitter_url, linkedin_url, website_url),
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
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  faq: { question?: string; answer?: string }[] | null;
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
  post_categories: { category: Post["categories"][number] | null }[] | null;
  post_tags: { tag: Post["tags"][number] | null }[] | null;
};

function mapAuthor(a: NonNullable<PostRow["author"]>): Author {
  return {
    id: a.id,
    fullName: a.full_name,
    role: a.role,
    bio: a.bio,
    avatarUrl: a.avatar_url,
    slug: a.slug,
    twitterUrl: a.twitter_url,
    linkedinUrl: a.linkedin_url,
    websiteUrl: a.website_url,
  };
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
    faq: Array.isArray(row.faq)
      ? row.faq
          .filter((i) => i?.question && i?.answer)
          .map((i) => ({ question: String(i.question), answer: String(i.answer) }))
      : [],
    keyTakeaways: row.key_takeaways ?? [],
    noindex: Boolean(row.noindex),
    viewCount: row.view_count ?? 0,
    author: row.author ? mapAuthor(row.author) : null,
    categories: (row.post_categories ?? []).map((r) => r.category).filter(Boolean) as Post["categories"],
    tags: (row.post_tags ?? []).map((r) => r.tag).filter(Boolean) as Post["tags"],
  };
}

function toSummary(post: Post): PostSummary {
  const {
    content: _c,
    metaTitle: _mt,
    metaDescription: _md,
    focusKeyword: _fk,
    ogImageUrl: _og,
    canonicalUrl: _cu,
    faq: _faq,
    keyTakeaways: _kt,
    noindex: _ni,
    viewCount: _vc,
    ...summary
  } = post;
  return summary;
}

export const getAuthorBySlug = cache(async (slug: string): Promise<Author | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("authors")
    .select("id, full_name, role, bio, avatar_url, slug, twitter_url, linkedin_url, website_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getAuthorBySlug", { slug, message: error.message });
    return null;
  }

  return mapAuthor(data);
});

export const getAllAuthors = cache(async (): Promise<Author[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("authors")
    .select("id, full_name, role, bio, avatar_url, slug, twitter_url, linkedin_url, website_url")
    .order("full_name");

  if (error) {
    console.error("getAllAuthors", { message: error.message });
    return [];
  }

  return (data ?? []).map(mapAuthor);
});

export const getPostsByAuthor = cache(
  async (authorId: string, page = 1, perPage = POSTS_PER_PAGE): Promise<Paginated<PostSummary>> => {
    const supabase = createPublicClient();
    const from = (page - 1) * perPage;

    const { data, error, count } = await supabase
      .from("posts")
      .select(POST_SELECT, { count: "exact" })
      .eq("status", "published")
      .eq("author_id", authorId)
      .order("published_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) {
      console.error("getPostsByAuthor", { authorId, message: error.message });
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
