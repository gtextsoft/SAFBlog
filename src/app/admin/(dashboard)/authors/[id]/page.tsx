import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorForm } from "@/app/admin/(dashboard)/authors/AuthorForm";
import { updateAuthorRecord } from "@/app/admin/(dashboard)/authors/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("authors").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const bound = updateAuthorRecord.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/authors" className="text-sm text-muted-foreground hover:text-foreground">
          ← Authors
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">Edit author</h1>
      </div>
      <AuthorForm
        action={bound}
        submitLabel="Save author"
        author={{
          fullName: data.full_name,
          slug: data.slug,
          role: data.role,
          bio: data.bio,
          avatarUrl: data.avatar_url,
          twitterUrl: data.twitter_url,
          linkedinUrl: data.linkedin_url,
          websiteUrl: data.website_url,
        }}
      />
    </div>
  );
}
