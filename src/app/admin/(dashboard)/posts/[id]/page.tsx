import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PostEditor } from "@/components/admin/PostEditor";
import { getEditorOptions, getPostForEdit } from "@/lib/queries/admin-posts";
import { updatePost } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [post, options] = await Promise.all([getPostForEdit(id), getEditorOptions()]);
  if (!post) notFound();

  // Bind the id server-side; taking it from a hidden field would let a caller
  // re-target the update at any post they could name.
  const action = updatePost.bind(null, post.id);

  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Posts
      </Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl">Edit post</h1>
        {post.status === "published" && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="inline-flex min-h-11 items-center text-sm text-primary hover:text-primary-hover"
          >
            View on site
          </Link>
        )}
      </div>

      <div className="mt-8">
        <PostEditor
          action={action}
          post={post}
          authors={options.authors}
          categories={options.categories}
          tags={options.tags}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
