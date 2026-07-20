/**
 * Environment validation.
 *
 * Supabase's own error for a missing URL is "supabaseUrl is required", thrown
 * from deep inside a bundled chunk with no indication of which variable or
 * which file is at fault. These helpers fail with something actionable
 * instead — and fail at the first access rather than mid-render.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}.\n` +
        `Copy .env.example to .env.local and fill in the values.\n` +
        `Both Supabase values are on the project's API settings page.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
