import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { isCurrentlyLive, listPromotions } from "@/lib/queries/admin-promotions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const promotions = await listPromotions();
  const live = promotions.filter((p) => isCurrentlyLive(p));
  const impressions = promotions.reduce((n, p) => n + p.impressions, 0);
  const clicks = promotions.reduce((n, p) => n + p.clicks, 0);

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        {[
          ["Live promotions", live.length.toLocaleString("en-NG")],
          ["Promotion impressions", impressions.toLocaleString("en-NG")],
          ["Promotion clicks", clicks.toLocaleString("en-NG")],
        ].map(([label, value]) => (
          <div key={label} className="bg-card p-5">
            <dt className="text-eyebrow uppercase text-muted-foreground">{label}</dt>
            <dd data-numeric className="mt-1 font-display text-3xl">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-xl">Manage promotions</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Create sponsored placements, schedule when they run, and track how they perform.
        </p>
        <Link
          href="/admin/promotions"
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
        >
          Go to promotions
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Posts and subscribers are still managed in the previous admin app while they are being
        migrated. They will appear here once that work lands.
      </p>
    </div>
  );
}
