"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Admin navigation with an explicit current-page indicator.
 *
 * `aria-current="page"` matters as much as the visual state here — the old
 * admin nav highlighted nothing, so neither sighted nor screen-reader users
 * could tell where they were.
 */
export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="hidden items-center gap-1 md:flex">
      {items.map(({ href, label }) => {
        // /admin must match exactly or it would light up on every subpage.
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded px-3 text-sm transition-colors duration-150",
              active
                ? "bg-primary-subtle font-medium text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
