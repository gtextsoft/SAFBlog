import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PromotionForm } from "@/components/admin/PromotionForm";
import { getPromotion } from "@/lib/queries/admin-promotions";
import { updatePromotion } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await getPromotion(id);

  if (!promotion) notFound();

  // Bind the id server-side. Taking it from a hidden form field instead would
  // let a caller re-target the update at any row they could name.
  const action = updatePromotion.bind(null, promotion.id);

  return (
    <div>
      <Link
        href="/admin/promotions"
        className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Promotions
      </Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl">Edit promotion</h1>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Impressions</dt>
            <dd data-numeric>{promotion.impressions.toLocaleString("en-NG")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Clicks</dt>
            <dd data-numeric>{promotion.clicks.toLocaleString("en-NG")}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8">
        <PromotionForm
          action={action}
          promotion={promotion}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
