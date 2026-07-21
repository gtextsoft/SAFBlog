import { formatPostDate } from "@/lib/format";
import type { Comment } from "@/lib/queries/comments";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No comments yet. Be the first to share a thought.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {comments.map((comment) => (
        <li key={comment.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="font-medium">{comment.authorName}</p>
            <time
              dateTime={comment.createdAt}
              className="text-xs text-muted-foreground"
            >
              {formatPostDate(comment.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {comment.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
