import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type CommentStatus = "pending" | "approved" | "spam" | "rejected";

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  status: CommentStatus;
  createdAt: string;
  postTitle?: string;
}

export async function getApprovedComments(postId: string): Promise<Comment[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, author_name, author_email, body, status, created_at")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getApprovedComments", error.message);
    return [];
  }

  return (data ?? []).map(mapComment);
}

export async function listCommentsForAdmin(
  status?: CommentStatus,
): Promise<Comment[]> {
  const supabase = await createClient();

  let query = supabase
    .from("comments")
    .select(
      "id, post_id, author_name, author_email, body, status, created_at, post:posts(title)",
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listCommentsForAdmin", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const post = row.post as unknown as { title: string } | null;
    return {
      ...mapComment(row),
      postTitle: post?.title,
    };
  });
}

function mapComment(row: {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
  status: string;
  created_at: string;
}): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    status: row.status as CommentStatus,
    createdAt: row.created_at,
  };
}
