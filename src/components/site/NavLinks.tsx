"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Primary navigation.
 *
 * Marks the current section with `aria-current` as well as colour, so the
 * location is conveyed by more than hue alone.
 */
export function NavLinks({
  items,
  className,
  onNavigate,
}: {
  items: { href: string; label: string }[];
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn("items-center gap-1", className)}>
      {items.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded px-3 text-sm transition-colors duration-150",
              active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
