"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { addUserRole, removeUserRole, type UsersState } from "@/app/admin/(dashboard)/users/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center rounded bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Saving…" : "Add role"}
    </button>
  );
}

export function AddRoleForm() {
  const [state, formAction] = useActionState<UsersState, FormData>(addUserRole, {
    status: "idle",
  });

  return (
    <form action={formAction} className="mt-6 space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="font-display text-lg">Assign role</h2>
      <div>
        <label htmlFor="userId" className="mb-1.5 block text-sm font-medium">
          User ID (UUID)
        </label>
        <input
          id="userId"
          name="userId"
          type="text"
          required
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="h-11 w-full rounded border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="editor"
          className="h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="editor">editor</option>
          <option value="admin">admin</option>
          <option value="viewer">viewer</option>
        </select>
      </div>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error" ? "text-sm text-destructive" : "text-sm text-success"
          }
        >
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

export function RemoveRoleButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => removeUserRole(id))}
      className="text-xs text-destructive hover:underline disabled:opacity-60"
    >
      Remove
    </button>
  );
}
