"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  confirmationEmailHtml,
  confirmUrl,
  isEmailConfigured,
  sendEmail,
} from "@/lib/email/resend";
import { ensureNewsletterSecret } from "@/lib/newsletter/secret";
import { newsletterTokenSecret, signToken } from "@/lib/newsletter/token";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";

export interface SubscribeState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldError?: string;
}

const SubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  fullName: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().trim().max(40).optional(),
  website: z.string().max(0).optional().or(z.literal("")),
});

const SUCCESS_MESSAGE =
  "Check your inbox for a confirmation link to finish subscribing.";

async function sendConfirmation(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured (RESEND_API_KEY)." };
  }

  try {
    const token = await signToken(email);
    const url = confirmUrl(token, email);
    return sendEmail({
      to: email,
      subject: "Confirm your subscription",
      html: confirmationEmailHtml(url),
      text: `Confirm your subscription: ${url}`,
    });
  } catch (err) {
    console.error("sendConfirmation", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not send confirmation email.",
    };
  }
}

/**
 * Double opt-in subscribe. Inserts/updates as `pending` and emails a confirm link.
 * All outcomes share the same success copy (anti-enumeration).
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = rateLimit(`subscribe:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!limited.ok) {
    return {
      status: "error",
      message: "Too many attempts. Please wait a minute and try again.",
    };
  }

  const parsed = SubscribeSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    source: formData.get("source"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { status: "error", fieldError: issue?.message ?? "Please check your details." };
  }

  const { email, fullName, source, website } = parsed.data;

  if (website) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const supabase = createPublicClient();

  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    full_name: fullName || null,
    status: "pending",
    source: source || "website",
  });

  if (error) {
    if (error.code === "23505") {
      try {
        await ensureNewsletterSecret();
        const secret = newsletterTokenSecret();
        const { data: outcome, error: rpcError } = await supabase.rpc(
          "newsletter_request_resubscribe",
          {
            p_email: email,
            p_full_name: fullName || "",
            p_source: source || "website",
            p_secret: secret,
          },
        );

        if (rpcError) {
          console.error("subscribe resubscribe rpc", rpcError.message);
        } else if (outcome === "pending") {
          const sent = await sendConfirmation(email);
          if (!sent.ok) console.error("subscribe resend confirm", sent.error);
        }
      } catch (err) {
        console.error("subscribe conflict path", err);
      }

      return { status: "success", message: SUCCESS_MESSAGE };
    }

    console.error("subscribe", { message: error.message });
    return {
      status: "error",
      message: "We couldn't complete that just now. Please try again shortly.",
    };
  }

  const sent = await sendConfirmation(email);
  if (!sent.ok) {
    console.error("subscribe confirmation send", sent.error);
    return {
      status: "error",
      message: `Signed up, but confirmation email failed: ${sent.error}`,
    };
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}

export interface ConfirmState {
  status: "idle" | "success" | "error";
  message?: string;
}

/** Confirm a pending subscription via signed token. */
export async function confirmSubscription(
  token: string | null,
): Promise<ConfirmState> {
  if (!token) {
    return { status: "error", message: "This confirmation link is invalid or incomplete." };
  }

  let email: string | null;
  try {
    const { verifyToken } = await import("@/lib/newsletter/token");
    email = await verifyToken(token);
  } catch (err) {
    console.error("confirmSubscription token", err);
    return {
      status: "error",
      message: "Confirmation is temporarily unavailable. Please try again later.",
    };
  }

  if (!email) {
    return { status: "error", message: "This confirmation link is invalid or has been altered." };
  }

  try {
    await ensureNewsletterSecret();
    const supabase = createPublicClient();
    const { error } = await supabase.rpc("newsletter_confirm", {
      p_email: email,
      p_secret: newsletterTokenSecret(),
    });

    if (error) {
      console.error("confirmSubscription", error.message);
      return {
        status: "error",
        message: "We couldn't confirm that just now. Please try again shortly.",
      };
    }
  } catch (err) {
    console.error("confirmSubscription", err);
    return {
      status: "error",
      message: "Confirmation is temporarily unavailable. Please try again later.",
    };
  }

  return {
    status: "success",
    message: "You're confirmed — welcome aboard. We'll email you when new stories publish.",
  };
}
