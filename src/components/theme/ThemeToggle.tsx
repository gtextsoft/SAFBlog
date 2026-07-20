"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

/**
 * Three-state theme control.
 *
 * A segmented control rather than a two-way switch, because "follow my
 * system" is a distinct choice from "always light" — a binary toggle silently
 * discards it the first time the user touches the control.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The resolved theme is unknowable on the server, so the active state can't
  // be rendered until after mount. Reserve the exact footprint meanwhile so
  // nothing shifts when it appears.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn("h-9 w-[108px] rounded border border-border", className)} aria-hidden />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("inline-flex rounded border border-border p-0.5", className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-sm transition-colors duration-150",
              active
                ? "bg-primary-subtle text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
