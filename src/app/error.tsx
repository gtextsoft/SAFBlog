"use client";

import Link from "next/link";
import { useEffect } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function Error({
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
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-eyebrow uppercase tracking-[0.14em] text-primary">Error</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Something went wrong</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We hit an unexpected problem loading this page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium hover:border-rule-strong"
          >
            Go home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
