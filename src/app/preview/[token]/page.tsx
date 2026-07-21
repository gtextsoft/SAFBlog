import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostBody } from "@/components/blog/PostBody";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPostByPreviewToken } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const post = await getPostByPreviewToken(token);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          Preview — status: {post.publishedAt ? "has publish date" : "unpublished"} · not indexed
        </p>
        <h1 className="mt-8 text-4xl">{post.title}</h1>
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            width={1200}
            height={675}
            className="mt-8 w-full rounded object-cover"
            style={{ aspectRatio: "16 / 9" }}
          />
        )}
        {post.keyTakeaways.length > 0 && (
          <aside className="mt-8 rounded-lg border border-border bg-surface-sunken p-5">
            <h2 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
              Key takeaways
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {post.keyTakeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
        )}
        <div className="mt-10">
          <PostBody content={post.content} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
