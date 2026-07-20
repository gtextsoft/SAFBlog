import Image from "next/image";
import Link from "next/link";

import { formatPostDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/types/blog";

/**
 * Feed card.
 *
 * The title link is the card's single primary target. The old card nested
 * three separate anchors — cover, title and category — inside one another,
 * which is an accessibility violation and made the category chip compete with
 * the title for the same tap. Category links now sit below, outside it.
 */
export function PostCard({
  post,
  priority = false,
  className,
}: {
  post: PostSummary;
  priority?: boolean;
  className?: string;
}) {
  const date = formatPostDate(post.publishedAt);

  return (
    <article className={cn("group flex flex-col", className)}>
      {post.coverImageUrl && (
        <Link
          href={`/blog/${post.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative mb-4 block aspect-[16/10] overflow-hidden rounded"
        >
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 380px"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      )}

      <h3 className="text-xl leading-snug">
        <Link href={`/blog/${post.slug}`} className="transition-colors duration-150 hover:text-primary">
          {post.title}
        </Link>
      </h3>

      {post.excerpt && (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
      )}

      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
        <span>{post.author?.fullName ?? "SAF Editorial Team"}</span>
        {date && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt ?? undefined}>{date}</time>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{post.readingMinutes} min read</span>
      </p>

      {post.categories.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {post.categories.slice(0, 2).map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex items-center rounded-sm border border-border px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/** Lead story: larger type, two-column on wide screens. */
export function FeaturedPostCard({ post }: { post: PostSummary }) {
  const date = formatPostDate(post.publishedAt);

  return (
    <article className="group grid gap-6 border-b border-border pb-10 md:grid-cols-2 md:gap-10">
      {post.coverImageUrl && (
        <Link
          href={`/blog/${post.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block aspect-[4/3] overflow-hidden rounded md:aspect-[5/4]"
        >
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      )}

      <div className="flex flex-col justify-center">
        <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Featured</p>

        <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-150 hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="mt-3 text-base text-muted-foreground md:text-lg">{post.excerpt}</p>
        )}

        <p className="mt-4 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span>{post.author?.fullName ?? "SAF Editorial Team"}</span>
          {date && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt ?? undefined}>{date}</time>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </p>
      </div>
    </article>
  );
}
