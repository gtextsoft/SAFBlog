/**
 * CORS headers for browser-invoked functions.
 *
 * ALLOWED_ORIGINS is a comma-separated allowlist; set it in the function's
 * environment. We echo back the request's origin only when it is on the list
 * rather than returning "*", so the response stays usable with credentials
 * and unknown sites cannot read it.
 */
const DEFAULT_ORIGINS = [
  "https://blog.stephenakintayofoundation.org",
  "http://localhost:8080",
  "http://localhost:3000",
];

function allowlist(): string[] {
  const configured = Deno.env.get("ALLOWED_ORIGINS");
  if (!configured) return DEFAULT_ORIGINS;
  return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = allowlist().includes(origin) ? origin : allowlist()[0];

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
