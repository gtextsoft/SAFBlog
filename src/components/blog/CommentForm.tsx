"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

import { submitComment, type CommentState } from "@/app/blog/[slug]/comments-actions";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Submitting…" : "Post comment"}
    </button>
  );
}

export function CommentForm({
  postId,
  postSlug,
  className,
}: {
  postId: string;
  postSlug: string;
  className?: string;
}) {
  const [state, formAction] = useActionState<CommentState, FormData>(submitComment, {
    status: "idle",
  });

  if (state.status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-start gap-2 rounded border border-success/40 bg-success/10 p-4 text-sm text-success",
          className,
        )}
      >
        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={cn("space-y-3", className)}>
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="postSlug" value={postSlug} />

      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="comment-website">Leave this field empty</label>
        <input
          id="comment-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="authorName" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <input
            id="authorName"
            name="authorName"
            type="text"
            required
            autoComplete="name"
            className="h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          />
          {state.fieldErrors?.authorName && (
            <p className="mt-1 text-sm text-destructive">{state.fieldErrors.authorName}</p>
          )}
        </div>
        <div>
          <label htmlFor="authorEmail" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="authorEmail"
            name="authorEmail"
            type="email"
            required
            autoComplete="email"
            className="h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          />
          {state.fieldErrors?.authorEmail && (
            <p className="mt-1 text-sm text-destructive">{state.fieldErrors.authorEmail}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium">
          Comment
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          className="w-full rounded border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
        {state.fieldErrors?.body && (
          <p className="mt-1 text-sm text-destructive">{state.fieldErrors.body}</p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
