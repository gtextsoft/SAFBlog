"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";

export interface CommentState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export type CommentActionResult = { ok: true } | { ok: false; error: string };

const CommentSchema = z.object({
  postId: z.string().uuid(),
  postSlug: z.string().min(1).max(200),
  authorName: z.string().trim().min(1, "Enter your name.").max(80),
  authorEmail: z.string().trim().toLowerCase().email("Enter a valid email."),
  body: z.string().trim().min(3, "Comment is too short.").max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});

/** Reject obvious link spam while keeping live comments for real readers. */
function looksLikeLinkSpam(body: string): boolean {
  const urls = body.match(/https?:\/\/|www\./gi) ?? [];
  return urls.length >= 3;
}

export async function submitComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);

  // Soft per-isolate limits: tighter than before; also keyed by email after parse.
  const ipLimited = rateLimit(`comment:ip:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!ipLimited.ok) {
    return {
      status: "error",
      message: "Too many comments. Please wait a minute and try again.",
    };
  }

  const parsed = CommentSchema.safeParse({
    postId: formData.get("postId"),
    postSlug: formData.get("postSlug"),
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    body: formData.get("body"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", fieldErrors, message: "Please check your comment." };
  }

  const { postId, postSlug, authorName, authorEmail, body, website } = parsed.data;

  if (website) {
    // Honeypot trip — pretend success without writing.
    return {
      status: "success",
      message: "Thanks — your comment is live.",
    };
  }

  const emailLimited = rateLimit(`comment:email:${authorEmail}`, {
    limit: 3,
    windowMs: 10 * 60_000,
  });
  if (!emailLimited.ok) {
    return {
      status: "error",
      message: "Too many comments from this email. Please try again later.",
    };
  }

  if (looksLikeLinkSpam(body)) {
    return {
      status: "error",
      message: "Please remove extra links from your comment and try again.",
    };
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_name: authorName,
    author_email: authorEmail,
    body,
    status: "approved",
  });

  if (error) {
    console.error("submitComment", error.message);
    return {
      status: "error",
      message: "We couldn't save that comment just now. Please try again shortly.",
    };
  }

  revalidatePath(`/blog/${postSlug}`);
  return {
    status: "success",
    message: "Thanks — your comment is live.",
  };
}

export async function setCommentStatus(
  id: string,
  status: "approved" | "rejected" | "spam" | "pending",
): Promise<CommentActionResult> {
  const { supabase } = await requireRole("admin", "editor");

  const { error } = await supabase.from("comments").update({ status }).eq("id", id);
  if (error) {
    console.error("setCommentStatus", error.message);
    return { ok: false, error: "Could not update that comment. Try again." };
  }

  revalidatePath("/admin/comments");
  revalidatePath("/blog", "layout");
  return { ok: true };
}

/** Permanently remove a comment. */
export async function deleteComment(id: string): Promise<CommentActionResult> {
  const { supabase } = await requireRole("admin", "editor");

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    console.error("deleteComment", error.message);
    return { ok: false, error: "Could not delete that comment. Try again." };
  }

  revalidatePath("/admin/comments");
  revalidatePath("/blog", "layout");
  return { ok: true };
}
