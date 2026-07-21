"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { marked } from "marked";
import { z } from "zod";

import {
  campaignEmailHtml,
  isEmailConfigured,
  sendEmail,
  unsubscribeUrl,
} from "@/lib/email/resend";
import { signToken } from "@/lib/newsletter/token";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { CONTACT_EMAIL } from "@/lib/seo/site";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) redirect("/admin/login?denied=1");

  return { supabase, user };
}

export interface CampaignState {
  error?: string;
  success?: string;
}

const CampaignSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  preheader: z.string().trim().max(140).optional().or(z.literal("")),
  body: z.string().trim().min(1, "Body is required").max(50_000),
});

marked.setOptions({ gfm: true, breaks: false });

async function markdownToEmailHtml(markdown: string): Promise<string> {
  const raw = await marked.parse(markdown);
  return String(raw)
    .replace(/<\/?(script|style)[^>]*>/gi, "")
    .replace(/<img(\s|>)/gi, '<img style="max-width:100%;height:auto;display:block;"$1')
    .replace(/<a(\s|>)/gi, '<a style="color:#1d4ed8;"$1')
    .replace(/<h2(\s|>)/gi, '<h2 style="font-size:1.35rem;margin:1.25em 0 0.5em;line-height:1.25;"$1')
    .replace(/<h3(\s|>)/gi, '<h3 style="font-size:1.15rem;margin:1.1em 0 0.4em;line-height:1.3;"$1')
    .replace(/<p>/gi, '<p style="margin:0 0 1em;line-height:1.6;">')
    .replace(/<ul>/gi, '<ul style="margin:0 0 1em;padding-left:1.25em;">')
    .replace(/<ol>/gi, '<ol style="margin:0 0 1em;padding-left:1.25em;">')
    .replace(
      /<blockquote>/gi,
      '<blockquote style="margin:0 0 1em;padding-left:1em;border-left:3px solid #ccc;color:#555;">',
    );
}

function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~|>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function sendCampaign(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  const { user } = await requireAdmin();

  if (!isEmailConfigured()) {
    return { error: "RESEND_API_KEY / RESEND_FROM_EMAIL are not configured." };
  }

  const parsed = CampaignSchema.safeParse({
    subject: formData.get("subject"),
    preheader: formData.get("preheader"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid campaign." };
  }

  const { subject, preheader, body } = parsed.data;
  const htmlBody = await markdownToEmailHtml(body);
  const plain = markdownToPlainText(body);

  let service;
  try {
    service = createServiceClient();
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Service role key missing.",
    };
  }

  const { data: subscribers, error: listError } = await service
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "subscribed");

  if (listError) {
    return { error: listError.message };
  }

  const recipients = subscribers ?? [];
  if (recipients.length === 0) {
    return { error: "No confirmed subscribers to send to." };
  }

  let sent = 0;
  const failures: string[] = [];

  for (const { email } of recipients) {
    try {
      const token = await signToken(email);
      const unsub = unsubscribeUrl(token, email);
      const edgeUnsub = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/unsubscribe?token=${encodeURIComponent(token)}`;

      const result = await sendEmail({
        to: email,
        subject,
        html: campaignEmailHtml(htmlBody, unsub, preheader || undefined),
        text: `${subject}\n\n${plain}\n\nUnsubscribe: ${unsub}`,
        headers: {
          "List-Unsubscribe": `<${edgeUnsub}>, <mailto:${CONTACT_EMAIL}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (result.ok) sent += 1;
      else failures.push(email);
    } catch {
      failures.push(email);
    }
  }

  await service.from("newsletter_campaigns").insert({
    subject,
    body: preheader ? `<!-- preheader: ${preheader} -->\n${body}` : body,
    recipient_count: sent,
    created_by: user.id,
  });

  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/subscribers");

  if (failures.length > 0 && sent === 0) {
    return { error: `Send failed for all ${failures.length} recipients.` };
  }

  return {
    success:
      failures.length > 0
        ? `Sent to ${sent} of ${recipients.length} (${failures.length} failed).`
        : `Sent to ${sent} subscriber${sent === 1 ? "" : "s"}.`,
  };
}
