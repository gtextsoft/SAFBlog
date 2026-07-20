import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { jsonLdGraph, organisationSchema, websiteSchema } from "@/lib/seo/schema";
import { SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/site";

import { inter, newsreader } from "./fonts";

import "@/index.css";

/**
 * Root metadata. `metadataBase` is what lets every nested route emit relative
 * OG/canonical URLs that resolve against the real origin — the thing the old
 * `window.location.origin` approach could never get right at build time.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} — Blog` }],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={SITE_LANGUAGE}
      className={`${inter.variable} ${newsreader.variable}`}
      // next-themes writes the theme class onto <html> before paint, which
      // React would otherwise flag as a hydration mismatch.
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground">
        {/* Site-wide entities. Nested pages reference these by @id rather
            than repeating the organisation on every route. */}
        <JsonLd data={jsonLdGraph(organisationSchema(), websiteSchema())} />

        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-card focus:px-4 focus:py-2 focus:shadow-overlay"
          >
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
