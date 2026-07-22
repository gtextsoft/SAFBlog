"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Trash2 } from "lucide-react";

import { deleteMedia } from "@/app/admin/(dashboard)/media/actions";

export function MediaItemCard({
  item,
}: {
  item: { name: string; path: string; url: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy URL.");
    }
  }

  return (
    <li className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-video bg-muted">
        <Image
          src={item.url}
          alt={item.name}
          fill
          className="object-cover"
          sizes="200px"
          unoptimized
        />
      </div>
      <div className="space-y-2 p-3 text-xs">
        <p className="truncate font-medium" title={item.name}>
          {item.name}
        </p>
        <p className="truncate text-muted-foreground" title={item.url}>
          {item.url}
        </p>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => void copyUrl()}
            className="inline-flex min-h-9 items-center gap-1.5 rounded border border-border px-2.5 text-xs hover:border-rule-strong"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return;
              setError("");
              startTransition(async () => {
                const result = await deleteMedia(item.path);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                router.refresh();
              });
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded border border-destructive/40 px-2.5 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </li>
  );
}
