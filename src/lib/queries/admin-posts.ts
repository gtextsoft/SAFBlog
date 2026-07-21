import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { FaqItem } from "@/types/blog";

export interface AdminPostListItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "scheduled";
  authorName: string | null;
  publishedAt: string | null;
  updatedAt: string;
  viewCount: number;
}

export interface AdminPostDetail extends AdminPostListItem {
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  authorId: string | null;
  categoryIds: string[];
  tagIds: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  keyTakeaways: string[];
  faq: FaqItem[];
  scheduledAt: string | null;
  previewToken: string | null;
}

export interface AdminAuthor {
  id: string;
  fullName: string;
}

export interface AdminTerm {
  id: string;
  name: string;
  slug: string;
}

export async function listPosts(): Promise<AdminPostListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, status, published_at, updated_at, view_count, author:authors(full_name)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listPosts", { message: error.message });
    return [];
  }

  return (data ?? []).map((row) => {
    const author = row.author as unknown as { full_name: string } | null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status as AdminPostListItem["status"],
      authorName: author?.full_name ?? null,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      viewCount: row.view_count ?? 0,
    };
  });
}

export async function getPostForEdit(id: string): Promise<AdminPostDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, title, slug, status, excerpt, content, cover_image_url, author_id,
       published_at, updated_at, view_count,
       meta_title, meta_description, focus_keyword, og_image_url, canonical_url,
       noindex, key_takeaways, faq, scheduled_at, preview_token,
       author:authors(full_name),
       post_categories(category_id),
       post_tags(tag_id)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getPostForEdit", { id, message: error.message });
    return null;
  }

  const author = data.author as unknown as { full_name: string } | null;
  const faqRaw = data.faq as { question?: string; answer?: string }[] | null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    status: data.status as AdminPostDetail["status"],
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.cover_image_url,
    authorId: data.author_id,
    authorName: author?.full_name ?? null,
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
    viewCount: data.view_count ?? 0,
    categoryIds: (data.post_categories ?? []).map((r) => r.category_id),
    tagIds: (data.post_tags ?? []).map((r) => r.tag_id),
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    focusKeyword: data.focus_keyword,
    ogImageUrl: data.og_image_url,
    canonicalUrl: data.canonical_url,
    noindex: Boolean(data.noindex),
    keyTakeaways: data.key_takeaways ?? [],
    faq: Array.isArray(faqRaw)
      ? faqRaw
          .filter((i) => i?.question && i?.answer)
          .map((i) => ({ question: String(i.question), answer: String(i.answer) }))
      : [],
    scheduledAt: data.scheduled_at,
    previewToken: data.preview_token,
  };
}

export async function getEditorOptions(): Promise<{
  authors: AdminAuthor[];
  categories: AdminTerm[];
  tags: AdminTerm[];
}> {
  const supabase = await createClient();

  const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
    supabase.from("authors").select("id, full_name").order("full_name"),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("tags").select("id, name, slug").order("name"),
  ]);

  return {
    authors: (authorsRes.data ?? []).map((a) => ({ id: a.id, fullName: a.full_name })),
    categories: categoriesRes.data ?? [],
    tags: tagsRes.data ?? [],
  };
}
