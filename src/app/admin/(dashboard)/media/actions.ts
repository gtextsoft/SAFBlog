"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { uploadBlogImage, type MediaFolder } from "@/lib/storage/upload";

export async function uploadImage(
  formData: FormData,
  folder: MediaFolder = "library",
): Promise<{ url?: string; error?: string }> {
  const result = await uploadBlogImage(formData, folder);
  if (result.url) revalidatePath("/admin/media");
  return result;
}

export async function listMedia(folder = "", limit = 48) {
  const { supabase } = await requireRole("admin", "editor");
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
  const { supabase } = await requireRole("admin", "editor");
  const { error } = await supabase.storage.from("post-images").remove([path]);
  if (error) return { error: error.message };
  revalidatePath("/admin/media");
  return {};
}
