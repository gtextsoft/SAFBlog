/**
 * Optional Sentry hook for Next.js.
 *
 * Full @sentry/nextjs setup is deferred: set SENTRY_DSN when you are ready to
 * install the SDK and wire client/server configs. Until then this file is a
 * no-op so the instrumentation entrypoint exists without a heavy dependency.
 *
 * When enabling Sentry:
 *   1. npm install @sentry/nextjs
 *   2. Replace this module with Sentry.init({ dsn: process.env.SENTRY_DSN })
 *      (or the official wizard output).
 */
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  // Placeholder: SDK not installed. Avoid importing a missing package at boot.
  console.info(
    "[instrumentation] SENTRY_DSN is set but @sentry/nextjs is not wired yet.",
  );
}
