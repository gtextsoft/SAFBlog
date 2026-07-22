import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { CommentModerationRow } from "@/app/admin/(dashboard)/comments/CommentModerationRow";
import { listCommentsForAdmin, type CommentStatus } from "@/lib/queries/comments";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { href: string; label: string; status?: CommentStatus }[] = [
  { href: "/admin/comments", label: "All" },
  { href: "/admin/comments?status=approved", label: "Live", status: "approved" },
  { href: "/admin/comments?status=rejected", label: "Hidden", status: "rejected" },
  { href: "/admin/comments?status=spam", label: "Spam", status: "spam" },
  { href: "/admin/comments?status=pending", label: "Pending", status: "pending" },
];

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status = FILTERS.find((f) => f.status === raw)?.status;
  const comments = await listCommentsForAdmin(status);

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl">Comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comments go live immediately. Use <strong>Hide from site</strong> or{" "}
          <strong>Mark as spam</strong> to remove anything that should not stay public.
        </p>
      </div>

      <nav aria-label="Filter comments" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = f.status === status || (!status && !f.status);
          return (
            <Link
              key={f.href}
              href={f.href}
              className={cn(
                "inline-flex min-h-9 items-center rounded border px-3 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary-subtle text-primary"
                  : "border-border text-muted-foreground hover:border-rule-strong hover:text-foreground",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {comments.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">No comments here</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {status
              ? `Nothing marked as ${status} right now.`
              : "When readers leave comments, they will show up here."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {comments.map((c) => (
            <CommentModerationRow key={c.id} comment={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
