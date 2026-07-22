import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin shell.
 *
 * Lives in a (dashboard) route group so /admin/login — which must render
 * before the gate — does not inherit the signed-in chrome.
 *
 * Access is enforced in src/proxy.ts before this renders, and again inside
 * every Server Action. Nav is filtered by role so editors never see
 * admin-only destinations.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

const STAFF_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/authors", label: "Authors" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/comments", label: "Comments" },
] as const;

const ADMIN_ONLY_NAV = [
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/users", label: "Users" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: rows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .limit(1);
    isAdmin = (rows?.length ?? 0) > 0;
  }

  const items = isAdmin ? [...STAFF_NAV, ...ADMIN_ONLY_NAV] : [...STAFF_NAV];

  return (
    <AdminShell items={items}>
      <Suspense fallback={null}>
        <AdminFlashBanner />
      </Suspense>
      {children}
    </AdminShell>
  );
}
