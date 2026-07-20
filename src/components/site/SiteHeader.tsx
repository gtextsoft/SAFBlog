import Link from "next/link";
import Image from "next/image";

import { MobileNav } from "@/components/site/MobileNav";
import { NavLinks } from "@/components/site/NavLinks";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const NAV_ITEMS = [
  { href: "/blog", label: "Stories" },
  { href: "/about", label: "About" },
  { href: "/newsletter", label: "Newsletter" },
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logos/saflogo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <span className="hidden font-display text-lg font-semibold leading-none sm:block">
            Stephen Akintayo
            <span className="block text-eyebrow font-normal uppercase tracking-[0.14em] text-muted-foreground">
              Foundation
            </span>
          </span>
          <span className="sr-only">Stephen Akintayo Foundation — home</span>
        </Link>

        <NavLinks items={NAV_ITEMS} className="ml-auto hidden md:flex" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <MobileNav items={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}
