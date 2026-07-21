"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";

import { uploadPromotionImage, type ActionState } from "@/app/admin/(dashboard)/promotions/actions";
import {
  ALL_PLACEMENTS,
  PLACEMENT_LABEL,
  type AdminPromotion,
  type PromotionPlacement,
} from "@/lib/types/promotion";
import { SidebarPromotion } from "@/components/promotions/PromotionSlot";
import { cn } from "@/lib/utils";

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

  const [selectedPlacements, setSelectedPlacements] = useState<PromotionPlacement[]>(
    promotion?.placements?.length
      ? promotion.placements
      : promotion?.placement
        ? [promotion.placement]
        : ["sidebar"],
  );

  const set = (key: keyof typeof preview) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setPreview((p) => ({ ...p, [key]: e.target.value }));

  function togglePlacement(slot: PromotionPlacement) {
    setSelectedPlacements((current) => {
      if (current.includes(slot)) {
        // Keep at least one slot selected.
        if (current.length === 1) return current;
        return current.filter((s) => s !== slot);
      }
      return [...current, slot];
    });
  }

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function onUpload(file: File) {
    setUploading(true);
    setUploadError("");

    const data = new FormData();
    data.set("file", file);
    const result = await uploadPromotionImage(data);

    if (result.error) setUploadError(result.error);
    else if (result.url) setPreview((p) => ({ ...p, imageUrl: result.url! }));

    setUploading(false);
  }

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

          <div>
            <span className="mb-1.5 block text-sm font-medium">Image</span>
            <input type="hidden" name="imageUrl" value={preview.imageUrl} />

            {preview.imageUrl && (
              <div className="mb-3">
                <img
                  src={preview.imageUrl}
                  alt=""
                  className="aspect-[16/9] w-full max-w-sm rounded border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPreview((p) => ({ ...p, imageUrl: "" }))}
                  className="mt-2 inline-flex min-h-11 items-center text-sm text-destructive"
                >
                  Remove image
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-border px-4 text-sm transition-colors duration-150 hover:border-rule-strong disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Uploading…
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {preview.imageUrl ? "Replace image" : "Upload image"}
                </>
              )}
            </button>

            {uploadError && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {uploadError}
              </p>
            )}

            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Or paste an image URL
              </summary>
              <input
                type="url"
                inputMode="url"
                aria-label="Image URL"
                value={preview.imageUrl}
                onChange={set("imageUrl")}
                placeholder="https://"
                className={cn(inputClass, "mt-2")}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Uploaded images are resized and served in modern formats. An image hosted
                elsewhere is shown as-is, so use a file that is already the right size.
              </p>
            </details>
            {errors.imageUrl && (
              <p role="alert" className="mt-1 text-xs text-destructive">
                {errors.imageUrl}
              </p>
            )}
          </div>
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

          <Field
            label="Where it shows"
            htmlFor="placements"
            required
            hint="Select every place this campaign should appear. One promotion can show in several spots at once."
            error={errors.placements}
          >
            <div
              id="placements"
              role="group"
              aria-label="Placement slots"
              className="space-y-2 rounded border border-input bg-background p-3"
            >
              {ALL_PLACEMENTS.map((slot) => {
                const checked = selectedPlacements.includes(slot);
                return (
                  <label
                    key={slot}
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="placements"
                      value={slot}
                      checked={checked}
                      onChange={() => togglePlacement(slot)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span>{PLACEMENT_LABEL[slot]}</span>
                  </label>
                );
              })}
            </div>
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
            hint="Higher wins when several promotions compete for the same slot. Only one campaign is shown per slot — if yours is active but missing, another live campaign likely has a higher priority."
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
          Sidebar preview. Other placements use the same creative with a different layout.
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
              placements: selectedPlacements,
            }}
          />
        </div>
      </aside>
    </div>
  );
}
