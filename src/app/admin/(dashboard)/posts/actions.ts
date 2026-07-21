"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { uploadBlogImage } from "@/lib/storage/upload";
import { requireRole } from "@/lib/auth/require-role";
import { randomToken, slugify } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/server";
import { POST_CACHE_TAG, postCacheTag } from "@/lib/queries/posts";

async function requireAdmin() {
  const { supabase } = await requireRole("admin", "editor");
  return supabase;
}

export interface PostActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const FaqItemSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const PostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  authorId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "scheduled"]),
  scheduledAt: z.string().optional().or(z.literal("")),
  categoryIds: z.array(z.string().uuid()),
  tagIds: z.array(z.string().uuid()),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  focusKeyword: z.string().trim().max(80).optional().or(z.literal("")),
  ogImageUrl: z.string().trim().url().optional().or(z.literal("")),
  canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
  noindex: z.boolean(),
  keyTakeaways: z.array(z.string().trim().min(1)).max(12),
  faq: z.array(FaqItemSchema).max(20),
});

function parseFaq(formData: FormData) {
  const questions = formData.getAll("faqQuestion").map(String);
  const answers = formData.getAll("faqAnswer").map(String);
  const faq: { question: string; answer: string }[] = [];
  for (let i = 0; i < Math.max(questions.length, answers.length); i++) {
    const question = (questions[i] ?? "").trim();
    const answer = (answers[i] ?? "").trim();
    if (question && answer) faq.push({ question, answer });
  }
  return faq;
}

function parse(formData: FormData) {
  const takeawaysRaw = String(formData.get("keyTakeaways") ?? "");
  const keyTakeaways = takeawaysRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return PostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl"),
    authorId: formData.get("authorId"),
    status: formData.get("status"),
    scheduledAt: formData.get("scheduledAt"),
    categoryIds: formData.getAll("categoryIds").map(String).filter(Boolean),
    tagIds: formData.getAll("tagIds").map(String).filter(Boolean),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    focusKeyword: formData.get("focusKeyword"),
    ogImageUrl: formData.get("ogImageUrl"),
    canonicalUrl: formData.get("canonicalUrl"),
    noindex: formData.get("noindex") === "on" || formData.get("noindex") === "true",
    keyTakeaways,
    faq: parseFaq(formData),
  });
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

function seoFields(v: z.infer<typeof PostSchema>) {
  return {
    meta_title: v.metaTitle || null,
    meta_description: v.metaDescription || null,
    focus_keyword: v.focusKeyword || null,
    og_image_url: v.ogImageUrl || null,
    canonical_url: v.canonicalUrl || null,
    noindex: v.noindex,
    key_takeaways: v.keyTakeaways,
    faq: v.faq,
    scheduled_at:
      v.status === "scheduled" && v.scheduledAt
        ? new Date(v.scheduledAt).toISOString()
        : null,
  };
}

async function syncTaxonomy(
  supabase: Supabase,
  postId: string,
  categoryIds: string[],
  tagIds: string[],
): Promise<string | null> {
  if (categoryIds.length > 0) {
    const { error } = await supabase
      .from("post_categories")
      .upsert(
        categoryIds.map((category_id) => ({ post_id: postId, category_id })),
        { onConflict: "post_id,category_id", ignoreDuplicates: true },
      );
    if (error) return error.message;
  }

  if (tagIds.length > 0) {
    const { error } = await supabase
      .from("post_tags")
      .upsert(
        tagIds.map((tag_id) => ({ post_id: postId, tag_id })),
        { onConflict: "post_id,tag_id", ignoreDuplicates: true },
      );
    if (error) return error.message;
  }

  const deleteCategories =
    categoryIds.length > 0
      ? supabase
          .from("post_categories")
          .delete()
          .eq("post_id", postId)
          .not("category_id", "in", `(${categoryIds.join(",")})`)
      : supabase.from("post_categories").delete().eq("post_id", postId);

  const deleteTags =
    tagIds.length > 0
      ? supabase
          .from("post_tags")
          .delete()
          .eq("post_id", postId)
          .not("tag_id", "in", `(${tagIds.join(",")})`)
      : supabase.from("post_tags").delete().eq("post_id", postId);

  const [catRes, tagRes] = await Promise.all([deleteCategories, deleteTags]);
  if (catRes.error) return catRes.error.message;
  if (tagRes.error) return tagRes.error.message;

  return null;
}

