import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { MediaItemCard } from "@/app/admin/(dashboard)/media/MediaItemCard";
import { listMedia, uploadImage } from "@/app/admin/(dashboard)/media/actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FOLDERS = ["library", "posts", "promotions", "authors"] as const;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; uploaded?: string; error?: string }>;
}) {
  const { folder, uploaded, error: uploadError } = await searchParams;
  const active = FOLDERS.includes(folder as (typeof FOLDERS)[number])
    ? (folder as (typeof FOLDERS)[number])
    : "library";

  const items = await listMedia(active);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Media</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Files in the post-images storage bucket. Copy a URL to paste into posts or promotions.
        </p>
      </div>

      <nav aria-label="Media folders" className="flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <Link
            key={f}
            href={`/admin/media?folder=${f}`}
            className={cn(
              "rounded px-3 py-1.5 text-sm capitalize transition-colors",
              active === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </Link>
        ))}
      </nav>

      {uploaded === "1" && (
        <p
          role="status"
          className="rounded border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
        >
          Image uploaded.
        </p>
      )}
      {uploadError && (
        <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {decodeURIComponent(uploadError)}
        </p>
      )}

      <form
        action={async (fd) => {
          "use server";
          const { redirect } = await import("next/navigation");
          const result = await uploadImage(fd, active);
          if (result.error) {
            redirect(
              `/admin/media?folder=${active}&error=${encodeURIComponent(result.error)}`,
            );
          }
          redirect(`/admin/media?folder=${active}&uploaded=1`);
        }}
        className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
      >
        <input type="file" name="file" accept="image/*" required className="text-sm" />
        <button
          type="submit"
          className="h-10 rounded bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Upload
        </button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">No files in {active}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Upload an image above, or switch folders to browse posts, promotions, and authors.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <MediaItemCard key={item.path} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
