import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PostEditor } from "@/components/admin/PostEditor";
import { getEditorOptions } from "@/lib/queries/admin-posts";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const { authors, categories, tags } = await getEditorOptions();

  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Posts
      </Link>

      <h1 className="mt-2 font-display text-3xl">New post</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Saved as a draft unless you set the status to published.
      </p>

      <div className="mt-8">
        <PostEditor
          action={createPost}
          authors={authors}
          categories={categories}
          tags={tags}
          submitLabel="Create post"
        />
      </div>
    </div>
  );
}
