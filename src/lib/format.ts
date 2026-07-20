/**
 * Date formatting.
 *
 * `formatPostDate` returns null rather than throwing on a missing date. The
 * old components called `format(new Date(publishedAt))` directly and Blog.tsx
 * passed "" for an unpublished post, so an empty date crashed the card.
 */
export function formatPostDate(iso: string | null | undefined): string | null {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Short form for dense contexts such as related-post lists. */
export function formatPostDateShort(iso: string | null | undefined): string | null {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
