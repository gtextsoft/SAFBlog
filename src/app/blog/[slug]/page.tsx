import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PostBody } from "@/components/blog/PostBody";
import { PostCard } from "@/components/blog/PostCard";
import { CommentForm } from "@/components/blog/CommentForm";
import { CommentList } from "@/components/blog/CommentList";
import { SocialShare } from "@/components/blog/SocialShare";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { InArticlePromotion } from "@/components/promotions/PromotionSlot";
import {
  blogPostingSchema,
  blogSchema,
  breadcrumbSchema,
  faqPageSchema,
  jsonLdGraph,
} from "@/lib/seo/schema";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { formatPostDate } from "@/lib/format";
import { getApprovedComments } from "@/lib/queries/comments";
import {
  getAdjacentPosts,
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/queries/posts";
import { getPromotions } from "@/lib/queries/promotions";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/site";

export const revalidate = 60;

/** True when the URL looks like a direct image file (not an Unsplash page, etc.). */
function isDirectImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    return /\.(avif|gif|jpe?g|png|webp|svg)(\?|#|$)/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

/** Prerender every published post at build time; new ones fall back to ISR. */
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Story not found", robots: { index: false, follow: false } };

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.excerpt || `${post.title} — from the ${SITE_NAME}.`;
  const ogImage = isDirectImageUrl(post.ogImageUrl)
    ? post.ogImageUrl
    : post.coverImageUrl;
  const canonical = post.canonicalUrl || `/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`),
      siteName: SITE_NAME,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.fullName] : undefined,
      tags: post.tags.map((t) => t.name),
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // A missing post must return a real 404 status, not a soft 200 with an
  // apology on it — the old SPA did the latter, which keeps dead URLs indexed.
  if (!post) notFound();

  const [related, adjacent, promotions, comments] = await Promise.all([
    getRelatedPosts(post.id, 3),
    post.publishedAt
      ? getAdjacentPosts(post.publishedAt)
      : Promise.resolve({ previous: null, next: null }),
    getPromotions("in_article", 1),
    getApprovedComments(post.id),
  ]);

  const date = formatPostDate(post.publishedAt);
  const updated =
    post.publishedAt && new Date(post.updatedAt) > new Date(post.publishedAt)
      ? formatPostDate(post.updatedAt)
      : null;
  const promotion = promotions[0];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          blogPostingSchema(post),
          blogSchema(),
          faqPageSchema(post.faq, `/blog/${post.slug}`),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Stories", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
        )}
      />

      <SiteHeader />
      <ViewTracker postId={post.id} />

      <main id="main">
        <article>
          <header className="border-b border-border">
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
              <nav aria-label="Breadcrumb" className="text-sm">
                <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                  <li>
                    <Link href="/" className="transition-colors duration-150 hover:text-foreground">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href="/blog" className="transition-colors duration-150 hover:text-foreground">
                      Stories
                    </Link>
                  </li>
                </ol>
              </nav>

              {post.categories.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="text-eyebrow uppercase tracking-[0.14em] text-primary transition-colors duration-150 hover:text-primary-hover"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <h1 className="mt-3 text-4xl leading-[1.1] md:text-5xl">{post.title}</h1>

              {post.excerpt && (
                <p className="mt-5 text-lg text-muted-foreground md:text-xl">{post.excerpt}</p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="text-foreground">
                  {post.author?.slug ? (
                    <Link
                      href={`/author/${post.author.slug}`}
                      className="transition-colors hover:text-primary"
                    >
                      {post.author.fullName}
                    </Link>
                  ) : (
                    (post.author?.fullName ?? "SAF Editorial Team")
                  )}
                </span>
                {date && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.publishedAt ?? undefined}>{date}</time>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} min read</span>
              </div>

              <SocialShare
                className="mt-6"
                url={absoluteUrl(`/blog/${post.slug}`)}
                title={post.title}
                description={post.excerpt}
              />

              {/* Freshness is a ranking and trust signal; surface it. */}
              {updated && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Updated <time dateTime={post.updatedAt}>{updated}</time>
                </p>
              )}
            </div>
          </header>

          {post.coverImageUrl && (
            <figure className="mx-auto max-w-3xl px-4 sm:px-6">
              {/* Native img: avoids fill/aspect collapse and optimizer failures on storage URLs */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImageUrl}
                alt=""
                width={1200}
                height={675}
                className="mt-10 w-full rounded object-cover"
                style={{ aspectRatio: "16 / 9" }}
                fetchPriority="high"
              />
            </figure>
          )}

          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            {post.keyTakeaways.length > 0 && (
              <aside className="mb-10 rounded-lg border border-border bg-surface-sunken p-5">
                <h2 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
                  Key takeaways
                </h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                  {post.keyTakeaways.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </aside>
            )}

            <PostBody content={post.content} />

            {post.faq.length > 0 && (
              <section className="mt-12 border-t border-border pt-8">
                <h2 className="font-display text-2xl">Frequently asked questions</h2>
                <dl className="mt-6 space-y-6">
                  {post.faq.map((item) => (
                    <div key={item.question}>
                      <dt className="font-medium">{item.question}</dt>
                      <dd className="mt-2 text-muted-foreground">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/*
              Sibling of the prose container, never inside it: the article body
              feeds articleBody in the BlogPosting schema and the llms.txt
              corpus, and sponsor copy must not be quoted as Foundation writing.
            */}
            {promotion && <InArticlePromotion promotion={promotion} />}

            {post.tags.length > 0 && (
              <div className="mt-12 border-t border-border pt-6">
                <h2 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
                  Tagged
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={`/tag/${tag.slug}`}
                        className="inline-flex min-h-9 items-center rounded-sm border border-border px-2.5 text-xs transition-colors duration-150 hover:border-primary hover:text-primary"
                      >
                        {tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <section
              aria-labelledby="comments-heading"
              className="mt-12 border-t border-border pt-8"
            >
              <h2 id="comments-heading" className="font-display text-2xl">
                Comments
                {comments.length > 0 && (
                  <span className="ml-2 text-base font-normal text-muted-foreground" data-numeric>
                    ({comments.length})
                  </span>
                )}
              </h2>
              <div className="mt-6">
                <CommentList comments={comments} />
              </div>
              <div className="mt-8">
                <h3 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
                  Leave a comment
                </h3>
                <CommentForm postId={post.id} postSlug={post.slug} className="mt-4" />
              </div>
            </section>

            {post.author?.bio && (
              <div className="mt-10 rounded-lg border border-border bg-surface-sunken p-6">
                <div className="flex items-start gap-4">
                  {post.author.avatarUrl && (
                    <Image
                      src={post.author.avatarUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-display text-lg">{post.author.fullName}</p>
                    {post.author.role && (
                      <p className="text-sm text-muted-foreground">{post.author.role}</p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {(adjacent.previous || adjacent.next) && (
              <nav
                aria-label="More stories"
                className="mt-10 grid gap-4 border-t border-border pt-6 sm:grid-cols-2"
              >
                {adjacent.previous ? (
                  <Link
                    href={`/blog/${adjacent.previous.slug}`}
                    className="group rounded border border-border p-4 transition-colors duration-150 hover:border-rule-strong"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Previous
                    </span>
                    <span className="mt-1 block font-display transition-colors duration-150 group-hover:text-primary">
                      {adjacent.previous.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}

                {adjacent.next && (
                  <Link
                    href={`/blog/${adjacent.next.slug}`}
                    className="group rounded border border-border p-4 text-right transition-colors duration-150 hover:border-rule-strong"
                  >
                    <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      Next
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block font-display transition-colors duration-150 group-hover:text-primary">
                      {adjacent.next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border bg-surface-sunken">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
              <h2 className="text-2xl">Related stories</h2>
              <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <PostCard key={item.id} post={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </>
  );
}
