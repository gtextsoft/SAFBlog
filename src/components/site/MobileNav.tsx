"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";

import { NavLinks } from "@/components/site/NavLinks";

/**
 * Mobile navigation.
 *
 * Closes on route change and Escape; moves focus into the panel when opened.
 * Backdrop click dismisses. Primary destinations sit above topic taxonomy.
 */
export function MobileNav({
  primary,
  topics,
}: {
  primary: { href: string; label: string }[];
  topics: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-x-0 top-0 max-h-[min(85vh,36rem)] overflow-y-auto border-b border-border bg-background p-4 pt-[calc(1rem+env(safe-area-inset-top))] shadow-overlay"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p id={titleId} className="font-display text-sm font-semibold">
                Menu
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="mb-4 flex min-h-11 items-center gap-2 rounded border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              Search stories
            </Link>

            <NavLinks
              items={primary}
              ariaLabel="Primary"
              className="flex flex-col items-stretch"
              onNavigate={() => setOpen(false)}
            />

            <p className="mb-1 mt-5 text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
              Topics
            </p>
            <NavLinks
              items={topics}
              ariaLabel="Topics"
              className="flex flex-col items-stretch"
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
