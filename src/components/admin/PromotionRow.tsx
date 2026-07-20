"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";

import {
  deletePromotion,
  setPromotionStatus,
} from "@/app/admin/(dashboard)/promotions/actions";
import type { AdminPromotion } from "@/lib/queries/admin-promotions";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<AdminPromotion["status"], string> = {
  active: "border-success/40 bg-success/10 text-success",
  draft: "border-border bg-muted text-muted-foreground",
  paused: "border-accent/40 bg-accent-subtle text-accent",
  ended: "border-border bg-muted text-muted-foreground",
};

function formatWindow(promotion: AdminPromotion): string | null {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  if (promotion.startsAt && promotion.endsAt) {
    return `${fmt(promotion.startsAt)} – ${fmt(promotion.endsAt)}`;
  }
  if (promotion.startsAt) return `From ${fmt(promotion.startsAt)}`;
  if (promotion.endsAt) return `Until ${fmt(promotion.endsAt)}`;
  return null;
}

export function PromotionRow({
  promotion,
  live,
  placementLabel,
}: {
  promotion: AdminPromotion;
  live: boolean;
  placementLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const window = formatWindow(promotion);
  // "Active" but outside its window is otherwise a silent no-show that looks
  // like a bug to whoever scheduled it.
  const scheduledButNotLive = promotion.status === "active" && !live;

  const ctr =
    promotion.impressions > 0
      ? `${((promotion.clicks / promotion.impressions) * 100).toFixed(1)}%`
      : "—";

  return (
    <li
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-opacity duration-150",
        pending && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-sm border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                STATUS_STYLE[promotion.status],
              )}
            >
              {promotion.status}
            </span>
            <span className="text-xs text-muted-foreground">{placementLabel}</span>
            {promotion.priority > 0 && (
              <span className="text-xs text-muted-foreground">Priority {promotion.priority}</span>
            )}
          </div>

          <h2 className="mt-2 truncate font-display text-lg">{promotion.title}</h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {promotion.sponsorName} · {promotion.targetUrl}
          </p>

          {window && <p className="mt-1 text-xs text-muted-foreground">{window}</p>}

          {scheduledButNotLive && (
            <p className="mt-2 text-xs text-accent">
              Marked active but outside its scheduled window, so it is not being shown.
            </p>
          )}
        </div>

        <dl className="flex shrink-0 gap-6 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Impressions</dt>
            <dd data-numeric>{promotion.impressions.toLocaleString("en-NG")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Clicks</dt>
            <dd data-numeric>{promotion.clicks.toLocaleString("en-NG")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">CTR</dt>
            <dd data-numeric>{ctr}</dd>
          </div>
        </dl>

        <div className="flex shrink-0 items-center gap-1">
          {(promotion.status === "active" || promotion.status === "paused") && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() =>
                  setPromotionStatus(
                    promotion.id,
                    promotion.status === "active" ? "paused" : "active",
                  ),
                )
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              {promotion.status === "active" ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {promotion.status === "active" ? "Pause" : "Resume"} {promotion.title}
              </span>
            </button>
          )}

          <Link
            href={`/admin/promotions/${promotion.id}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Edit {promotion.title}</span>
          </Link>

          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Delete {promotion.title}</span>
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-label={`Delete ${promotion.title}?`}
          className="mt-4 flex flex-wrap items-center gap-3 rounded border border-destructive/40 bg-destructive/5 p-3"
        >
          <p className="flex-1 text-sm">
            Delete <strong>{promotion.title}</strong>? Its impression and click history goes with
            it. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="inline-flex min-h-11 items-center rounded border border-border px-3 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deletePromotion(promotion.id))}
            className="inline-flex min-h-11 items-center rounded bg-destructive px-3 text-sm font-medium text-destructive-foreground disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      )}
    </li>
  );
}
