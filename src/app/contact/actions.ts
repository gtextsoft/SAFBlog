"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { isEmailConfigured, sendEmail } from "@/lib/email/resend";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/seo/site";

export interface ContactState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Enter a subject.").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(5000),
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limited.ok) {
    return {
      status: "error",
      message: "Too many attempts. Please wait a minute and try again.",
    };
  }

  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
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
    return { status: "error", fieldErrors, message: "Please check the form and try again." };
  }

  const { name, email, subject, message, website } = parsed.data;

  if (website) {
    return { status: "success", message: "Thanks — your message has been sent." };
  }

  if (!isEmailConfigured()) {
    return {
      status: "error",
      message: "Contact email is temporarily unavailable. Please try again later.",
    };
  }

  const result = await sendEmail({
    to: CONTACT_EMAIL,
    subject: `[Contact] ${subject}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr />
      <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
    `,
    text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    replyTo: email,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: "We couldn't send that just now. Please try again shortly.",
    };
  }

  return {
    status: "success",
    message: `Thanks — your message has been sent to ${SITE_NAME}. We'll reply soon.`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
