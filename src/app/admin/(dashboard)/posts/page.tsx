import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { PostRow } from "@/components/admin/PostRow";
import { listPosts } from "@/lib/queries/admin-posts";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: rawStatus, q: rawQ } = await searchParams;
  const statusFilter =
    rawStatus === "published" || rawStatus === "draft" || rawStatus === "scheduled"
      ? rawStatus
      : undefined;
  const q = (rawQ ?? "").trim().toLowerCase();

  const posts = await listPosts();

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;

  const filtered = posts.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (q && !p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  const filters = [
    { href: "/admin/posts", label: "All", active: !statusFilter },
    {
      href: "/admin/posts?status=published",
      label: "Published",
      active: statusFilter === "published",
    },
    { href: "/admin/posts?status=draft", label: "Drafts", active: statusFilter === "draft" },
    {
      href: "/admin/posts?status=scheduled",
      label: "Scheduled",
      active: statusFilter === "scheduled",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span data-numeric>{published}</span> published ·{" "}
            <span data-numeric>{drafts}</span> {drafts === 1 ? "draft" : "drafts"}
            {scheduled > 0 && (
              <>
                {" · "}
                <span data-numeric>{scheduled}</span> scheduled
              </>
            )}
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex min-h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <nav aria-label="Filter posts" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.href}
              href={q ? `${f.href}${f.href.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}` : f.href}
              className={
                f.active
                  ? "inline-flex min-h-9 items-center rounded border border-primary bg-primary-subtle px-3 text-xs font-medium text-primary"
                  : "inline-flex min-h-9 items-center rounded border border-border px-3 text-xs font-medium text-muted-foreground hover:border-rule-strong hover:text-foreground"
              }
            >
              {f.label}
            </Link>
          ))}
        </nav>

        <form action="/admin/posts" method="get" className="flex min-w-[12rem] flex-1 gap-2 sm:max-w-xs">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <label htmlFor="posts-q" className="sr-only">
            Search posts
          </label>
          <input
            id="posts-q"
            name="q"
            type="search"
            defaultValue={rawQ ?? ""}
            placeholder="Search title or slug…"
            className="h-9 w-full rounded border border-border bg-background px-3 text-sm"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded border border-border px-3 text-xs font-medium hover:border-rule-strong"
          >
            Search
          </button>
        </form>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">
            {posts.length === 0 ? "No posts yet" : "No matching posts"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {posts.length === 0
              ? "Write the first story. You can save it as a draft and publish when it’s ready."
              : "Try another filter or search term."}
          </p>
          {posts.length === 0 && (
            <Link
              href="/admin/posts/new"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Write the first post
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
