import "server-only";

import { newsletterTokenSecret } from "@/lib/newsletter/token";
import { createPublicClient } from "@/lib/supabase/public";

/** Ensure DB has the shared newsletter secret (insert-if-missing). */
export async function ensureNewsletterSecret(): Promise<void> {
  const supabase = createPublicClient();
  const { error } = await supabase.rpc("newsletter_ensure_secret", {
    p_secret: newsletterTokenSecret(),
  });
  if (error) {
    // mismatch means an old secret is already stored — confirm RPCs will fail until fixed
    console.error("newsletter_ensure_secret", error.message);
    throw new Error(
      error.message.includes("mismatch")
        ? "Newsletter secret in the database does not match NEWSLETTER_TOKEN_SECRET."
        : `Could not initialize newsletter secret: ${error.message}`,
    );
  }
}
