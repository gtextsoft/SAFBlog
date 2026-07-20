/**
 * Domain types for the blog.
 *
 * These are deliberately narrower than the generated Supabase rows. The
 * mapping layer in `lib/queries` resolves the nullable database columns once,
 * so components never repeat the null handling that caused
 * `format(new Date(""))` to throw across the old PostCard/FeaturedPost tree.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  fullName: string;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  /** ISO 8601. Null only for drafts, which the public queries exclude. */
  publishedAt: string | null;
  updatedAt: string;
  readingMinutes: number;
  author: Author | null;
  categories: Category[];
  tags: Tag[];
}

export interface Post extends PostSummary {
  content: string;
}

/** A page of results plus the total, for URL-addressable pagination. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
