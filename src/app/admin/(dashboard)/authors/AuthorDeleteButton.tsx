"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteAuthor } from "@/app/admin/(dashboard)/authors/actions";

export function AuthorDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Delete author “${name}”?`)) return;
          setError("");
          startTransition(async () => {
            const result = await deleteAuthor(id);
            if (result.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className="text-sm text-destructive disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <span role="alert" className="max-w-[16rem] text-right text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
