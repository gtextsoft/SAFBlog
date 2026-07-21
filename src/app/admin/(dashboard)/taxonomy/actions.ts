"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { slugify } from "@/lib/slugify";

/**
 * Category and tag actions.
 *
 * Every action reports its outcome rather than returning silently. The
 * previous version did `if (!name) return;` and swallowed database errors into
 * console.error, so submitting an empty name — or hitting a duplicate slug, or
 * trying to delete a term still in use — looked identical to success: nothing
 * happened and nothing was said.
 */
async function requireAdmin() {
  const { supabase } = await requireRole("admin", "editor");
  return supabase;
}

export interface TermState {
  error?: string;
  success?: string;
}

type Supabase = Awaited<ReturnType<typeof requireAdmin>>;
type Table = "categories" | "tags";

/** Parse and validate the shared fields. Returns a message on failure. */
function readFields(formData: FormData): { name: string; slug: string; description: string } | string {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "Enter a name.";
  if (name.length > 80) return "Name must be 80 characters or fewer.";

  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (!slug) return "That name produces an empty URL. Add letters or numbers.";

  return { name, slug, description: String(formData.get("description") ?? "").trim() };
}

/**
 * Check the slug before writing, so a collision reports which term owns it
 * instead of surfacing a raw unique-constraint violation.
 */
async function slugTaken(
  supabase: Supabase,
  table: Table,
  slug: string,
  exceptId?: string,
): Promise<string | null> {
  let query = supabase.from(table).select("name").eq("slug", slug);
  if (exceptId) query = query.neq("id", exceptId);

  const { data } = await query.maybeSingle();
  return data ? `The URL “${slug}” is already used by “${data.name}”.` : null;
}

function revalidateCategories(slug?: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/category/${slug}`);
}

function revalidateTags(slug?: string) {
  revalidatePath("/admin/tags");
  revalidatePath("/admin/posts");
  revalidatePath("/tag/[slug]", "page");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/tag/${slug}`);
}

/* ---------------------------------------------------------------- categories */

export async function createCategory(_prev: TermState, formData: FormData): Promise<TermState> {
  const supabase = await requireAdmin();

  const fields = readFields(formData);
  if (typeof fields === "string") return { error: fields };

  const taken = await slugTaken(supabase, "categories", fields.slug);
  if (taken) return { error: taken };

  const { error } = await supabase.from("categories").insert({
    name: fields.name,
    slug: fields.slug,
    description: fields.description || null,
  });

  if (error) {
    console.error("createCategory", error.message);
    return { error: "Could not add that category. Please try again." };
  }

  revalidateCategories(fields.slug);
  return { success: `Added “${fields.name}”.` };
}

export async function updateCategory(
  id: string,
  _prev: TermState,
  formData: FormData,
): Promise<TermState> {
  const supabase = await requireAdmin();

  const fields = readFields(formData);
  if (typeof fields === "string") return { error: fields };

  const taken = await slugTaken(supabase, "categories", fields.slug, id);
  if (taken) return { error: taken };

  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("categories")
    .update({ name: fields.name, slug: fields.slug, description: fields.description || null })
    .eq("id", id);

  if (error) {
    console.error("updateCategory", error.message);
    return { error: "Could not save that category. Please try again." };
  }

  // Purge the old URL too, or it keeps serving until its cache expires.
  if (existing?.slug && existing.slug !== fields.slug) revalidateCategories(existing.slug);
  revalidateCategories(fields.slug);
  return { success: "Saved." };
}

export async function deleteCategory(id: string): Promise<TermState> {
  const supabase = await requireAdmin();

  const { count } = await supabase
    .from("post_categories")
    .select("post_id", { count: "exact", head: true })
    .eq("category_id", id);

  // Refusing is right — deleting would strip the category from live posts.
  // Saying why is the part that was missing.
  if ((count ?? 0) > 0) {
    return {
      error: `Still used by ${count} ${count === 1 ? "post" : "posts"}. Remove it from them first.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("deleteCategory", error.message);
    return { error: "Could not delete that category." };
  }

  revalidateCategories();
  return { success: "Deleted." };
}

/* --------------------------------------------------------------------- tags */

export async function createTag(_prev: TermState, formData: FormData): Promise<TermState> {
  const supabase = await requireAdmin();

  const fields = readFields(formData);
  if (typeof fields === "string") return { error: fields };

  const taken = await slugTaken(supabase, "tags", fields.slug);
  if (taken) return { error: taken };

  const { error } = await supabase.from("tags").insert({ name: fields.name, slug: fields.slug });
  if (error) {
    console.error("createTag", error.message);
    return { error: "Could not add that tag. Please try again." };
  }

  revalidateTags(fields.slug);
  return { success: `Added “${fields.name}”.` };
}

export async function updateTag(
  id: string,
  _prev: TermState,
  formData: FormData,
): Promise<TermState> {
  const supabase = await requireAdmin();

  const fields = readFields(formData);
  if (typeof fields === "string") return { error: fields };

  const taken = await slugTaken(supabase, "tags", fields.slug, id);
  if (taken) return { error: taken };

  const { data: existing } = await supabase.from("tags").select("slug").eq("id", id).maybeSingle();

  const { error } = await supabase
    .from("tags")
    .update({ name: fields.name, slug: fields.slug })
    .eq("id", id);

  if (error) {
    console.error("updateTag", error.message);
    return { error: "Could not save that tag. Please try again." };
  }

  if (existing?.slug && existing.slug !== fields.slug) revalidateTags(existing.slug);
  revalidateTags(fields.slug);
  return { success: "Saved." };
}

export async function deleteTag(id: string): Promise<TermState> {
  const supabase = await requireAdmin();

  const { count } = await supabase
    .from("post_tags")
    .select("post_id", { count: "exact", head: true })
    .eq("tag_id", id);

  if ((count ?? 0) > 0) {
    return {
      error: `Still used by ${count} ${count === 1 ? "post" : "posts"}. Remove it from them first.`,
    };
  }

  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) {
    console.error("deleteTag", error.message);
    return { error: "Could not delete that tag." };
  }

  revalidateTags();
  return { success: "Deleted." };
}

/* ------------------------------------------- inline create from PostEditor */

export async function createCategoryInline(name: string): Promise<{ id?: string; error?: string }> {
  const supabase = await requireAdmin();

  const trimmed = name.trim();
  if (!trimmed) return { error: "Enter a name." };

  const slug = slugify(trimmed);
  const taken = await slugTaken(supabase, "categories", slug);
  if (taken) return { error: taken };

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: trimmed, slug })
    .select("id")
    .single();

  if (error) return { error: "Could not add that category." };

  revalidateCategories(slug);
  return { id: data.id };
}

export async function createTagInline(name: string): Promise<{ id?: string; error?: string }> {
  const supabase = await requireAdmin();

  const trimmed = name.trim();
  if (!trimmed) return { error: "Enter a name." };

  const slug = slugify(trimmed);
  const taken = await slugTaken(supabase, "tags", slug);
  if (taken) return { error: taken };

  const { data, error } = await supabase
    .from("tags")
    .insert({ name: trimmed, slug })
    .select("id")
    .single();

  if (error) return { error: "Could not add that tag." };

  revalidateTags(slug);
  return { id: data.id };
}
