import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/blog/Pagination";
import { PostCard } from "@/components/blog/PostCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getAuthorBySlug, getPostsByAuthor } from "@/lib/queries/authors";
import { POSTS_PER_PAGE } from "@/lib/queries/posts";
import { breadcrumbSchema, jsonLdGraph } from "@/lib/seo/schema";
import { absoluteUrl, SITE_LANGUAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Author not found", robots: { index: false } };

  return {
    title: author.fullName,
    description: author.bio || `Stories by ${author.fullName} at the ${SITE_NAME}.`,
    alternates: { canonical: `/author/${author.slug}` },
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  const author = await getAuthorBySlug(slug);
  if (!author || !author.slug) notFound();

  const results = await getPostsByAuthor(author.id, pageNumber, POSTS_PER_PAGE);
  const basePath = `/author/${author.slug}`;

  const sameAs = [author.twitterUrl, author.linkedinUrl, author.websiteUrl].filter(
    Boolean,
  ) as string[];

  const personSchema = {
    "@type": "Person",
    "@id": `${SITE_URL}/author/${author.slug}#person`,
    name: author.fullName,
    url: absoluteUrl(basePath),
    ...(author.role && { jobTitle: author.role }),
    ...(author.bio && { description: author.bio }),
    ...(author.avatarUrl && { image: author.avatarUrl }),
    ...(sameAs.length > 0 && { sameAs }),
    worksFor: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          personSchema,
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Stories", url: "/blog" },
            { name: author.fullName, url: basePath },
          ]),
        )}
      />

      <SiteHeader />

      <main id="main">
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {author.avatarUrl && (
                <Image
                  src={author.avatarUrl}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Author</p>
                <h1 className="mt-2 text-4xl md:text-5xl">{author.fullName}</h1>
                {author.role && (
                  <p className="mt-2 text-muted-foreground">{author.role}</p>
                )}
                {author.bio && (
                  <p className="mt-4 max-w-2xl text-lg text-muted-foreground" lang={SITE_LANGUAGE}>
                    {author.bio}
                  </p>
                )}
                {sameAs.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-3 text-sm">
                    {sameAs.map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="me noopener"
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {new URL(url).hostname.replace(/^www\./, "")}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          {results.items.length === 0 ? (
            <p className="text-muted-foreground">No published stories yet.</p>
          ) : (
            <>
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {results.items.map((post, i) => (
                  <PostCard key={post.id} post={post} priority={i < 3} />
                ))}
              </div>
              <Pagination page={pageNumber} totalPages={results.totalPages} basePath={basePath} />
            </>
          )}
          <p className="mt-10 text-sm">
            <Link href="/blog" className="text-primary underline-offset-2 hover:underline">
              All stories
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
