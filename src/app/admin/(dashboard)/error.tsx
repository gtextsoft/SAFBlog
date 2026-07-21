"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <h1 className="font-display text-2xl">Admin error</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong in the dashboard.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center rounded border border-border px-4 text-sm hover:border-rule-strong"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
