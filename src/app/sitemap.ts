import type { MetadataRoute } from "next";

import { getAllPostSlugs } from "@/lib/queries/posts";
import { getCategoriesWithCounts, getTagsWithCounts } from "@/lib/queries/taxonomy";
import { absoluteUrl } from "@/lib/seo/site";

// Regenerated hourly alongside the content it lists.
export const revalidate = 3600;

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
  const [posts, categories, tags] = await Promise.all([
    getAllPostSlugs(),
    getCategoriesWithCounts(),
    getTagsWithCounts(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: absoluteUrl("/newsletter"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map(({ slug, updatedAt }) => ({
    url: absoluteUrl(`/blog/${slug}`),
    // Real lastModified from the row, so a re-crawl is triggered by an actual
    // edit rather than by every build.
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

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes];
}
