"use server";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

export interface UnsubscribeState {
  status: "idle" | "success" | "error";
  message?: string;
}

/**
 * Unsubscribe.
 *
 * Delegates to the `unsubscribe` Edge Function, which holds the signing
 * secret and the service-role key. Next never sees either.
 *
 * Called server-to-server from a Server Action rather than from the browser,
 * so the flow completes without JavaScript and the reader's browser is never
 * asked to talk to Supabase directly.
 */
export async function unsubscribe(
  _prev: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    return {
      status: "error",
      message: "This link is missing its unsubscribe code. Please use the link from your email.",
    };
  }

  try {
    const response = await fetch(`${supabaseUrl()}/functions/v1/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Sent so the call still works if the function is deployed with JWT
        // verification enabled; harmless when it is not.
        Authorization: `Bearer ${supabaseAnonKey()}`,
        apikey: supabaseAnonKey(),
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const result = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !result?.ok) {
      return {
        status: "error",
        message:
          result?.message ??
          "That unsubscribe link isn't valid. Please use the most recent email we sent you.",
      };
    }

    return { status: "success", message: result.message };
  } catch (error) {
    console.error("unsubscribe", error);
    return {
      status: "error",
      message: "We couldn't reach the mailing service. Please try again shortly.",
    };
  }
}
