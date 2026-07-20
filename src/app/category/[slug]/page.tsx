import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaxonomyArchive } from "@/components/blog/TaxonomyArchive";
import { POSTS_PER_PAGE } from "@/lib/queries/posts";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/queries/taxonomy";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Topic not found", robots: { index: false, follow: false } };

  return {
    title: category.name,
    description: category.description ?? `Stories filed under ${category.name}.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  // Real 404 rather than the old soft-404 that returned HTTP 200.
  if (!category) notFound();

  const pageNumber = Math.max(1, Number(page) || 1);
  const results = await getPostsByCategory(category.id, pageNumber, POSTS_PER_PAGE);

  return (
    <TaxonomyArchive
      kind="Topic"
      name={category.name}
      description={category.description}
      results={results}
      basePath={`/category/${category.slug}`}
    />
  );
}
