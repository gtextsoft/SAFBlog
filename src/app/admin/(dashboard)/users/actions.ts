"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";

const AddRoleSchema = z.object({
  userId: z.string().uuid("Enter a valid user UUID."),
  role: z.enum(["admin", "editor", "viewer"]),
});

export interface UsersState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function addUserRole(
  _prev: UsersState,
  formData: FormData,
): Promise<UsersState> {
  const { supabase } = await requireRole("admin");

  const parsed = AddRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { error } = await supabase.from("user_roles").insert({
    user_id: parsed.data.userId,
    role: parsed.data.role,
  });

  if (error) {
    if (error.code === "23505") {
      return { status: "error", message: "That user already has this role." };
    }
    console.error("addUserRole", error.message);
    return { status: "error", message: "Could not assign role." };
  }

  revalidatePath("/admin/users");
  return { status: "success", message: "Role assigned." };
}

export async function removeUserRole(id: string) {
  const { supabase } = await requireRole("admin");
  await supabase.from("user_roles").delete().eq("id", id);
  revalidatePath("/admin/users");
}
