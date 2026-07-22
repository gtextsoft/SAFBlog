import { Inter, Playfair_Display } from "next/font/google";

/**
 * Self-hosted by next/font at build time. This removes the render-blocking
 * <link> to fonts.googleapis.com that the old index.html carried, and the
 * extra DNS/TLS round-trip to fonts.gstatic.com with it.
 *
 * `adjustFontFallback` (on by default) matches the fallback metrics so the
 * swap doesn't shift layout — the CLS problem the old setup had.
 */

/** Display face. Headings and brand lockups; editorial authority. */
export const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

/** UI and body face. */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});
