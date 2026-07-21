"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderOpen,
  HandCoins,
  ImageIcon,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Newspaper,
  Tags,
  Users,
  UserSquare2,
  X,
} from "lucide-react";

import { SignOutButton } from "@/components/admin/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "saf-admin-sidebar-collapsed";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/admin": LayoutDashboard,
  "/admin/posts": FileText,
  "/admin/authors": UserSquare2,
  "/admin/categories": FolderOpen,
  "/admin/tags": Tags,
  "/admin/media": ImageIcon,
  "/admin/promotions": Megaphone,
  "/admin/comments": MessageSquare,
  "/admin/subscribers": Mail,
  "/admin/newsletter": Newspaper,
  "/admin/donations": HandCoins,
  "/admin/users": Users,
};

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function NavLinks({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-0.5 px-2">
      {items.map(({ href, label }) => {
        const Icon = ICONS[href] ?? FileText;
        const active = isActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "group flex min-h-10 items-center gap-3 rounded px-2.5 text-sm transition-colors duration-150",
              collapsed && "justify-center px-0",
              active
                ? "bg-primary-subtle font-medium text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={cn(collapsed && "sr-only")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Collapsible admin sidebar + top bar.
 * Desktop: expand/collapse (persisted). Mobile: off-canvas drawer.
 */
export function AdminShell({
  items,
  children,
}: {
  items: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const sidebarWidth = collapsed ? "w-16" : "w-56";

  return (
    <div className="flex min-h-dvh bg-surface-sunken">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex",
          ready ? sidebarWidth : "w-56",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border px-3",
            collapsed ? "justify-center" : "justify-between gap-2",
          )}
        >
          <Link
            href="/admin"
            className={cn("font-display text-base font-semibold", collapsed && "sr-only")}
          >
            SAF <span className="text-muted-foreground">Admin</span>
          </Link>
          {collapsed && (
            <Link href="/admin" className="font-display text-sm font-semibold" aria-label="SAF Admin">
              S
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="admin-sidebar-nav"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
          </button>
        </div>

        <div id="admin-sidebar-nav" className="flex-1 overflow-y-auto py-3">
          <NavLinks items={items} collapsed={collapsed} />
        </div>

        <div
          className={cn(
            "shrink-0 space-y-1 border-t border-border p-2",
            collapsed && "flex flex-col items-center",
          )}
        >
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            title={collapsed ? "View site" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={cn(collapsed && "sr-only")}>View site</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card shadow-overlay">
            <div className="flex h-14 items-center justify-between border-b border-border px-3">
              <Link href="/admin" className="font-display text-base font-semibold">
                SAF <span className="text-muted-foreground">Admin</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <NavLinks items={items} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-2">
              <Link
                href="/"
                className="flex min-h-10 items-center gap-3 rounded px-2.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View site
              </Link>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:px-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-sidebar"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </button>

          <p className="font-display text-sm font-semibold md:hidden">
            SAF <span className="text-muted-foreground">Admin</span>
          </p>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
