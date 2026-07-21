import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { confirmSubscription } from "@/app/newsletter/actions";

export const metadata: Metadata = {
  title: "Confirm subscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token } = await searchParams;
  const result = await confirmSubscription(token ?? null);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-xl px-4 py-20 sm:px-6">
        <h1 className="text-3xl md:text-4xl">
          {result.status === "success" ? "Subscription confirmed" : "Confirmation failed"}
        </h1>
        <p className="mt-4 text-muted-foreground">{result.message}</p>
        <p className="mt-8">
          <Link
            href="/blog"
            className="text-primary underline-offset-2 hover:underline"
          >
            Browse stories
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
