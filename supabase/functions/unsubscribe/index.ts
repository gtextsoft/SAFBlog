/**
 * Newsletter unsubscribe.
 *
 * Runs with the service-role key so it can write to newsletter_subscribers,
 * which RLS otherwise exposes to admins only. Authorisation comes from an
 * HMAC-signed token rather than the caller's session — the recipient of a
 * newsletter has no account.
 *
 * Accepts:
 *   POST /unsubscribe?token=...          RFC 8058 one-click (mail clients)
 *   POST /unsubscribe  {"token": "..."}  the unsubscribe page
 *
 * Always answers 200 with the same body regardless of whether the address
 * existed, was already unsubscribed, or was never on the list. Distinguishing
 * those would turn this endpoint into a subscriber-enumeration oracle.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
import { verifyToken } from "./token.ts";

const GENERIC_RESULT = {
  ok: true,
  message: "If that address was subscribed, it has been removed.",
};

Deno.serve(async (request: Request) => {
  const cors = corsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed." }, 405, cors);
  }

  const secret = Deno.env.get("NEWSLETTER_TOKEN_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!secret || !supabaseUrl || !serviceRoleKey) {
    // Misconfiguration is ours, not the caller's — don't imply their link is bad.
    console.error("unsubscribe: missing required environment configuration");
    return json({ ok: false, message: "Service unavailable." }, 503, cors);
  }

  // One-click clients put the token in the query string; our own page sends
  // JSON. Accept either, preferring the query string.
  let token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) {
    try {
      const body = await request.json();
      if (typeof body?.token === "string") token = body.token;
    } catch {
      // Body absent or not JSON (one-click sends a form body) — fine.
    }
  }

  if (!token) {
    return json({ ok: false, message: "This unsubscribe link is invalid." }, 400, cors);
  }

  const email = await verifyToken(token, secret);
  if (!email) {
    return json({ ok: false, message: "This unsubscribe link is invalid." }, 400, cors);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("email", email)
    .eq("status", "subscribed");

  if (error) {
    console.error("unsubscribe: update failed", { message: error.message });
    return json({ ok: false, message: "Something went wrong. Please try again." }, 500, cors);
  }

  // No row matched when the address was absent or already unsubscribed. Both
  // are indistinguishable from success by design.
  return json(GENERIC_RESULT, 200, cors);
});

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
