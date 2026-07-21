"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";

import { uploadCoverImage, type PostActionState } from "@/app/admin/(dashboard)/posts/actions";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { AdminAuthor, AdminPostDetail, AdminTerm } from "@/lib/queries/admin-posts";
import { cn } from "@/lib/utils";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
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

const inputClass = "h-11 w-full rounded border border-input bg-background px-3 text-base";

export function PostEditor({
  action,
  post,
  authors,
  categories,
  tags,
  submitLabel,
}: {
  action: (prev: PostActionState, formData: FormData) => Promise<PostActionState>;
  post?: AdminPostDetail;
  authors: AdminAuthor[];
  categories: AdminTerm[];
  tags: AdminTerm[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<PostActionState, FormData>(action, {});
  const errors = state.fieldErrors ?? {};

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(post));
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const dirtyRef = useRef(false);
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (dirtyRef.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  function markDirty() {
    dirtyRef.current = true;
  }

  async function onUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const data = new FormData();
      data.set("file", file);
      const result = await uploadCoverImage(data);

      if (result.error) setUploadError(result.error);
      else if (result.url) {
        setCoverImageUrl(result.url);
        markDirty();
      } else {
        setUploadError("Upload returned no URL. Check storage permissions.");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form
      action={formAction}
      onChange={markDirty}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-6">
        {state.error && (
          <p
            role="alert"
            className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugLocked) setSlug(slugify(e.target.value));
            }}
            className={cn(inputClass, "font-display text-lg")}
          />
          {errors.title && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
            URL <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-muted-foreground">/blog/</span>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugLocked(true);
                setSlug(slugify(e.target.value));
              }}
              className={inputClass}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {post
              ? "Changing this breaks existing links to the post."
              : "Generated from the title until you edit it."}
          </p>
          {errors.slug && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {errors.slug}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            maxLength={500}
            defaultValue={post?.excerpt ?? ""}
            className="w-full rounded border border-input bg-background p-3 text-base"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Used on cards, in search results and social previews. Two sentences is plenty.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Content <span className="text-destructive">*</span>
          </label>
          <RichTextEditor
            name="content"
            initialContent={post?.content ?? ""}
            onDirty={markDirty}
          />
          {errors.content && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {errors.content}
            </p>
          )}
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Publish</h2>

          <label htmlFor="status" className="mb-1.5 mt-3 block text-sm">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft — not visible</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <label htmlFor="scheduledAt" className="mb-1.5 mt-3 block text-sm">
            Schedule (if scheduled)
          </label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={
              post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
            }
            className={inputClass}
          />
          {errors.scheduledAt && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {errors.scheduledAt}
            </p>
          )}

          {post?.previewToken && (
            <p className="mt-3 text-xs text-muted-foreground">
              Preview:{" "}
              <a
                href={`/preview/${post.previewToken}`}
                target="_blank"
                rel="noopener"
                className="text-primary underline-offset-2 hover:underline"
              >
                /preview/{post.previewToken.slice(0, 8)}…
              </a>
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <SubmitButton label={submitLabel} />
            <Link
              href="/admin/posts"
              className="inline-flex min-h-11 items-center rounded border border-border px-4 text-sm"
            >
              Cancel
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium">SEO &amp; GEO</h2>
          <label htmlFor="metaTitle" className="mb-1.5 mt-3 block text-xs">
            Meta title
          </label>
          <input
            id="metaTitle"
            name="metaTitle"
            maxLength={70}
            defaultValue={post?.metaTitle ?? ""}
            className={inputClass}
          />
          <label htmlFor="metaDescription" className="mb-1.5 mt-3 block text-xs">
            Meta description
          </label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            maxLength={160}
            defaultValue={post?.metaDescription ?? ""}
            className="w-full rounded border border-input bg-background p-2 text-sm"
          />
          <label htmlFor="focusKeyword" className="mb-1.5 mt-3 block text-xs">
            Focus keyword
          </label>
          <input
            id="focusKeyword"
            name="focusKeyword"
            defaultValue={post?.focusKeyword ?? ""}
            className={inputClass}
          />
          <label htmlFor="ogImageUrl" className="mb-1.5 mt-3 block text-xs">
            OG image URL
          </label>
          <input
            id="ogImageUrl"
            name="ogImageUrl"
            type="url"
            defaultValue={post?.ogImageUrl ?? ""}
            className={inputClass}
          />
          <label htmlFor="canonicalUrl" className="mb-1.5 mt-3 block text-xs">
            Canonical URL
          </label>
          <input
            id="canonicalUrl"
            name="canonicalUrl"
            type="url"
            defaultValue={post?.canonicalUrl ?? ""}
            className={inputClass}
          />
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" name="noindex" defaultChecked={post?.noindex} className="h-4 w-4" />
            Noindex this post
          </label>
          <label htmlFor="keyTakeaways" className="mb-1.5 mt-3 block text-xs">
            Key takeaways (one per line)
          </label>
          <textarea
            id="keyTakeaways"
            name="keyTakeaways"
            rows={4}
            defaultValue={(post?.keyTakeaways ?? []).join("\n")}
            className="w-full rounded border border-input bg-background p-2 font-mono text-sm"
          />
          <p className="mb-1.5 mt-3 text-xs font-medium">FAQ pairs</p>
          {(post?.faq?.length ? post.faq : [{ question: "", answer: "" }]).map((item, i) => (
            <div key={i} className="mt-2 space-y-1">
              <input
                name="faqQuestion"
                placeholder="Question"
                defaultValue={item.question}
                className={inputClass}
              />
              <textarea
                name="faqAnswer"
                placeholder="Answer"
                rows={2}
                defaultValue={item.answer}
                className="w-full rounded border border-input bg-background p-2 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Cover image</h2>
          <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

          {coverImageUrl ? (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt=""
                width={288}
                height={162}
                className="aspect-[16/9] w-full rounded object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setCoverImageUrl("");
                  markDirty();
                }}
                className="mt-2 inline-flex min-h-11 items-center text-sm text-destructive"
              >
                Remove image
              </button>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Shown on cards and at the top of the article. Landscape works best.
            </p>
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
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded border border-border text-sm transition-colors duration-150 hover:border-rule-strong disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {coverImageUrl ? "Replace image" : "Upload image"}
              </>
            )}
          </button>
          {uploadError && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {uploadError}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <label htmlFor="authorId" className="text-sm font-medium">
            Author
          </label>
          <select
            id="authorId"
            name="authorId"
            defaultValue={post?.authorId ?? ""}
            className={cn(inputClass, "mt-2")}
          >
            <option value="">Unattributed</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.fullName}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            Manage authors in{" "}
            <Link href="/admin/authors" className="text-primary underline-offset-2 hover:underline">
              Authors
            </Link>
            .
          </p>
        </div>

        <fieldset className="rounded-lg border border-border bg-card p-4">
          <legend className="px-1 text-sm font-medium">Topics</legend>
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">No topics defined yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <label className="flex min-h-11 items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={category.id}
                      defaultChecked={post?.categoryIds.includes(category.id)}
                      className="h-4 w-4 rounded-sm border-input"
                    />
                    {category.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <fieldset className="rounded-lg border border-border bg-card p-4">
          <legend className="px-1 text-sm font-medium">Tags</legend>
          {tags.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tags defined yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <label className="flex min-h-11 items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={post?.tagIds.includes(tag.id)}
                      className="h-4 w-4 rounded-sm border-input"
                    />
                    {tag.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </aside>
    </form>
  );
}
