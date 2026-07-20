"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { NavLinks } from "@/components/site/NavLinks";

/**
 * Mobile navigation.
 *
 * The previous implementation was a bare conditional render: it never closed
 * on route change, ignored Escape, trapped no focus and exposed no
 * `aria-expanded`. This handles all four.
 */
export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on navigation, otherwise the panel covers the page you just opened.
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
    // Move focus into the panel so a keyboard user isn't left behind it.
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
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
        <div
          id="mobile-nav"
          ref={panelRef}
          className="absolute inset-x-0 top-16 border-b border-border bg-background p-4 shadow-overlay"
        >
          <NavLinks items={items} className="flex flex-col items-stretch" onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
