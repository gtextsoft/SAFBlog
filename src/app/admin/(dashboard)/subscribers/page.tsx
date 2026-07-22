import Link from "next/link";
import { Download, Users } from "lucide-react";

import {
  getSubscriberStats,
  listSubscribers,
  SUBSCRIBERS_PER_PAGE,
  type AdminSubscriber,
} from "@/lib/queries/admin-subscribers";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_FILTERS: { href: string; label: string; status?: AdminSubscriber["status"] }[] = [
  { href: "/admin/subscribers", label: "All" },
  { href: "/admin/subscribers?status=subscribed", label: "Subscribed", status: "subscribed" },
  { href: "/admin/subscribers?status=pending", label: "Pending", status: "pending" },
  {
    href: "/admin/subscribers?status=unsubscribed",
    label: "Unsubscribed",
    status: "unsubscribed",
  },
];

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page, status: rawStatus } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);
  const status = STATUS_FILTERS.find((f) => f.status === rawStatus)?.status;

  const [{ items, total, totalPages }, stats] = await Promise.all([
    listSubscribers(pageNumber, SUBSCRIBERS_PER_PAGE, status),
    getSubscriberStats(),
  ]);

  function pageHref(n: number) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/admin/subscribers?${qs}` : "/admin/subscribers";
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who signed up for the newsletter.
          </p>
        </div>

        {stats.subscribed + stats.pending + stats.unsubscribed > 0 && (
          <a
            href="/admin/subscribers/export"
            className="inline-flex min-h-11 items-center gap-2 rounded border border-border px-4 text-sm font-medium transition-colors duration-150 hover:border-rule-strong"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </a>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        {[
          ["Subscribed", stats.subscribed],
          ["Pending", stats.pending],
          ["Unsubscribed", stats.unsubscribed],
          ["Total", stats.subscribed + stats.pending + stats.unsubscribed],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-card p-4">
            <dt className="text-eyebrow uppercase text-muted-foreground">{label}</dt>
            <dd data-numeric className="mt-1 font-display text-2xl">
              {Number(value).toLocaleString("en-NG")}
            </dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Filter subscribers" className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = f.status === status || (!status && !f.status);
          return (
            <Link
              key={f.href}
              href={f.href}
              className={cn(
                "inline-flex min-h-9 items-center rounded border px-3 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary-subtle text-primary"
                  : "border-border text-muted-foreground hover:border-rule-strong hover:text-foreground",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">
            {status ? `No ${status} subscribers` : "No subscribers yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {status
              ? "Nothing in this filter right now."
              : "Sign-ups from the newsletter page and the site footer will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Newsletter subscribers, most recent first. Page {pageNumber} of {totalPages}.
              </caption>
              <thead>
                <tr className="border-b border-border text-left">
                  {["Email", "Name", "Status", "Source", "Subscribed"].map((heading) => (
                    <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${subscriber.email}`}
                        className="text-primary transition-colors duration-150 hover:text-primary-hover"
                      >
                        {subscriber.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {subscriber.fullName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-sm border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                          subscriber.status === "subscribed" &&
                            "border-success/40 bg-success/10 text-success",
                          subscriber.status === "pending" &&
                            "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
                          subscriber.status === "unsubscribed" &&
                            "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{subscriber.source || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(subscriber.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Subscriber pages"
              className="mt-6 flex items-center justify-between gap-4"
            >
              <p className="text-sm text-muted-foreground">
                Page <span data-numeric>{pageNumber}</span> of{" "}
                <span data-numeric>{totalPages}</span>
                {total > 0 && (
                  <>
                    {" · "}
                    <span data-numeric>{total}</span> in this view
                  </>
                )}
              </p>
              <div className="flex gap-2">
                {pageNumber > 1 && (
                  <Link
                    href={pageHref(pageNumber - 1)}
                    className="inline-flex min-h-11 items-center rounded border border-border px-4 text-sm"
                  >
                    Previous
                  </Link>
                )}
                {pageNumber < totalPages && (
                  <Link
                    href={pageHref(pageNumber + 1)}
                    className="inline-flex min-h-11 items-center rounded border border-border px-4 text-sm"
                  >
                    Next
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
