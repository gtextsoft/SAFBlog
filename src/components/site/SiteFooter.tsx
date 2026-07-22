import Link from "next/link";

import { SubscribeForm } from "@/components/newsletter/SubscribeForm";
import { FooterPromotion } from "@/components/promotions/PromotionSlot";
import { PRIMARY_NAV, TOPIC_NAV } from "@/components/site/SiteHeader";
import type { Promotion } from "@/lib/types/promotion";
import { CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE, SOCIAL_PROFILES } from "@/lib/seo/site";

/**
 * Site footer (presentational).
 *
 * Kept free of server-only data fetching so client boundaries like `error.tsx`
 * can still render it. Live footer promotions are loaded by `PublicFooter`.
 */
export function SiteFooter({ promotion = null }: { promotion?: Promotion | null }) {
  const year = new Date().getFullYear();

  const explore = [
    ...PRIMARY_NAV,
    { href: "/search", label: "Search" },
    ...TOPIC_NAV,
  ];

  return (
    <footer className="mt-24 border-t border-border bg-surface-sunken">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="h-0.5 w-10 bg-accent" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-semibold tracking-tight">{SITE_NAME}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {SITE_TAGLINE}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Stories, insights, and ideas shaping the future of business, leadership, innovation,
              and impact.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 inline-flex min-h-11 items-center text-sm text-primary transition-colors duration-150 hover:text-accent"
            >
              {CONTACT_EMAIL}
            </a>

            <div className="mt-8 max-w-sm">
              <h2 className="text-eyebrow uppercase tracking-[0.16em] text-accent">
                Get new stories by email
              </h2>
              <SubscribeForm source="footer" layout="inline" className="mt-3" />
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-eyebrow uppercase tracking-[0.16em] text-accent">Explore</h2>
            <ul className="mt-4 space-y-0.5">
              {explore.map(({ href, label }) => (
                <li key={`${href}-${label}`}>
                  <Link
                    href={href}
                    className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-8">
            {promotion && <FooterPromotion promotion={promotion} />}

            <div>
              <h2 className="text-eyebrow uppercase tracking-[0.16em] text-accent">Follow</h2>
              {SOCIAL_PROFILES.length > 0 ? (
                <ul className="mt-4 space-y-0.5">
                  {SOCIAL_PROFILES.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        rel="me noopener"
                        target="_blank"
                        className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        {new URL(url).hostname.replace(/^www\./, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Social links coming soon.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-8 text-sm text-muted-foreground">
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <nav aria-label="Legal and feeds" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/feed.xml"
              className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-foreground"
            >
              RSS
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
