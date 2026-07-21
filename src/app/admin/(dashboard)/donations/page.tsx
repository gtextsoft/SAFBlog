import { Heart } from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export default async function AdminDonationsPage() {
  const { supabase } = await requireRole("admin");

  const { data: donations } = await supabase
    .from("donations")
    .select("id, stripe_session_id, amount, currency, email, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl">Donations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Completed Stripe Checkout gifts (read-only).
        </p>
      </div>

      {!donations?.length ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">No donations yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Successful checkouts recorded by the Stripe webhook will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-eyebrow uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Amount</th>
                <th className="px-4 py-3 font-normal">Email</th>
                <th className="px-4 py-3 font-normal">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donations.map((d) => (
                <tr key={d.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium" data-numeric>
                    {formatAmount(d.amount, d.currency)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.email ?? "—"}</td>
                  <td className="max-w-[12rem] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                    {d.stripe_session_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
