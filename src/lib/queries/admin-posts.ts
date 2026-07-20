import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface AdminPostListItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  authorName: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminPostDetail extends AdminPostListItem {
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  authorId: string | null;
  categoryIds: string[];
  tagIds: string[];
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

/**
 * All posts, drafts included. Uses the session-bound client so RLS applies the
 * admin policy — a non-admin gets an empty list rather than a leak.
 */
export async function listPosts(): Promise<AdminPostListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, status, published_at, updated_at, author:authors(full_name)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listPosts", { message: error.message });
    return [];
  }

  return (data ?? []).map((row) => {
    // PostgREST types the embedded author as an array; it is a to-one relation.
    const author = row.author as unknown as { full_name: string } | null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status as "draft" | "published",
      authorName: author?.full_name ?? null,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function getPostForEdit(id: string): Promise<AdminPostDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, title, slug, status, excerpt, content, cover_image_url, author_id,
       published_at, updated_at,
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

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    status: data.status as "draft" | "published",
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.cover_image_url,
    authorId: data.author_id,
    authorName: author?.full_name ?? null,
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
    categoryIds: (data.post_categories ?? []).map((r) => r.category_id),
    tagIds: (data.post_tags ?? []).map((r) => r.tag_id),
  };
}

/** Authors, categories and tags for the editor's selects. */
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
