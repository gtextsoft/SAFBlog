"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * Admin sign-in.
 *
 * Messaging is deliberately generic — "Incorrect email or password" for both
 * an unknown account and a wrong password — so the form cannot be used to
 * enumerate which addresses have accounts. (It also replaces the "Fuck you"
 * string the previous version showed on every failed attempt, including a
 * legitimate admin's typo.)
 *
 * The role check happens server-side in the proxy; this only authenticates.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // The proxy redirects here with ?denied=1 when a signed-in non-admin tries
  // to reach the dashboard.
  useEffect(() => {
    if (params.get("denied")) {
      setError("That account doesn't have admin access.");
    }
  }, [params]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Incorrect email or password.");
      setPassword("");
      setBusy(false);
      return;
    }

    // Let the proxy decide where this user may go; it also verifies the admin
    // role, which the client must not be trusted to do.
    const next = params.get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className="h-11 w-full rounded border border-input bg-background px-3 text-base disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
          className="h-11 w-full rounded border border-input bg-background px-3 text-base disabled:opacity-50"
        />
      </div>

      {error && (
        <p
          id="login-error"
          role="alert"
          aria-live="polite"
          className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="h-11 w-full rounded bg-primary text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
