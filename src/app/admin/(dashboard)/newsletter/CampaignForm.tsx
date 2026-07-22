"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";

import { sendCampaign, type CampaignState } from "@/app/admin/(dashboard)/newsletter/actions";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { cn } from "@/lib/utils";

const initial: CampaignState = {};

export function CampaignForm({
  subscriberCount = 0,
  emailConfigured = false,
}: {
  subscriberCount?: number;
  emailConfigured?: boolean;
}) {
  const [state, action, pending] = useActionState(sendCampaign, initial);
  const [confirmed, setConfirmed] = useState(false);
  const [subject, setSubject] = useState("");

  const recipients = Number.isFinite(subscriberCount) ? subscriberCount : 0;
  const canSend = emailConfigured && recipients > 0 && confirmed && !pending;

  return (
    <form action={action} className="space-y-8">
      {!emailConfigured && (
        <p
          role="alert"
          className="rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
        >
          Resend is not configured. Add <code className="text-xs">RESEND_API_KEY</code> and{" "}
          <code className="text-xs">RESEND_FROM_EMAIL</code> to send campaigns.
        </p>
      )}

      {recipients === 0 && (
        <p
          role="alert"
          className="rounded border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
        >
          There are no confirmed subscribers yet. Campaigns only go to people who finished double
          opt-in.
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded border border-border bg-primary-subtle px-4 py-3 text-sm text-foreground"
        >
          {state.success}
        </p>
      )}

      <div className="grid w-full gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div>
            <label htmlFor="subject" className="text-sm font-medium">
              Subject <span className="text-destructive">*</span>
            </label>
            <input
              id="subject"
              name="subject"
              required
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="This month from The Blueprint"
              className="mt-1.5 h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground tabular-nums" data-numeric>
              {subject.length}/200
            </p>
          </div>

          <div>
            <label htmlFor="preheader" className="text-sm font-medium">
              Preheader
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Short inbox preview text shown after the subject in most clients.
            </p>
            <input
              id="preheader"
              name="preheader"
              maxLength={140}
              placeholder="A quick look at what’s new…"
              className="mt-1.5 h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <MarkdownEditor
            name="body"
            id="body"
            label="Email body"
            required
            rows={20}
            hint="Markdown supported — headings, lists, links, images, quotes. An unsubscribe footer is added automatically."
          />
        </div>

        <aside className="w-full space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-lg">Before you send</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Recipients</dt>
                <dd className="font-medium tabular-nums" data-numeric>
                  {recipients.toLocaleString("en-NG")}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Format</dt>
                <dd className="font-medium">Markdown → HTML</dd>
              </div>
            </dl>

            <label className="mt-5 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-sm border-input"
              />
              <span>
                I understand this will email{" "}
                <strong className="tabular-nums" data-numeric>
                  {recipients.toLocaleString("en-NG")}
                </strong>{" "}
                confirmed subscriber{recipients === 1 ? "" : "s"} immediately.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSend}
              className={cn(
                "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity",
                !canSend && "opacity-50",
              )}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {pending ? "Sending…" : "Send campaign"}
            </button>
          </div>

          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            Tip: keep the subject under ~50 characters, lead with the news, and use one clear CTA
            link in the body.
          </div>
        </aside>
      </div>
    </form>
  );
}
