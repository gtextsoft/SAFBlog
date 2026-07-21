import Link from "next/link";

import { SubscribeForm } from "@/components/newsletter/SubscribeForm";
import { FooterPromotion } from "@/components/promotions/PromotionSlot";
import type { Promotion } from "@/lib/types/promotion";
import { CONTACT_EMAIL, SITE_NAME, SOCIAL_PROFILES } from "@/lib/seo/site";

/**
 * Site footer (presentational).
 *
 * Kept free of server-only data fetching so client boundaries like `error.tsx`
 * can still render it. Live footer promotions are loaded by `PublicFooter`.
 */
export function SiteFooter({ promotion = null }: { promotion?: Promotion | null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-lg font-semibold">{SITE_NAME}</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Creating lasting change through education, sustainable development, and community
              empowerment.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex min-h-11 items-center text-sm text-primary transition-colors duration-150 hover:text-primary-hover"
            >
              {CONTACT_EMAIL}
            </a>

            <div className="mt-6 max-w-sm">
              <h2 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
                Get new stories by email
              </h2>
              <SubscribeForm source="footer" layout="inline" className="mt-3" />
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
              Explore
            </h2>
            <ul className="mt-3 space-y-1">
              {[
                { href: "/blog", label: "All stories" },
                { href: "/search", label: "Search" },
                { href: "/about", label: "About the Foundation" },
                { href: "/contact", label: "Contact" },
                { href: "/newsletter", label: "Newsletter" },
                { href: "/donate", label: "Donate" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
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
              <h2 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
                Follow
              </h2>
              {SOCIAL_PROFILES.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {SOCIAL_PROFILES.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        rel="me noopener"
                        target="_blank"
                        className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        {new URL(url).hostname.replace(/^www\./, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Social links coming soon.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/donate"
              className="inline-flex min-h-11 items-center font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
            >
              Support our work
            </Link>
            <Link
              href="/feed.xml"
              className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-foreground"
            >
              RSS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
