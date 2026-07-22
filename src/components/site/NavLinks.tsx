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
  ariaLabel = "Main",
}: {
  items: { href: string; label: string }[];
  className?: string;
  onNavigate?: () => void;
  ariaLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className={cn("items-center gap-1", className)}>
      {items.map(({ href, label }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 items-center px-2.5 text-[0.8125rem] tracking-wide transition-colors duration-150",
              active
                ? "font-medium text-foreground underline decoration-accent decoration-2 underline-offset-[0.55rem]"
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
