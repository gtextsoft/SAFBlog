"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { ActionState } from "@/app/admin/(dashboard)/promotions/actions";
import type { AdminPromotion } from "@/lib/queries/admin-promotions";
import { SidebarPromotion } from "@/components/promotions/PromotionSlot";

/** Turn an ISO instant into the local value a datetime-local input expects. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {/* Helper text persists rather than living in a placeholder that
          disappears the moment the field is filled. */}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

const inputClass =
  "h-11 w-full rounded border border-input bg-background px-3 text-base transition-colors duration-150";

export function PromotionForm({
  action,
  promotion,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  promotion?: AdminPromotion;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  const errors = state.fieldErrors ?? {};

  // Mirrored into local state purely to drive the live preview.
  const [preview, setPreview] = useState({
    title: promotion?.title ?? "",
    body: promotion?.body ?? "",
    sponsorName: promotion?.sponsorName ?? "",
    ctaLabel: promotion?.ctaLabel ?? "Learn more",
    imageUrl: promotion?.imageUrl ?? "",
  });

  const set = (key: keyof typeof preview) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setPreview((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form action={formAction} className="space-y-6">
        {state.error && (
          <p
            role="alert"
            className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}

        <fieldset className="space-y-4 rounded-lg border border-border bg-card p-5">
          <legend className="px-1 text-sm font-medium">Creative</legend>

          <Field label="Title" htmlFor="title" required error={errors.title}>
            <input
              id="title"
              name="title"
              defaultValue={promotion?.title}
              onChange={set("title")}
              required
              maxLength={120}
              className={inputClass}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="body"
            hint="One or two lines. Shown under the title."
            error={errors.body}
          >
            <textarea
              id="body"
              name="body"
              defaultValue={promotion?.body ?? ""}
              onChange={set("body")}
              rows={3}
              maxLength={400}
              className="w-full rounded border border-input bg-background p-3 text-base"
            />
          </Field>

          <Field
            label="Sponsor name"
            htmlFor="sponsorName"
            required
            hint="Shown to readers as “Sponsored by …”. Required for disclosure."
            error={errors.sponsorName}
          >
            <input
              id="sponsorName"
              name="sponsorName"
              defaultValue={promotion?.sponsorName}
              onChange={set("sponsorName")}
              required
              maxLength={80}
              className={inputClass}
            />
          </Field>

          <Field
            label="Image URL"
            htmlFor="imageUrl"
            hint="Landscape works best. Leave empty for a text-only placement."
            error={errors.imageUrl}
          >
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              inputMode="url"
              defaultValue={promotion?.imageUrl ?? ""}
              onChange={set("imageUrl")}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-4 rounded-lg border border-border bg-card p-5">
          <legend className="px-1 text-sm font-medium">Destination</legend>

          <Field
            label="Link"
            htmlFor="targetUrl"
            required
            hint="Clicks route through a tracking redirect and carry rel=&quot;sponsored nofollow&quot;."
            error={errors.targetUrl}
          >
            <input
              id="targetUrl"
              name="targetUrl"
              type="url"
              inputMode="url"
              placeholder="https://"
              defaultValue={promotion?.targetUrl}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Button label" htmlFor="ctaLabel" required error={errors.ctaLabel}>
            <input
              id="ctaLabel"
              name="ctaLabel"
              defaultValue={promotion?.ctaLabel ?? "Learn more"}
              onChange={set("ctaLabel")}
              required
              maxLength={40}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-4 rounded-lg border border-border bg-card p-5">
          <legend className="px-1 text-sm font-medium">Placement &amp; schedule</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Where it shows" htmlFor="placement" required>
              <select
                id="placement"
                name="placement"
                defaultValue={promotion?.placement ?? "sidebar"}
                className={inputClass}
              >
                <option value="sidebar">Sidebar</option>
                <option value="in_feed">Between posts in the feed</option>
                <option value="in_article">Partway through an article</option>
              </select>
            </Field>

            <Field label="Status" htmlFor="status" required>
              <select
                id="status"
                name="status"
                defaultValue={promotion?.status ?? "draft"}
                className={inputClass}
              >
                <option value="draft">Draft — not shown</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Starts"
              htmlFor="startsAt"
              hint="Optional. Leave empty to start immediately."
              error={errors.startsAt}
            >
              <input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                defaultValue={toLocalInput(promotion?.startsAt ?? null)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Ends"
              htmlFor="endsAt"
              hint="Optional. Leave empty to run indefinitely."
              error={errors.endsAt}
            >
              <input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                defaultValue={toLocalInput(promotion?.endsAt ?? null)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="Priority"
            htmlFor="priority"
            hint="Higher wins when several promotions compete for the same slot."
            error={errors.priority}
          >
            <input
              id="priority"
              name="priority"
              type="number"
              min={0}
              max={100}
              defaultValue={promotion?.priority ?? 0}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <div className="flex items-center gap-3">
          <SubmitButton label={submitLabel} />
          <Link
            href="/admin/promotions"
            className="inline-flex min-h-11 items-center rounded border border-border px-4 text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-eyebrow uppercase text-muted-foreground">Preview</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          How the sidebar placement will look to a reader.
        </p>

        <div className="mt-3">
          <SidebarPromotion
            promotion={{
              id: promotion?.id ?? "preview",
              title: preview.title || "Your promotion title",
              body: preview.body || "A short description of what you are promoting.",
              imageUrl: preview.imageUrl || null,
              ctaLabel: preview.ctaLabel || "Learn more",
              targetUrl: "#",
              sponsorName: preview.sponsorName || "Sponsor name",
              placement: "sidebar",
            }}
          />
        </div>
      </aside>
    </div>
  );
}
