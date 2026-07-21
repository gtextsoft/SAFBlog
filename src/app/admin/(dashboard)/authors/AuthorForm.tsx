"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { AuthorActionState } from "@/app/admin/(dashboard)/authors/actions";
import { slugify } from "@/lib/slugify";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

const input = "mt-1.5 h-11 w-full rounded border border-border bg-background px-3 text-sm";

export function AuthorForm({
  action,
  author,
  submitLabel,
}: {
  action: (prev: AuthorActionState, formData: FormData) => Promise<AuthorActionState>;
  author?: {
    fullName: string;
    slug: string;
    role: string | null;
    bio: string | null;
    avatarUrl: string | null;
    twitterUrl: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [name, setName] = useState(author?.fullName ?? "");
  const [slug, setSlug] = useState(author?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(author));
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state.error && (
        <p className="rounded border border-destructive/40 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="fullName" className="text-sm font-medium">
          Name
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugLocked) setSlug(slugify(e.target.value));
          }}
          className={input}
        />
        {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="slug" className="text-sm font-medium">
          URL slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugLocked(true);
            setSlug(e.target.value);
          }}
          className={input}
        />
        {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug}</p>}
      </div>

      <div>
        <label htmlFor="role" className="text-sm font-medium">
          Role
        </label>
        <input id="role" name="role" defaultValue={author?.role ?? ""} className={input} />
      </div>

      <div>
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={author?.bio ?? ""}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="avatarUrl" className="text-sm font-medium">
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={author?.avatarUrl ?? ""}
          className={input}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="twitterUrl" className="text-sm font-medium">
            X / Twitter
          </label>
          <input
            id="twitterUrl"
            name="twitterUrl"
            type="url"
            defaultValue={author?.twitterUrl ?? ""}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="linkedinUrl" className="text-sm font-medium">
            LinkedIn
          </label>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={author?.linkedinUrl ?? ""}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="websiteUrl" className="text-sm font-medium">
            Website
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={author?.websiteUrl ?? ""}
            className={input}
          />
        </div>
      </div>

      <Submit label={submitLabel} />
    </form>
  );
}
