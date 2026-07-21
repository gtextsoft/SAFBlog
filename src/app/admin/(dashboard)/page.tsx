import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  HandCoins,
  ImageIcon,
  Mail,
  Megaphone,
  MessageSquare,
  Plus,
  AlertCircle,
} from "lucide-react";

import { listCommentsForAdmin } from "@/lib/queries/comments";
import { listPosts } from "@/lib/queries/admin-posts";
import { isCurrentlyLive, listPromotions } from "@/lib/queries/admin-promotions";
import { getSubscriberStats } from "@/lib/queries/admin-subscribers";
import { createClient } from "@/lib/supabase/server";
import { formatPostDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  switch (status) {
    case "published":
      return "text-primary";
    case "scheduled":
      return "text-amber-700 dark:text-amber-400";
    case "draft":
    default:
      return "text-muted-foreground";
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [posts, promotions, subscribers, pendingComments, donationsRes] = await Promise.all([
    listPosts(),
    listPromotions(),
    getSubscriberStats(),
    listCommentsForAdmin("pending"),
    supabase.from("donations").select("id", { count: "exact", head: true }),
  ]);

  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const live = promotions.filter((p) => isCurrentlyLive(p));
  const clicks = promotions.reduce((n, p) => n + p.clicks, 0);
  const totalViews = posts.reduce((n, p) => n + (p.viewCount ?? 0), 0);
  const donations = donationsRes.error ? 0 : (donationsRes.count ?? 0);

  const recent = posts.slice(0, 8);
  const attention = [
    pendingComments.length > 0 && {
      href: "/admin/comments?status=pending",
      label: `${pendingComments.length} comment${pendingComments.length === 1 ? "" : "s"} awaiting moderation`,
      Icon: MessageSquare,
    },
    scheduled.length > 0 && {
      href: "/admin/posts",
      label: `${scheduled.length} scheduled post${scheduled.length === 1 ? "" : "s"}`,
      Icon: Clock,
    },
    drafts.length > 0 && {
      href: "/admin/posts",
      label: `${drafts.length} draft${drafts.length === 1 ? "" : "s"} unpublished`,
      Icon: FileText,
    },
    subscribers.pending > 0 && {
      href: "/admin/subscribers",
      label: `${subscribers.pending} subscriber${subscribers.pending === 1 ? "" : "s"} pending confirmation`,
      Icon: Mail,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    Icon: typeof FileText;
  }[];

  const stats = [
    { label: "Published", value: published.length, href: "/admin/posts", hint: "live stories" },
    { label: "Drafts", value: drafts.length, href: "/admin/posts", hint: "in progress" },
    { label: "Subscribers", value: subscribers.subscribed, href: "/admin/subscribers", hint: "confirmed" },
    {
      label: "Pending comments",
      value: pendingComments.length,
      href: "/admin/comments?status=pending",
      hint: "to review",
    },
    { label: "Live promotions", value: live.length, href: "/admin/promotions", hint: "on site now" },
    { label: "Promo clicks", value: clicks, href: "/admin/promotions", hint: "all time" },
    { label: "Story views", value: totalViews, href: "/admin/posts", hint: "tracked" },
    { label: "Donations", value: donations, href: "/admin/donations", hint: "recorded" },
  ];

  const shortcuts = [
    { href: "/admin/posts/new", label: "New post", Icon: Plus, primary: true },
    { href: "/admin/newsletter", label: "Send newsletter", Icon: Mail },
    { href: "/admin/promotions/new", label: "New promotion", Icon: Megaphone },
    { href: "/admin/comments?status=pending", label: "Moderate", Icon: MessageSquare },
    { href: "/admin/media", label: "Media library", Icon: ImageIcon },
    { href: "/admin/donations", label: "Donations", Icon: HandCoins },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Editorial overview — content, audience, and what needs attention.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex min-h-11 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Link>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, hint }) => (
          <Link
            key={label}
            href={href}
            className="bg-card p-5 transition-colors duration-150 hover:bg-muted/40"
          >
            <dt className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </dt>
            <dd data-numeric className="mt-1 font-display text-3xl tabular-nums">
              {value.toLocaleString("en-NG")}
            </dd>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </Link>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <AlertCircle className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="font-display text-lg">Needs attention</h2>
          </div>
          {attention.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              Nothing queued — all clear for now.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {attention.map(({ href, label, Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex min-h-12 items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-muted/40"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1">{label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-lg">Quick actions</h2>
          </div>
          <ul className="grid gap-px bg-border sm:grid-cols-2">
            {shortcuts.map(({ href, label, Icon, primary }) => (
              <li key={href} className="bg-card">
                <Link
                  href={href}
                  className={cn(
                    "flex min-h-14 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/40",
                    primary && "font-medium text-primary",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-display text-lg">Recent posts</h2>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary-hover"
          >
            All posts
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No posts yet.</p>
            <Link
              href="/admin/posts/new"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:text-primary-hover"
            >
              Write the first story
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-normal">Title</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Views</th>
                  <th className="px-5 py-3 font-normal">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {post.title}
                      </Link>
                      {post.authorName && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{post.authorName}</p>
                      )}
                    </td>
                    <td className={cn("px-3 py-3 capitalize", statusTone(post.status))}>
                      {post.status}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground" data-numeric>
                      {(post.viewCount ?? 0).toLocaleString("en-NG")}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatPostDateShort(post.updatedAt) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pendingComments.length > 0 && (
        <section className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="font-display text-lg">Latest comments to review</h2>
            <Link
              href="/admin/comments?status=pending"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover"
            >
              Open queue
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {pendingComments.slice(0, 5).map((c) => (
              <li key={c.id} className="px-5 py-4">
                <p className="text-sm font-medium">{c.authorName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.postTitle ? `On “${c.postTitle}” · ` : ""}
                  {formatPostDateShort(c.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
