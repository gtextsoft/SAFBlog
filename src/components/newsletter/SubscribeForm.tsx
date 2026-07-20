"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

import { subscribe, type SubscribeState } from "@/app/newsletter/actions";
import { cn } from "@/lib/utils";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Subscribing…" : label}
    </button>
  );
}

/**
 * Newsletter form.
 *
 * Progressive enhancement: it is a real <form> posting to a Server Action, so
 * it works before hydration. The old version was entirely client-side and did
 * nothing without JavaScript.
 */
export function SubscribeForm({
  source = "website",
  showName = false,
  layout = "stacked",
  submitLabel = "Subscribe",
  className,
}: {
  source?: string;
  showName?: boolean;
  layout?: "stacked" | "inline";
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState<SubscribeState, FormData>(subscribe, {
    status: "idle",
  });

  if (state.status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-start gap-2 rounded border border-success/40 bg-success/10 p-4 text-sm text-success",
          className,
        )}
      >
        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={cn("space-y-3", className)}>
      <input type="hidden" name="source" value={source} />

      {/*
        Honeypot. Hidden from people via inert positioning rather than
        display:none, which some bots specifically skip. aria-hidden and
        tabIndex keep it away from assistive tech and keyboard users.
      */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {showName && (
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
            Name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            maxLength={120}
            className="h-11 w-full rounded border border-input bg-background px-3 text-base"
          />
        </div>
      )}

      <div className={cn(layout === "inline" ? "flex flex-col gap-2 sm:flex-row" : "space-y-3")}>
        <div className="flex-1">
          {/* A real label, not a placeholder — placeholder-only labels vanish
              the moment the field is filled and fail WCAG 3.3.2. */}
          <label
            htmlFor={`email-${source}`}
            className={cn("mb-1.5 block text-sm font-medium", layout === "inline" && "sr-only")}
          >
            Email address
          </label>
          <input
            id={`email-${source}`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder={layout === "inline" ? "you@example.com" : undefined}
            aria-invalid={state.fieldError ? true : undefined}
            aria-describedby={state.fieldError ? `email-error-${source}` : undefined}
            className="h-11 w-full rounded border border-input bg-background px-3 text-base"
          />
        </div>

        <div className={cn(layout === "inline" && "sm:self-end")}>
          <SubmitButton label={submitLabel} />
        </div>
      </div>

      {state.fieldError && (
        <p
          id={`email-error-${source}`}
          role="alert"
          aria-live="polite"
          className="text-sm text-destructive"
        >
          {state.fieldError}
        </p>
      )}

      {state.status === "error" && state.message && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        No spam. Unsubscribe any time using the link in any email we send.
      </p>
    </form>
  );
}
