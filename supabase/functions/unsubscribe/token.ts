/**
 * Signed unsubscribe tokens.
 *
 * An unsubscribe link has to keep working for the life of the email that
 * carried it, so these tokens deliberately do not expire. They bind a single
 * email address to an HMAC-SHA256 signature; possessing a token proves the
 * bearer received mail at that address, which is the only authorisation an
 * unsubscribe needs.
 *
 * Format: base64url(email) "." base64url(hmac_sha256(secret, email))
 */

const encoder = new TextEncoder();

/** base64url per RFC 4648 §5 — URL-safe alphabet, no padding. */
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
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

/**
 * Compare two byte arrays in time independent of how early they differ.
 * A naive `===` on the signature would leak its bytes to a timing attack.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Mint a token for an email address. Call this when composing a newsletter
 * so each recipient's List-Unsubscribe header carries their own token.
 */
export async function signToken(email: string, secret: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(normalized));
  return `${toBase64Url(encoder.encode(normalized))}.${toBase64Url(new Uint8Array(signature))}`;
}

/**
 * Verify a token and recover the address it authorises.
 * Returns null for anything malformed or incorrectly signed — callers must
 * not distinguish between those cases in their response.
 */
export async function verifyToken(token: string, secret: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedEmail, encodedSignature] = parts;

  let email: string;
  let presented: Uint8Array;
  try {
    email = new TextDecoder().decode(fromBase64Url(encodedEmail));
    presented = fromBase64Url(encodedSignature);
  } catch {
    return null;
  }

  const key = await importKey(secret);
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(email)),
  );

  return timingSafeEqual(presented, expected) ? email : null;
}
