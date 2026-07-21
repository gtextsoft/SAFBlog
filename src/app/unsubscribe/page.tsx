import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { UnsubscribeForm } from "@/components/newsletter/UnsubscribeForm";
import { PublicFooter } from "@/components/site/PublicFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CONTACT_EMAIL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from the Stephen Akintayo Foundation newsletter.",
  // Nothing to gain from indexing this, and an indexed unsubscribe page
  // invites accidental visits from search.
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto max-w-md px-4 py-16 sm:px-6 md:py-24">
        <div className="rounded-lg border border-border bg-card p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl">Unsubscribe</h1>

          {token ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                We&rsquo;re sorry to see you go. Confirm below and we&rsquo;ll stop emailing you.
              </p>
              <UnsubscribeForm token={token} email={email} />
            </>
          ) : (
            <>
              {/*
                Without a signed token there is nothing to authenticate the
                request. Letting someone type any address would let anyone
                unsubscribe anyone, so the link from the email is required.
              */}
              <p className="mt-2 text-sm text-muted-foreground">
                To unsubscribe, open the link at the bottom of any newsletter we&rsquo;ve sent you.
                That link carries a code confirming the address is yours.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Can&rsquo;t find one? Email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Unsubscribe`}
                  className="text-primary hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                and we&rsquo;ll remove you.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex min-h-11 items-center rounded border border-border px-5 text-sm font-medium transition-colors duration-150 hover:border-rule-strong"
              >
                Back to the homepage
              </Link>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
