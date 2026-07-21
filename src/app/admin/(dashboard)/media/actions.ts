"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";

async function requireAdmin() {
  const { supabase } = await requireRole("admin", "editor");
  return supabase;
}

export type MediaFolder = "posts" | "promotions" | "library" | "authors";

export async function uploadImage(
  formData: FormData,
  folder: MediaFolder = "library",
): Promise<{ url?: string; error?: string }> {
  const supabase = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  if (!file.type.startsWith("image/")) return { error: "That file is not an image." };
  if (file.size > 5 * 1024 * 1024) return { error: "Images must be under 5 MB." };

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  if (error) {
    console.error("uploadImage", { message: error.message });
    return { error: "Upload failed. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(path);

  revalidatePath("/admin/media");
  return { url: publicUrl };
}

export async function listMedia(folder = "", limit = 48) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.storage.from("post-images").list(folder || undefined, {
    limit,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    console.error("listMedia", error.message);
    return [];
  }

  return (data ?? [])
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => {
      const path = folder ? `${folder}/${f.name}` : f.name;
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(path);
      return { name: f.name, path, url: publicUrl, createdAt: f.created_at };
    });
}

export async function deleteMedia(path: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();
  const { error } = await supabase.storage.from("post-images").remove([path]);
  if (error) return { error: error.message };
  revalidatePath("/admin/media");
  return {};
}
