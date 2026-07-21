/**
 * Signed newsletter tokens (confirm + unsubscribe).
 *
 * Format: base64url(email) "." base64url(hmac_sha256(secret, email))
 * Same algorithm as supabase/functions/unsubscribe/token.ts so links minted
 * here verify in the Edge Function and vice versa.
 */

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export function newsletterTokenSecret(): string {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "Missing NEWSLETTER_TOKEN_SECRET. Set the same value used by the unsubscribe Edge Function.",
    );
  }
  return secret;
}

export async function signToken(email: string, secret = newsletterTokenSecret()): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(normalized));
  return `${toBase64Url(encoder.encode(normalized))}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyToken(
  token: string,
  secret = newsletterTokenSecret(),
): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedEmail, encodedSignature] = parts;

  let email: string;
  let presented: Uint8Array;
  try {
    email = new TextDecoder().decode(fromBase64Url(encodedEmail!));
    presented = fromBase64Url(encodedSignature!);
  } catch {
    return null;
  }

  const key = await importKey(secret);
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(email)),
  );

  return timingSafeEqual(presented, expected) ? email : null;
}
