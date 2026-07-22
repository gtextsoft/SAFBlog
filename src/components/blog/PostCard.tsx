import Image from "next/image";
import Link from "next/link";

import { formatPostDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/types/blog";

/**
 * Feed card.
 *
 * The title link is the card's single primary target. Category links sit
 * below, outside it, so chips never compete with the headline for the same tap.
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
    <article
      className={cn(
        "group flex flex-col border border-border bg-card p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent/40",
        className,
      )}
    >
      {post.coverImageUrl && (
        <Link
          href={`/blog/${post.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative mb-5 block aspect-[16/10] overflow-hidden"
        >
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>
      )}

      <h3 className="font-display text-xl leading-snug md:text-[1.35rem]">
        <Link
          href={`/blog/${post.slug}`}
          className="transition-colors duration-150 hover:text-accent"
        >
          {post.title}
        </Link>
      </h3>

      {post.excerpt && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      <p className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
        <span>{post.author?.fullName ?? "The Blueprint Editorial Team"}</span>
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
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.categories.slice(0, 2).map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex items-center border border-border px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:border-accent hover:text-accent"
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
    <article className="group grid gap-8 border border-border bg-card p-6 transition-all duration-300 ease-out hover:border-accent/40 md:grid-cols-2 md:gap-12 md:p-8">
      {post.coverImageUrl && (
        <Link
          href={`/blog/${post.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block aspect-[16/10] overflow-hidden md:aspect-[5/4]"
        >
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            priority
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>
      )}

      <div className="flex flex-col justify-center">
        <p className="text-eyebrow uppercase tracking-[0.16em] text-accent">Featured</p>
        <h3 className="mt-3 font-display text-3xl leading-[1.1] md:text-5xl">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-150 hover:text-accent"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {post.excerpt}
          </p>
        )}

        <p className="mt-6 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span>{post.author?.fullName ?? "The Blueprint Editorial Team"}</span>
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
