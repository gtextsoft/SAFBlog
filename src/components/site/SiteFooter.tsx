import Link from "next/link";

import { CONTACT_EMAIL, SITE_NAME, SOCIAL_PROFILES } from "@/lib/seo/site";

/**
 * Site footer.
 *
 * The old footer linked "Resources" entries that all pointed at /blog and
 * social icons that pointed at bare facebook.com / twitter.com. Placeholder
 * links are worse than none — they teach readers the footer is decorative —
 * so social links render only when real URLs are configured in lib/seo/site.
 */
export function SiteFooter() {
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
          </div>

          <nav aria-label="Footer">
            <h2 className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
              Explore
            </h2>
            <ul className="mt-3 space-y-1">
              {[
                { href: "/blog", label: "All stories" },
                { href: "/about", label: "About the Foundation" },
                { href: "/newsletter", label: "Newsletter" },
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
              <p className="mt-3 text-sm text-muted-foreground">
                Social links coming soon.
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <Link
            href="/feed.xml"
            className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-foreground"
          >
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
