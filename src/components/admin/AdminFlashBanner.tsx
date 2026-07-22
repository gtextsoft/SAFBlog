"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

const MESSAGES: Record<string, string> = {
  created: "Created successfully.",
  saved: "Saved successfully.",
};

/**
 * Reads ?created=1 or ?saved=1 after redirects, shows a banner, then strips
 * the query so a refresh does not re-flash.
 */
export function AdminFlashBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const kind = searchParams.get("created")
      ? "created"
      : searchParams.get("saved")
        ? "saved"
        : null;
    if (!kind) return;

    setMessage(MESSAGES[kind] ?? null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("created");
    params.delete("saved");
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    router.replace(next, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className="mb-6 flex items-center gap-2 rounded border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
    >
      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
