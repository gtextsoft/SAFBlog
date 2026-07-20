import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaxonomyArchive } from "@/components/blog/TaxonomyArchive";
import { POSTS_PER_PAGE } from "@/lib/queries/posts";
import { getPostsByTag, getTagBySlug } from "@/lib/queries/taxonomy";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) return { title: "Tag not found", robots: { index: false, follow: false } };

  return {
    title: tag.name,
    description: `Stories tagged ${tag.name}.`,
    alternates: { canonical: `/tag/${tag.slug}` },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const tag = await getTagBySlug(slug);

  if (!tag) notFound();

  const pageNumber = Math.max(1, Number(page) || 1);
  const results = await getPostsByTag(tag.id, pageNumber, POSTS_PER_PAGE);

  return (
    <TaxonomyArchive
      kind="Tag"
      name={tag.name}
      results={results}
      basePath={`/tag/${tag.slug}`}
    />
  );
}
