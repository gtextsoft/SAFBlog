import { getPublishedPosts } from "@/lib/queries/posts";
import { absoluteUrl, CONTACT_EMAIL, SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";

// Generated per request: a discovery surface listing a withdrawn post is
// worse than the cost of one query. See the note in app/sitemap.ts.
export const dynamic = "force-dynamic";

/** Escape the five XML entities. Unescaped `&` in a title breaks the feed. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0 feed.
 *
 * Beyond human subscribers, feeds are a primary discovery path for AI
 * crawlers: a single fetch enumerates the whole archive with dates and
 * summaries, which is cheaper for them than walking every page.
 */
export async function GET() {
  const { items: posts } = await getPublishedPosts(1, 50);

  const lastBuild = posts[0]?.updatedAt
    ? new Date(posts[0].updatedAt).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : undefined;

      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      ${post.excerpt ? `<description>${xml(post.excerpt)}</description>` : ""}
      ${post.author ? `<dc:creator>${xml(post.author.fullName)}</dc:creator>` : ""}
${post.categories.map((c) => `      <category>${xml(c.name)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(`${SITE_NAME} — Stories`)}</title>
    <link>${xml(SITE_URL)}</link>
    <description>${xml(SITE_DESCRIPTION)}</description>
    <language>${SITE_LANGUAGE}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <managingEditor>${xml(CONTACT_EMAIL)} (${xml(SITE_NAME)})</managingEditor>
    <atom:link href="${xml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
