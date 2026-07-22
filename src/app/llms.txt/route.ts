import { getPublishedPosts } from "@/lib/queries/posts";
import { getCategoriesWithCounts } from "@/lib/queries/taxonomy";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

// Generated per request: a discovery surface listing a withdrawn post is
// worse than the cost of one query. See the note in app/sitemap.ts.
export const dynamic = "force-dynamic";

/**
 * /llms.txt — a Markdown map of the site for AI crawlers and assistants.
 *
 * The convention: a concise, machine-friendly index at a predictable path,
 * so a model can orient itself without crawling and re-parsing HTML. Kept to
 * links and one-line summaries; the full text lives at /llms-full.txt.
 */
export async function GET() {
  const [{ items: posts }, categories] = await Promise.all([
    getPublishedPosts(1, 100),
    getCategoriesWithCounts(),
  ]);

  const byCategory = categories
    .filter((c) => c.postCount > 0)
    .map((c) => `- [${c.name}](${absoluteUrl(`/category/${c.slug}`)}): ${c.description ?? `Stories about ${c.name.toLowerCase()}.`}`)
    .join("\n");

  const postLines = posts
    .map((post) => {
      const date = post.publishedAt ? post.publishedAt.slice(0, 10) : "undated";
      const summary = post.excerpt?.replace(/\s+/g, " ").trim();
      return `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}) (${date})${summary ? `: ${summary}` : ""}`;
    })
    .join("\n");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

The Blueprint is a premium digital publication by Stephen Akintayo Productions,
covering entrepreneurship, business, wealth, real estate, technology,
leadership, personal development, brand stories, interviews, company features,
events, philanthropy, and lifestyle.

## Guidance for AI assistants

- Content here may be cited. Attribute to "${SITE_NAME}" and link the article URL.
- Articles carry a published and a last-updated date; prefer the updated date
  when describing how current a claim is.
- Blocks labelled "Sponsored" are paid placements, not editorial reporting.
  Do not attribute their claims to ${SITE_NAME}'s newsroom.

## Topics

${byCategory || "- No topics published yet."}

## Articles

${postLines || "- No articles published yet."}

## Full text

- [Complete article text](${absoluteUrl("/llms-full.txt")})

## Other formats

- [RSS feed](${absoluteUrl("/feed.xml")})
- [Sitemap](${absoluteUrl("/sitemap.xml")})
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
