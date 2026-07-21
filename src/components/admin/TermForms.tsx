"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Check, Trash2 } from "lucide-react";

import type { TermState } from "@/app/admin/(dashboard)/taxonomy/actions";
import { cn } from "@/lib/utils";

/**
 * Category and tag forms.
 *
 * These are client components purely so `useActionState` can surface what the
 * server action returns. As plain server-action forms they had no way to show
 * "Enter a name" or "Still used by 3 posts" — the submit simply appeared to do
 * nothing, which reads as a broken page.
 */

const inputClass = "h-10 rounded border border-border bg-background px-2 text-sm";

function Feedback({ state }: { state: TermState }) {
  if (!state.error && !state.success) return null;

  return (
    <p
      role={state.error ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "mt-2 flex items-center gap-1.5 text-xs",
        state.error ? "text-destructive" : "text-success",
      )}
    >
      {state.success && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      {state.error ?? state.success}
    </p>
  );
}

function SubmitButton({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(className, "disabled:opacity-60")}>
      {pending ? "Saving…" : label}
    </button>
  );
}

/** Add a new term. Clears itself on success so the next one can be typed. */
export function TermCreateForm({
  action,
  withDescription,
  addLabel,
}: {
  action: (prev: TermState, formData: FormData) => Promise<TermState>;
  withDescription?: boolean;
  addLabel: string;
}) {
  const [state, formAction] = useActionState<TermState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="new-name" className="text-xs font-medium">
            Name
          </label>
          <input id="new-name" name="name" required maxLength={80} className={cn(inputClass, "mt-1")} />
        </div>

        <div>
          <label htmlFor="new-slug" className="text-xs font-medium">
            URL <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input id="new-slug" name="slug" className={cn(inputClass, "mt-1")} />
        </div>

        {withDescription && (
          <div className="min-w-[200px] flex-1">
            <label htmlFor="new-description" className="text-xs font-medium">
              Description
            </label>
            <input id="new-description" name="description" className={cn(inputClass, "mt-1 w-full")} />
          </div>
        )}

        <SubmitButton
          label={addLabel}
          className="h-10 rounded bg-primary px-4 text-sm font-medium text-primary-foreground"
        />
      </form>

      <Feedback state={state} />
    </div>
  );
}

/** One row: rename/re-slug, plus delete behind a confirm. */
export function TermEditRow({
  id,
  name,
  slug,
  description,
  updateAction,
  deleteAction,
  withDescription,
}: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  updateAction: (prev: TermState, formData: FormData) => Promise<TermState>;
  deleteAction: (id: string) => Promise<TermState>;
  withDescription?: boolean;
}) {
  const [state, formAction] = useActionState<TermState, FormData>(updateAction, {});
  const [deleteState, setDeleteState] = useState<TermState>({});
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <li className="px-4 py-4">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`name-${id}`} className="sr-only">
            Name
          </label>
          <input
            id={`name-${id}`}
            name="name"
            defaultValue={name}
            required
            maxLength={80}
            className={cn(inputClass, "h-9")}
          />
        </div>

        <div>
          <label htmlFor={`slug-${id}`} className="sr-only">
            URL
          </label>
          <input id={`slug-${id}`} name="slug" defaultValue={slug} className={cn(inputClass, "h-9")} />
        </div>

        {withDescription && (
          <div className="min-w-[160px] flex-1">
            <label htmlFor={`description-${id}`} className="sr-only">
              Description
            </label>
            <input
              id={`description-${id}`}
              name="description"
              defaultValue={description ?? ""}
              placeholder="Description"
              className={cn(inputClass, "h-9 w-full")}
            />
          </div>
        )}

        <SubmitButton label="Save" className="min-h-9 px-2 text-sm text-primary" />

        <button
          type="button"
          onClick={() => {
            setConfirming(true);
            setDeleteState({});
          }}
          className="inline-flex min-h-9 items-center gap-1 px-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Delete {name}</span>
        </button>
      </form>

      <Feedback state={state} />

      {confirming && (
        <div
          role="alertdialog"
          aria-label={`Delete ${name}?`}
          className="mt-3 flex flex-wrap items-center gap-3 rounded border border-destructive/40 bg-destructive/5 p-3"
        >
          <p className="flex-1 text-sm">
            Delete <strong>{name}</strong>?
          </p>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="inline-flex min-h-9 items-center rounded border border-border px-3 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteAction(id);
                setDeleteState(result);
                // Keep the panel open when it failed, so the reason stays visible.
                if (result.success) setConfirming(false);
              })
            }
            className="inline-flex min-h-9 items-center rounded bg-destructive px-3 text-sm font-medium text-destructive-foreground disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      )}

      <Feedback state={deleteState} />
    </li>
  );
}
