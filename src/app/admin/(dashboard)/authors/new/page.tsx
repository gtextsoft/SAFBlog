import Link from "next/link";

import { AuthorForm } from "@/app/admin/(dashboard)/authors/AuthorForm";
import { createAuthorRecord } from "@/app/admin/(dashboard)/authors/actions";

export default function NewAuthorPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/authors" className="text-sm text-muted-foreground hover:text-foreground">
          ← Authors
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">New author</h1>
      </div>
      <AuthorForm action={createAuthorRecord} submitLabel="Create author" />
    </div>
  );
}
