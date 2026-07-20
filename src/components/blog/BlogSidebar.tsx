import Link from "next/link";

import { SidebarPromotion } from "@/components/promotions/PromotionSlot";
import { getPromotions } from "@/lib/queries/promotions";
import { getCategoriesWithCounts, getTagsWithCounts } from "@/lib/queries/taxonomy";

/**
 * Blog sidebar.
 *
 * A Server Component: the old one was a client component that issued a
 * junction query plus a count query for every category and every tag on each
 * page load. Counts now arrive with the taxonomy in one aggregate query each.
 */
export async function BlogSidebar() {
  const [categories, tags, promotions] = await Promise.all([
    getCategoriesWithCounts(),
    getTagsWithCounts(10),
    getPromotions("sidebar", 1),
  ]);

  const withPosts = categories.filter((c) => c.postCount > 0);
  const usedTags = tags.filter((t) => t.postCount > 0);

  return (
    <div className="space-y-8">
      {promotions[0] && <SidebarPromotion promotion={promotions[0]} />}

      {withPosts.length > 0 && (
        <section aria-labelledby="sidebar-categories">
          <h2
            id="sidebar-categories"
            className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground"
          >
            Topics
          </h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {withPosts.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-sm transition-colors duration-150 hover:text-primary"
                >
                  <span>{category.name}</span>
                  <span data-numeric className="text-xs text-muted-foreground">
                    {category.postCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {usedTags.length > 0 && (
        <section aria-labelledby="sidebar-tags">
          <h2
            id="sidebar-tags"
            className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground"
          >
            Tags
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {usedTags.map((tag) => (
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
        </section>
      )}
    </div>
  );
}
