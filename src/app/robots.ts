import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site";

/**
 * robots.txt
 *
 * Replaces the static public/robots.txt, which advertised a sitemap that did
 * not exist and pointed at the wrong domain (safoundation.org).
 *
 * AI crawlers are explicitly allowed. This is a deliberate policy decision by
 * the Foundation, not a default: it makes the blog's content eligible to be
 * cited by AI answer engines, and also available for model training. Removing
 * a bot from this list is how you opt out of both.
 *
 * Two paths are disallowed for everyone:
 *  /admin — never useful in an index, and the layout also sends noindex.
 *  /go/   — promotion click redirects. Crawling them would inflate click
 *           counts with bot traffic and waste crawl budget on redirects that
 *           lead off-site anyway.
 */

const DISALLOWED = ["/admin", "/admin/", "/go/"];

const AI_CRAWLERS = [
  // OpenAI
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google's AI products (separate from Googlebot's search crawl)
  "Google-Extended",
  // Common Crawl — feeds many downstream training sets
  "CCBot",
  // Apple
  "Applebot-Extended",
  // Meta
  "meta-externalagent",
  // ByteDance
  "Bytespider",
  // Amazon
  "Amazonbot",
  // Mistral
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED,
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
