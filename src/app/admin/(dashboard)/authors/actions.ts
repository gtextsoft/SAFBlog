"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { slugify } from "@/lib/slugify";

async function requireAdmin() {
  const { supabase } = await requireRole("admin", "editor");
  return supabase;
}

export interface AuthorActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const AuthorSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
  twitterUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
});

function parse(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "");
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(fullName);

  return AuthorSchema.safeParse({
    fullName,
    slug,
    role: formData.get("role"),
    bio: formData.get("bio"),
    avatarUrl: formData.get("avatarUrl"),
    twitterUrl: formData.get("twitterUrl"),
    linkedinUrl: formData.get("linkedinUrl"),
    websiteUrl: formData.get("websiteUrl"),
  });
}

export async function createAuthorRecord(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const supabase = await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    return { fieldErrors };
  }
  const v = parsed.data;

  const { error } = await supabase.from("authors").insert({
    full_name: v.fullName,
    slug: v.slug,
    role: v.role || null,
    bio: v.bio || null,
    avatar_url: v.avatarUrl || null,
    twitter_url: v.twitterUrl || null,
    linkedin_url: v.linkedinUrl || null,
    website_url: v.websiteUrl || null,
  });

  if (error) {
    if (error.code === "23505") return { fieldErrors: { slug: "That slug is taken." } };
    return { error: error.message };
  }

  revalidatePath("/admin/authors");
  revalidatePath("/admin/posts");
  revalidatePath("/author/[slug]", "page");
  redirect("/admin/authors?created=1");
}

export async function updateAuthorRecord(
  id: string,
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const supabase = await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    return { fieldErrors };
  }
  const v = parsed.data;

  const { error } = await supabase
    .from("authors")
    .update({
      full_name: v.fullName,
      slug: v.slug,
      role: v.role || null,
      bio: v.bio || null,
      avatar_url: v.avatarUrl || null,
      twitter_url: v.twitterUrl || null,
      linkedin_url: v.linkedinUrl || null,
      website_url: v.websiteUrl || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { fieldErrors: { slug: "That slug is taken." } };
    return { error: error.message };
  }

  revalidatePath("/admin/authors");
  revalidatePath(`/author/${v.slug}`);
  revalidatePath("/admin/posts");
  redirect("/admin/authors?saved=1");
}

export async function deleteAuthor(id: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();

  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", id);

  if ((count ?? 0) > 0) {
    return { error: "Reassign or delete this author's posts before removing them." };
  }

  const { error } = await supabase.from("authors").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/authors");
  return {};
}
