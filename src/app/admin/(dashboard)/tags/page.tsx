import Link from "next/link";

import { createTag, deleteTag, updateTag } from "@/app/admin/(dashboard)/taxonomy/actions";
import { TermCreateForm, TermEditRow } from "@/components/admin/TermForms";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("id, name, slug").order("name");

  const items = tags ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tags</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Finer-grained labels than categories. Also manage{" "}
          <Link href="/admin/categories" className="text-primary underline-offset-2 hover:underline">
            categories
          </Link>
          .
        </p>
      </div>

      <TermCreateForm action={createTag} addLabel="Add tag" />

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No tags yet. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {items.map((t) => (
            <TermEditRow
              key={t.id}
              id={t.id}
              name={t.name}
              slug={t.slug}
              // Bind the id server-side so a caller cannot re-target the update.
              updateAction={updateTag.bind(null, t.id)}
              deleteAction={deleteTag}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
