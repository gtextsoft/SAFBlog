import type { MetadataRoute } from "next";

import { getAllPostSlugs } from "@/lib/queries/posts";
import { getAllAuthors } from "@/lib/queries/authors";
import { getCategoriesWithCounts, getTagsWithCounts } from "@/lib/queries/taxonomy";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Always generated fresh.
 *
 * This was cached for an hour, and an unpublished post left the sitemap
 * advertising a URL that returned 404 — which Search Console reports as
 * "Submitted URL not found". Revalidation from the admin covers edits made
 * there, but not ones made directly in Supabase or via any other tool, so
 * the cache cannot be trusted to be correct. A sitemap is a handful of rows
 * and crawlers request it rarely; correctness is worth more than the cache.
 */
export const dynamic = "force-dynamic";

/**
 * sitemap.xml
 *
 * The previous implementation was a React route that built an XML string,
 * created a Blob, logged a note to the console and returned null — nothing was
 * ever served, while robots.txt advertised the URL.
 *
 * Empty taxonomy terms are omitted: a sitemap entry for a category with no
 * posts sends crawlers to a page with nothing on it, which is wasted crawl
 * budget and a thin-content signal.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags, authors] = await Promise.all([
    getAllPostSlugs(),
    getCategoriesWithCounts(),
    getTagsWithCounts(),
    getAllAuthors(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/search"), lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: absoluteUrl("/newsletter"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/donate"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map(({ slug, updatedAt }) => ({
    url: absoluteUrl(`/blog/${slug}`),
    lastModified: new Date(updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => category.postCount > 0)
    .map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const tagRoutes: MetadataRoute.Sitemap = tags
    .filter((tag) => tag.postCount > 0)
    .map((tag) => ({
      url: absoluteUrl(`/tag/${tag.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    }));

  const authorRoutes: MetadataRoute.Sitemap = authors
    .filter((a) => a.slug)
    .map((a) => ({
      url: absoluteUrl(`/author/${a.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes, ...authorRoutes];
}
