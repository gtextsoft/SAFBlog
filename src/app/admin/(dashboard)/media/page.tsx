import Image from "next/image";

import { deleteMedia, listMedia, uploadImage } from "@/app/admin/(dashboard)/media/actions";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const active = folder === "posts" || folder === "promotions" || folder === "authors" || folder === "library"
    ? folder
    : "library";

  const items = await listMedia(active);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Media</h1>
        <p className="mt-2 text-sm text-muted-foreground">Files in the post-images storage bucket.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["library", "posts", "promotions", "authors"] as const).map((f) => (
          <a
            key={f}
            href={`/admin/media?folder=${f}`}
            className={`rounded px-3 py-1.5 text-sm ${active === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {f}
          </a>
        ))}
      </div>

      <form
        action={async (fd) => {
          "use server";
          await uploadImage(fd, active);
        }}
        className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
      >
        <input type="file" name="file" accept="image/*" required className="text-sm" />
        <button type="submit" className="h-10 rounded bg-primary px-4 text-sm font-medium text-primary-foreground">
          Upload
        </button>
      </form>

      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.path} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="relative aspect-video bg-muted">
              <Image src={item.url} alt="" fill className="object-cover" sizes="200px" unoptimized />
            </div>
            <div className="space-y-2 p-3 text-xs">
              <p className="truncate font-medium">{item.name}</p>
              <p className="truncate text-muted-foreground">{item.url}</p>
              <form
                action={async () => {
                  "use server";
                  await deleteMedia(item.path);
                }}
              >
                <button type="submit" className="text-destructive">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
