import "server-only";

import { createClient } from "@/lib/supabase/server";

export type MediaFolder = "posts" | "promotions" | "library" | "authors";

/**
 * Upload an image to the post-images bucket.
 * Returns { url } or { error } — never redirects, so client upload UIs can finish cleanly.
 */
export async function uploadBlogImage(
  formData: FormData,
  folder: MediaFolder = "library",
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to upload." };

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["admin", "editor"])
    .maybeSingle();

  if (!role) return { error: "You do not have permission to upload." };

  const file = formData.get("file");
  // Next may give a Blob (or File). Accept both.
  if (!(file instanceof Blob) || file.size === 0) {
    return { error: "Choose an image first." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "That file is not an image." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Images must be under 5 MB." };
  }

  const originalName = file instanceof File ? file.name : "image.jpg";
  const extension =
    originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage.from("post-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || `image/${extension}`,
  });

  if (error) {
    console.error("uploadBlogImage", { message: error.message, path });
    return {
      error:
        error.message.includes("Bucket not found") || error.message.includes("not found")
          ? "Storage bucket “post-images” is missing. Create it in Supabase Storage (public)."
          : `Upload failed: ${error.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(path);

  return { url: publicUrl };
}
