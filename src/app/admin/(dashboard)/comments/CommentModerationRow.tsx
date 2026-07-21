"use client";

import { useTransition } from "react";

import { setCommentStatus } from "@/app/blog/[slug]/comments-actions";
import type { Comment } from "@/lib/queries/comments";
import { cn } from "@/lib/utils";

export function CommentModerationRow({ comment }: { comment: Comment }) {
  const [pending, startTransition] = useTransition();
  const date = new Date(comment.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-opacity",
        pending && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            "rounded-sm border px-1.5 py-0.5 font-medium uppercase tracking-wide",
            comment.status === "approved" && "border-success/40 bg-success/10 text-success",
            comment.status === "pending" && "border-border bg-muted",
            (comment.status === "spam" || comment.status === "rejected") &&
              "border-destructive/40 bg-destructive/5 text-destructive",
          )}
        >
          {comment.status}
        </span>
        <span>{date}</span>
        {comment.postTitle && <span>· {comment.postTitle}</span>}
      </div>

      <p className="mt-2 font-medium">
        {comment.authorName}{" "}
        <span className="font-normal text-muted-foreground">&lt;{comment.authorEmail}&gt;</span>
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{comment.body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {comment.status !== "approved" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setCommentStatus(comment.id, "approved"))}
            className="inline-flex min-h-9 items-center rounded border border-border px-3 text-xs font-medium hover:border-rule-strong"
          >
            Approve
          </button>
        )}
        {comment.status !== "rejected" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setCommentStatus(comment.id, "rejected"))}
            className="inline-flex min-h-9 items-center rounded border border-border px-3 text-xs font-medium hover:border-rule-strong"
          >
            Reject
          </button>
        )}
        {comment.status !== "spam" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setCommentStatus(comment.id, "spam"))}
            className="inline-flex min-h-9 items-center rounded border border-border px-3 text-xs font-medium text-destructive hover:border-destructive/40"
          >
            Spam
          </button>
        )}
      </div>
    </li>
  );
}
