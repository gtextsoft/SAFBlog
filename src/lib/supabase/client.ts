import { createBrowserClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

import type { Database } from "@/integrations/supabase/types";

/**
 * Supabase client for Client Components.
 *
 * Unlike the old Vite singleton, this stores the session in cookies rather than
 * localStorage, so middleware and Server Components can read the same session.
 * It is created per call; @supabase/ssr memoises the underlying connection.
 */
export function createClient() {
  return createBrowserClient<Database>(
    supabaseUrl(),
    supabaseAnonKey(),
  );
}
