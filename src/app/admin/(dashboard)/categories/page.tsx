import Link from "next/link";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/admin/(dashboard)/taxonomy/actions";
import { TermCreateForm, TermEditRow } from "@/components/admin/TermForms";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name");

  const items = categories ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Topics shown on posts and in the sidebar. Also manage{" "}
          <Link href="/admin/tags" className="text-primary underline-offset-2 hover:underline">
            tags
          </Link>
          .
        </p>
      </div>

      <TermCreateForm action={createCategory} withDescription addLabel="Add category" />

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No categories yet. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {items.map((c) => (
            <TermEditRow
              key={c.id}
              id={c.id}
              name={c.name}
              slug={c.slug}
              description={c.description}
              withDescription
              // Bind the id server-side so a caller cannot re-target the update.
              updateAction={updateCategory.bind(null, c.id)}
              deleteAction={deleteCategory}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
