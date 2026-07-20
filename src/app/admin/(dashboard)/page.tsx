import Link from "next/link";
import { ArrowRight, FileText, Megaphone, Plus } from "lucide-react";

import { listPosts } from "@/lib/queries/admin-posts";
import { isCurrentlyLive, listPromotions } from "@/lib/queries/admin-promotions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [posts, promotions] = await Promise.all([listPosts(), listPromotions()]);

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.length - published;
  const live = promotions.filter((p) => isCurrentlyLive(p)).length;
  const clicks = promotions.reduce((n, p) => n + p.clicks, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex min-h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Link>
      </div>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        {[
          ["Published posts", published],
          ["Drafts", drafts],
          ["Live promotions", live],
          ["Promotion clicks", clicks],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-card p-5">
            <dt className="text-eyebrow uppercase text-muted-foreground">{label}</dt>
            <dd data-numeric className="mt-1 font-display text-3xl">
              {Number(value).toLocaleString("en-NG")}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          {
            href: "/admin/posts",
            Icon: FileText,
            title: "Posts",
            body: "Write, edit, publish and unpublish stories.",
          },
          {
            href: "/admin/promotions",
            Icon: Megaphone,
            title: "Promotions",
            body: "Create sponsored placements and track how they perform.",
          },
        ].map(({ href, Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-border bg-card p-5 transition-colors duration-150 hover:border-rule-strong"
          >
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Open
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Newsletter subscribers are still managed in the previous admin app while that screen is
        migrated.
      </p>
    </div>
  );
}
