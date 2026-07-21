import Link from "next/link";
import { Mail, Users } from "lucide-react";

import { CampaignForm } from "@/app/admin/(dashboard)/newsletter/CampaignForm";
import { isEmailConfigured } from "@/lib/email/resend";
import { getSubscriberStats } from "@/lib/queries/admin-subscribers";
import { createClient } from "@/lib/supabase/server";
import { formatPostDateShort } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const [stats, campaignsRes] = await Promise.all([
    getSubscriberStats(),
    supabase
      .from("newsletter_campaigns")
      .select("id, subject, sent_at, recipient_count, body")
      .order("sent_at", { ascending: false })
      .limit(20),
  ]);

  const campaigns = campaignsRes.data ?? [];
  const emailConfigured = isEmailConfigured();

  return (
    <div className="w-full space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">Newsletter</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Compose in Markdown with a live preview, then send to every confirmed subscriber.
          </p>
        </div>
        <Link
          href="/admin/subscribers"
          className="inline-flex min-h-11 items-center gap-2 rounded border border-border px-4 text-sm transition-colors hover:border-rule-strong"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Manage subscribers
        </Link>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        {[
          {
            label: "Will receive this send",
            value: stats.subscribed,
            hint: "confirmed subscribers",
          },
          {
            label: "Pending confirmation",
            value: stats.pending,
            hint: "not emailed yet",
          },
          {
            label: "Campaigns sent",
            value: campaigns.length,
            hint: "recent history below",
          },
        ].map(({ label, value, hint }) => (
          <div key={label} className="bg-card p-5">
            <dt className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </dt>
            <dd data-numeric className="mt-1 font-display text-3xl tabular-nums">
              {value.toLocaleString("en-NG")}
            </dd>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </dl>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="font-display text-xl">New campaign</h2>
        </div>
        <CampaignForm
          subscriberCount={stats.subscribed ?? 0}
          emailConfigured={emailConfigured}
        />
      </section>

      <section>
        <h2 className="font-display text-xl">Recent sends</h2>
        {campaigns.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            No campaigns sent yet. Your first send will appear here.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{c.subject}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {(c.body ?? "").replace(/^<!-- preheader:.*?-->\n?/, "").slice(0, 120) ||
                      "—"}
                  </p>
                </div>
                <p className="shrink-0 text-muted-foreground tabular-nums" data-numeric>
                  {c.recipient_count.toLocaleString("en-NG")} sent
                  {c.sent_at ? ` · ${formatPostDateShort(c.sent_at)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
