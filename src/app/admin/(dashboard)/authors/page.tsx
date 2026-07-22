import Link from "next/link";

import { AuthorDeleteButton } from "@/app/admin/(dashboard)/authors/AuthorDeleteButton";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const supabase = await createClient();
  const { data: authors } = await supabase
    .from("authors")
    .select("id, full_name, slug, role")
    .order("full_name");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Authors</h1>
          <p className="mt-2 text-sm text-muted-foreground">People who write for the blog.</p>
        </div>
        <Link
          href="/admin/authors/new"
          className="inline-flex h-11 items-center rounded bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          New author
        </Link>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {(authors ?? []).length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted-foreground">No authors yet.</li>
        ) : (
          (authors ?? []).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{a.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  /author/{a.slug}
                  {a.role ? ` · ${a.role}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/authors/${a.id}`}
                  className="text-sm text-primary underline-offset-2 hover:underline"
                >
                  Edit
                </Link>
                <AuthorDeleteButton id={a.id} name={a.full_name} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
