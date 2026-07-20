import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { PostRow } from "@/components/admin/PostRow";
import { listPosts } from "@/lib/queries/admin-posts";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await listPosts();

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.length - published;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span data-numeric>{published}</span> published ·{" "}
            <span data-numeric>{drafts}</span> {drafts === 1 ? "draft" : "drafts"}
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

      {posts.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">No posts yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Write the first story. You can save it as a draft and publish when it&rsquo;s ready.
          </p>
          <Link
            href="/admin/posts/new"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Write the first post
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
