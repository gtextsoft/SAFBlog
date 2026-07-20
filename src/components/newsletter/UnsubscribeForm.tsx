"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

import { unsubscribe, type UnsubscribeState } from "@/app/unsubscribe/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Unsubscribing…" : "Confirm unsubscribe"}
    </button>
  );
}

export function UnsubscribeForm({ token, email }: { token: string; email?: string }) {
  const [state, formAction] = useActionState<UnsubscribeState, FormData>(unsubscribe, {
    status: "idle",
  });

  if (state.status === "success") {
    return (
      <div className="mt-6">
        <p
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded border border-success/40 bg-success/10 p-4 text-sm text-success"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-rule-strong"
        >
          Back to the homepage
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      {email && (
        <p className="text-sm text-muted-foreground">
          Unsubscribing <span className="font-medium text-foreground">{email}</span>
        </p>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-xs text-muted-foreground">
        Changed your mind?{" "}
        <Link href="/newsletter" className="text-primary hover:underline">
          Stay subscribed
        </Link>
        .
      </p>
    </form>
  );
}
