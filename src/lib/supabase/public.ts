import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

import type { Database } from "@/integrations/supabase/types";

/**
 * Anonymous Supabase client for public content.
 *
 * Deliberately does NOT read cookies. Calling `cookies()` opts a route out of
 * static generation entirely, so using the session-aware server client for
 * public pages would force every blog page to render per-request — losing the
 * cached static HTML that the SEO/GEO work depends on.
 *
 * Public content is anonymous by definition: RLS already restricts the anon
 * role to `status = 'published'`, so there is nothing a session would add.
 *
 * Use `lib/supabase/server.ts` instead wherever the caller genuinely needs the
 * signed-in user — i.e. anything under /admin.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
