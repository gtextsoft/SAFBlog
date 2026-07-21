"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

import { submitContact, type ContactState } from "@/app/contact/actions";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

export function ContactForm({ className }: { className?: string }) {
  const [state, formAction] = useActionState<ContactState, FormData>(submitContact, {
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
    <form action={formAction} className={cn("space-y-4", className)}>
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
        />
        {state.fieldErrors?.subject && (
          <p className="mt-1 text-sm text-destructive">{state.fieldErrors.subject}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full rounded border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 text-sm text-destructive">{state.fieldErrors.message}</p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
