import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

import type { Database } from "@/integrations/supabase/types";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Reads the session from cookies so RLS applies the correct role. Anonymous
 * visitors get the anon role, which RLS already limits to published posts —
 * no policy changes were needed for the public site.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot set cookies. Middleware refreshes the
            // session on every request, so it is safe to ignore this here.
          }
        },
      },
    },
  );
}
