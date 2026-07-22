import Link from "next/link";

import { MobileNav } from "@/components/site/MobileNav";
import { NavLinks } from "@/components/site/NavLinks";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/category/business", label: "Business" },
  { href: "/category/entrepreneurship", label: "Entrepreneurship" },
  { href: "/category/real-estate", label: "Real Estate" },
  { href: "/category/technology", label: "Technology" },
  { href: "/category/leadership", label: "Leadership" },
  { href: "/category/lifestyle", label: "Lifestyle" },
  { href: "/category/interviews", label: "Interviews" },
  { href: "/category/brand-spotlight", label: "Brand Spotlight" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Site masthead.
 *
 * Server-rendered apart from the nav's active-state and the theme control, so
 * the header is present in the HTML source for crawlers rather than appearing
 * after hydration.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-7xl flex-col px-4 sm:px-6">
        <div className="flex h-[4.25rem] items-center gap-4 md:h-[4.75rem]">
          <Link href="/" className="group flex min-w-0 shrink-0 flex-col justify-center">
            <span className="font-display text-xl font-semibold leading-none tracking-tight md:text-2xl">
              {SITE_NAME}
            </span>
            <span className="mt-1 hidden text-[0.65rem] font-normal uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 group-hover:text-accent sm:block">
              {SITE_TAGLINE}
            </span>
            <span className="sr-only">
              {SITE_NAME} — {SITE_TAGLINE}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <MobileNav items={NAV_ITEMS} />
          </div>
        </div>

        <div className="hidden border-t border-border py-1 lg:block">
          <NavLinks items={NAV_ITEMS} className="flex flex-wrap justify-center gap-x-0.5" />
        </div>
      </div>
    </header>
  );
}
