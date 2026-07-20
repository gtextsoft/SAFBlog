"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for posts.
 *
 * As with promotions, each action re-verifies the admin role: a Server Action
 * is a public POST endpoint addressable by its own id, so it is not protected
 * by whatever gated the page that rendered the form.
 */
async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) redirect("/admin/login?denied=1");

  return supabase;
}

export interface PostActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

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
  status: z.enum(["draft", "published"]),
  categoryIds: z.array(z.string().uuid()),
  tagIds: z.array(z.string().uuid()),
});

function parse(formData: FormData) {
  return PostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl"),
    authorId: formData.get("authorId"),
    status: formData.get("status"),
    categoryIds: formData.getAll("categoryIds").map(String).filter(Boolean),
    tagIds: formData.getAll("tagIds").map(String).filter(Boolean),
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

/**
 * Replace a post's categories and tags.
 *
 * The old editor deleted every row then inserted the new set with no
 * safeguard, so a failed insert left the post with no taxonomy at all. Here
 * the inserts run first and the delete only removes rows that are no longer
 * wanted — if an insert fails, the previous associations are still intact.
 */
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

  // Now drop what is no longer selected. Deleting after the inserts succeed
  // means an error above never leaves the post bare.
  const deleteCategories =
    categoryIds.length > 0
      ? supabase.from("post_categories").delete().eq("post_id", postId).not("category_id", "in", `(${categoryIds.join(",")})`)
      : supabase.from("post_categories").delete().eq("post_id", postId);

  const deleteTags =
    tagIds.length > 0
      ? supabase.from("post_tags").delete().eq("post_id", postId).not("tag_id", "in", `(${tagIds.join(",")})`)
      : supabase.from("post_tags").delete().eq("post_id", postId);

  const [catRes, tagRes] = await Promise.all([deleteCategories, deleteTags]);
  if (catRes.error) return catRes.error.message;
  if (tagRes.error) return tagRes.error.message;

  return null;
}

/**
 * Purge every cached surface a post appears on.
 *
 * Includes the taxonomy archives: publishing into a category changes that
 * category's page and its post count in every sidebar, neither of which Next
 * can infer. The `"page"` variant matches the route pattern, so all generated
 * category and tag pages are invalidated rather than one guessed slug.
 */
function revalidatePost(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");

  // Discovery surfaces — a post missing from these is invisible to crawlers
  // and AI answer engines until the hour is up.
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

  // Check the slug up front so the editor can point at the field, instead of
  // surfacing a raw unique-constraint error after the fact.
  const { data: clash } = await supabase.from("posts").select("id").eq("slug", v.slug).maybeSingle();
  if (clash) {
    return { fieldErrors: { slug: "A post with this URL already exists. Choose another." } };
  }

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
      // Stamp the publication date the first time it goes live.
      published_at: v.status === "published" ? new Date().toISOString() : null,
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
    .select("published_at, slug")
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
      // Preserve the original publication date across edits; only set it if
      // this is the transition from draft to published.
      published_at:
        v.status === "published"
          ? (existing?.published_at ?? new Date().toISOString())
          : existing?.published_at ?? null,
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

  // Revalidate the old slug too, or the previous URL keeps serving stale HTML.
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

/** Publish/unpublish from the list without opening the editor. */
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

/** Create an author inline, so the editor is not blocked by a missing record. */
export async function createAuthor(fullName: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();

  const name = fullName.trim();
  if (!name) return { error: "Enter a name." };

  const { error } = await supabase.from("authors").insert({ full_name: name });
  if (error) {
    console.error("createAuthor", { message: error.message });
    return { error: "Could not add that author." };
  }

  revalidatePath("/admin/posts");
  return {};
}

/** Upload a cover image. Runs server-side so the bucket needs no anon write. */
export async function uploadCoverImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  if (!file.type.startsWith("image/")) return { error: "That file is not an image." };
  if (file.size > 5 * 1024 * 1024) return { error: "Images must be under 5 MB." };

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  if (error) {
    console.error("uploadCoverImage", { message: error.message });
    return { error: "Upload failed. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(path);

  return { url: publicUrl };
}
