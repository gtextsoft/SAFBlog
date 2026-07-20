import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PromotionForm } from "@/components/admin/PromotionForm";
import { createPromotion } from "../actions";

export default function NewPromotionPage() {
  return (
    <div>
      <Link
        href="/admin/promotions"
        className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Promotions
      </Link>

      <h1 className="mt-2 font-display text-3xl">New promotion</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Saved as a draft unless you set the status to active. Nothing appears on the site until
        it is active and inside its schedule.
      </p>

      <div className="mt-8">
        <PromotionForm action={createPromotion} submitLabel="Create promotion" />
      </div>
    </div>
  );
}
