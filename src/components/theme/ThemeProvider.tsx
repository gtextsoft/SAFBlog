"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * Theme provider.
 *
 * The old app defined a full set of `.dark` tokens in CSS but never wired a
 * toggle to anything, so dark mode was unreachable. next-themes writes the
 * class onto <html> from an inline script before first paint, which is what
 * prevents the flash of the wrong theme on load.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Skip transitions during the switch itself; animating every colour on
      // the page at once reads as jank rather than polish.
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
