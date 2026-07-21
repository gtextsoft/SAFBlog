"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, Pencil, Send, Trash2, Undo2 } from "lucide-react";

import { deletePost, setPostStatus } from "@/app/admin/(dashboard)/posts/actions";
import type { AdminPostListItem } from "@/lib/queries/admin-posts";
import { cn } from "@/lib/utils";

export function PostRow({ post }: { post: AdminPostListItem }) {
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const published = post.status === "published";
  const date = new Date(post.updatedAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-opacity duration-150",
        pending && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-sm border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                published
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {post.status}
            </span>
            <span className="text-xs text-muted-foreground">Updated {date}</span>
          </div>

          <h2 className="mt-2 truncate font-display text-lg">{post.title}</h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            /blog/{post.slug}
            {post.authorName && ` · ${post.authorName}`}
            {published && (
              <>
                {" · "}
                <span data-numeric>{post.viewCount.toLocaleString("en-NG")}</span> views
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => setPostStatus(post.id, published ? "draft" : "published"))
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            {published ? (
              <Undo2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {published ? `Unpublish ${post.title}` : `Publish ${post.title}`}
            </span>
          </button>

          {published && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">View {post.title} on the site</span>
            </Link>
          )}

          <Link
            href={`/admin/posts/${post.id}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Edit {post.title}</span>
          </Link>

          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Delete {post.title}</span>
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-label={`Delete ${post.title}?`}
          className="mt-4 flex flex-wrap items-center gap-3 rounded border border-destructive/40 bg-destructive/5 p-3"
        >
          <p className="flex-1 text-sm">
            Delete <strong>{post.title}</strong>? This cannot be undone.
            {published && " The published URL will start returning 404."}
          </p>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="inline-flex min-h-11 items-center rounded border border-border px-3 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deletePost(post.id))}
            className="inline-flex min-h-11 items-center rounded bg-destructive px-3 text-sm font-medium text-destructive-foreground disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      )}
    </li>
  );
}
