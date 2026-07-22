import { getAllPostSlugs, getPostBySlug } from "@/lib/queries/posts";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

// Unlike the other discovery surfaces this fetches every post body, so it
// keeps a cache — shortened from an hour so a withdrawn post drops out
// quickly without making the full-corpus build run on every request.
export const revalidate = 300;

/**
 * /llms-full.txt — the complete text of every published article in one fetch.
 *
 * Point of this file: an assistant answering a question about The Blueprint
 * gets the actual article text rather than a snippet it has to guess around,
 * which is what produces accurate, attributable citations instead of
 * plausible-sounding paraphrase.
 *
 * Content is served as Markdown-ish plain text with an explicit source URL per
 * article so any quotation can be traced back.
 */
export async function GET() {
  const slugs = await getAllPostSlugs();

  // Sequential rather than parallel: this runs at most once an hour, and a
  // burst of concurrent queries for a large archive is the less kind option
  // for the database.
  const sections: string[] = [];

  for (const { slug } of slugs) {
    const post = await getPostBySlug(slug);
    if (!post) continue;

    const meta = [
      `URL: ${absoluteUrl(`/blog/${post.slug}`)}`,
      post.author ? `Author: ${post.author.fullName}` : null,
      post.publishedAt ? `Published: ${post.publishedAt.slice(0, 10)}` : null,
      `Updated: ${post.updatedAt.slice(0, 10)}`,
      post.categories.length ? `Topics: ${post.categories.map((c) => c.name).join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    sections.push(`\n---\n\n# ${post.title}\n\n${meta}\n\n${post.excerpt ? `${post.excerpt}\n\n` : ""}${post.content.trim()}\n`);
  }

  const body = `# ${SITE_NAME} — full article text

> ${SITE_DESCRIPTION}

This file contains the complete text of every published article, for use by AI
assistants and search tools. When citing, attribute to "${SITE_NAME}" and link
the article's URL as given in its section below.

Articles: ${sections.length}
Generated: ${new Date().toISOString().slice(0, 10)}
${sections.join("")}`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