function revalidatePost(slug: string) {
  // updateTag = immediate expire (Server Action read-your-writes). Required in Next 16.
  updateTag(postCacheTag(slug));
  updateTag(POST_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`, "layout");
  revalidatePath(`/blog/${slug}`, "page");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  revalidatePath("/author/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
  revalidatePath("/admin/posts");
}

export async function createPost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const supabase = await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;

  if (v.status === "scheduled" && !v.scheduledAt) {
    return { fieldErrors: { scheduledAt: "Pick a publish time for scheduled posts." } };
  }

  const { data: clash } = await supabase.from("posts").select("id").eq("slug", v.slug).maybeSingle();
  if (clash) {
    return { fieldErrors: { slug: "A post with this URL already exists. Choose another." } };
  }

  const preview_token = randomToken(16);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: v.title,
      slug: v.slug,
      excerpt: v.excerpt || null,
      content: v.content,
      cover_image_url: v.coverImageUrl || null,
      author_id: v.authorId || null,
      status: v.status,
      published_at: v.status === "published" ? new Date().toISOString() : null,
      preview_token,
      ...seoFields(v),
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    console.error("createPost", { message: error?.message });
    return { error: "Could not save this post. Please try again." };
  }

  const taxonomyError = await syncTaxonomy(supabase, data.id, v.categoryIds, v.tagIds);
  if (taxonomyError) {
    console.error("createPost: taxonomy", { message: taxonomyError });
    return {
      error: "The post was saved, but its topics and tags could not be applied. Edit it to retry.",
    };
  }

  revalidatePost(data.slug);
  redirect(`/admin/posts?created=1`);
}

export async function updatePost(
  id: string,
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const supabase = await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;

  if (v.status === "scheduled" && !v.scheduledAt) {
    return { fieldErrors: { scheduledAt: "Pick a publish time for scheduled posts." } };
  }

  const { data: clash } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", v.slug)
    .neq("id", id)
    .maybeSingle();
  if (clash) {
    return { fieldErrors: { slug: "Another post already uses this URL." } };
  }

  const { data: existing } = await supabase
    .from("posts")
    .select("published_at, slug, preview_token")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("posts")
    .update({
      title: v.title,
      slug: v.slug,
      excerpt: v.excerpt || null,
      content: v.content,
      cover_image_url: v.coverImageUrl || null,
      author_id: v.authorId || null,
      status: v.status,
      published_at:
        v.status === "published"
          ? (existing?.published_at ?? new Date().toISOString())
          : existing?.published_at ?? null,
      preview_token: existing?.preview_token || randomToken(16),
      updated_at: new Date().toISOString(),
      ...seoFields(v),
    })
    .eq("id", id);

  if (error) {
    console.error("updatePost", { id, message: error.message });
    return { error: "Could not save this post. Please try again." };
  }

  const taxonomyError = await syncTaxonomy(supabase, id, v.categoryIds, v.tagIds);
  if (taxonomyError) {
    console.error("updatePost: taxonomy", { message: taxonomyError });
    return {
      error: "The post was saved, but its topics and tags could not be applied. Please retry.",
    };
  }

  if (existing?.slug && existing.slug !== v.slug) revalidatePost(existing.slug);
  revalidatePost(v.slug);
  redirect(`/admin/posts?saved=1`);
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await requireAdmin();

  const { data: post } = await supabase.from("posts").select("slug").eq("id", id).maybeSingle();

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("deletePost", { id, message: error.message });
    return;
  }

  if (post?.slug) revalidatePost(post.slug);
}

export async function setPostStatus(id: string, status: "draft" | "published"): Promise<void> {
  const supabase = await requireAdmin();

  const { data: existing } = await supabase
    .from("posts")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("posts")
    .update({
      status,
      published_at:
        status === "published"
          ? (existing?.published_at ?? new Date().toISOString())
          : existing?.published_at ?? null,
    })
    .eq("id", id);

  if (error) {
    console.error("setPostStatus", { id, message: error.message });
    return;
  }

  if (existing?.slug) revalidatePost(existing.slug);
}

export async function createAuthor(fullName: string): Promise<{ error?: string; id?: string }> {
  const supabase = await requireAdmin();

  const name = fullName.trim();
  if (!name) return { error: "Enter a name." };

  let slug = slugify(name);
  const { data: clash } = await supabase.from("authors").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${randomToken(3)}`;

  const { data, error } = await supabase
    .from("authors")
    .insert({ full_name: name, slug })
    .select("id")
    .single();
  if (error) {
    console.error("createAuthor", { message: error.message });
    return { error: "Could not add that author." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/admin/authors");
  return { id: data.id };
}

export async function uploadCoverImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  return uploadBlogImage(formData, "posts");
}

/** Inline images for the rich text editor. */
export async function uploadContentImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  return uploadBlogImage(formData, "posts");
}
