"use server";

import { z } from "zod";

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
  // Honeypot: a field hidden from people but filled in by naive bots.
  website: z.string().max(0).optional().or(z.literal("")),
});

/**
 * Newsletter subscription.
 *
 * Every outcome — new address, already subscribed, previously unsubscribed —
 * returns the same message. Reporting "already subscribed" would let anyone
 * probe whether a given address is on the list, which is the enumeration hole
 * the old client-side form had.
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
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

  // Honeypot tripped. Answer exactly as if it succeeded so a bot gets no
  // signal that it was detected.
  if (website) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const supabase = createPublicClient();

  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    full_name: fullName || null,
    status: "subscribed",
    source: source || "website",
  });

  if (error) {
    // 23505 = unique violation, i.e. the address is already on the list.
    // Indistinguishable from a fresh signup by design.
    if (error.code === "23505") {
      return { status: "success", message: SUCCESS_MESSAGE };
    }

    console.error("subscribe", { message: error.message });
    return {
      status: "error",
      message: "We couldn't complete that just now. Please try again shortly.",
    };
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}

const SUCCESS_MESSAGE =
  "Thanks — you're on the list. We'll be in touch when the next story publishes.";
