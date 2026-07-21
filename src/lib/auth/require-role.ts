import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type StaffRole = "admin" | "editor";

/**
 * Gate a Server Action / admin page for one or more staff roles.
 * Returns the session-aware Supabase client, the user, and all roles they hold.
 */
export async function requireRole(...allowed: StaffRole[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: rows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = (rows ?? []).map((r) => r.role as AppRole);
  const ok = allowed.some((role) => roles.includes(role));
  if (!ok) redirect("/admin/login?denied=1");

  return { supabase, user, roles };
}
