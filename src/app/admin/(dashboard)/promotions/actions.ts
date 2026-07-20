"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for promotions.
 *
 * Every action re-checks the admin role. The proxy already gates /admin, but
 * a Server Action is a public POST endpoint reachable by its own id — it is
 * not protected by whatever guarded the page that rendered the form. Relying
 * on the proxy alone would leave these writable by any authenticated user.
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

const PromotionSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    body: z.string().trim().max(400).optional().or(z.literal("")),
    sponsorName: z.string().trim().min(1, "Sponsor name is required").max(80),
    // http(s) only — a javascript: or data: URL here would execute in the
    // reader's browser. The DB has a matching CHECK constraint as a backstop.
    targetUrl: z
      .string()
      .trim()
      .url("Enter a full URL including https://")
      .refine((u) => /^https?:\/\//i.test(u), "Link must start with http:// or https://"),
    ctaLabel: z.string().trim().min(1).max(40),
    imageUrl: z.string().trim().url().optional().or(z.literal("")),
    placement: z.enum(["sidebar", "in_feed", "in_article"]),
    status: z.enum(["draft", "active", "paused", "ended"]),
    priority: z.coerce.number().int().min(0).max(100),
    startsAt: z.string().optional().or(z.literal("")),
    endsAt: z.string().optional().or(z.literal("")),
  })
  .refine(
    (v) => !v.startsAt || !v.endsAt || new Date(v.endsAt) > new Date(v.startsAt),
    { message: "End date must be after the start date", path: ["endsAt"] },
  );

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Purge every cached surface a promotion can appear on.
 *
 * Public pages are prerendered with `revalidate = 3600`, and Next has no way
 * to know the promotions table changed — so without this a newly published
 * placement stays invisible for up to an hour, which reads as "the ad system
 * is broken".
 *
 * The `"page"` variant matches the route pattern, invalidating every generated
 * page under it (all posts, all categories, all tags) rather than just one.
 */
function revalidatePromotionSurfaces() {
  revalidatePath("/admin/promotions");

  revalidatePath("/"); // home — sidebar slot
  revalidatePath("/blog"); // index — in-feed and sidebar slots
  revalidatePath("/blog/[slug]", "page"); // articles — in-article and sidebar
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
}

function parse(formData: FormData) {
  return PromotionSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    sponsorName: formData.get("sponsorName"),
    targetUrl: formData.get("targetUrl"),
    ctaLabel: formData.get("ctaLabel"),
    imageUrl: formData.get("imageUrl"),
    placement: formData.get("placement"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
}

function toRow(v: z.infer<typeof PromotionSchema>) {
  return {
    title: v.title,
    body: v.body || null,
    sponsor_name: v.sponsorName,
    target_url: v.targetUrl,
    cta_label: v.ctaLabel,
    image_url: v.imageUrl || null,
    placement: v.placement,
    status: v.status,
    priority: v.priority,
    // datetime-local gives a value with no zone; treat it as the admin's
    // local time and store the resulting instant.
    starts_at: v.startsAt ? new Date(v.startsAt).toISOString() : null,
    ends_at: v.endsAt ? new Date(v.endsAt).toISOString() : null,
  };
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createPromotion(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { error } = await supabase.from("promotions").insert(toRow(parsed.data));

  if (error) {
    console.error("createPromotion", { message: error.message });
    return { error: "Could not save this promotion. Please try again." };
  }

  revalidatePromotionSurfaces();
  redirect("/admin/promotions?created=1");
}

export async function updatePromotion(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { error } = await supabase.from("promotions").update(toRow(parsed.data)).eq("id", id);

  if (error) {
    console.error("updatePromotion", { id, message: error.message });
    return { error: "Could not save this promotion. Please try again." };
  }

  revalidatePromotionSurfaces();
  redirect("/admin/promotions?saved=1");
}

export async function deletePromotion(id: string): Promise<void> {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("promotions").delete().eq("id", id);

  if (error) {
    console.error("deletePromotion", { id, message: error.message });
  }

  revalidatePromotionSurfaces();
}

/**
 * Upload promotion artwork.
 *
 * Runs server-side under the admin session, so the storage bucket needs no
 * anonymous write access. Images stored here are served from our own Supabase
 * host, which means they go through next/image optimisation — a pasted
 * third-party URL cannot.
 */
export async function uploadPromotionImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const supabase = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  if (!file.type.startsWith("image/")) return { error: "That file is not an image." };
  if (file.size > 5 * 1024 * 1024) return { error: "Images must be under 5 MB." };

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `promotions/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  if (error) {
    console.error("uploadPromotionImage", { message: error.message });
    return { error: "Upload failed. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(path);

  return { url: publicUrl };
}

/** Quick pause/resume from the list, without opening the editor. */
export async function setPromotionStatus(
  id: string,
  status: "active" | "paused",
): Promise<void> {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("promotions").update({ status }).eq("id", id);

  if (error) {
    console.error("setPromotionStatus", { id, status, message: error.message });
  }

  revalidatePromotionSurfaces();
}
