import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Admin shell.
 *
 * Lives in a (dashboard) route group so /admin/login — which must render
 * before the gate — does not inherit the signed-in chrome.
 *
 * Access is enforced in src/proxy.ts before this renders, and again inside
 * every Server Action. This layout assumes staff and does not re-check.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/authors", label: "Authors" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell items={NAV}>{children}</AdminShell>;
}
