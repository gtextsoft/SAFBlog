import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Admin shell.
 *
 * Lives in a (dashboard) route group so /admin/login — which must render
 * before the gate — does not inherit the signed-in chrome.
 *
 * Access is enforced in src/proxy.ts before this renders, and again inside
 * every Server Action. This layout assumes an admin and does not re-check.
 */
export const metadata: Metadata = {
  title: "Admin",
  // Belt and braces alongside the Disallow in robots: no admin URL should
  // ever surface in an index, even if one leaks into a link somewhere.
  robots: { index: false, follow: false, nocache: true },
};

// Only routes that exist — a nav entry that 404s is worse than a missing one.
const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/promotions", label: "Promotions" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-sunken">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link href="/admin" className="font-display text-lg font-semibold">
            SAF <span className="text-muted-foreground">Admin</span>
          </Link>

          <AdminNav items={NAV} />

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="hidden min-h-11 items-center px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline-flex"
            >
              View site
            </Link>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
