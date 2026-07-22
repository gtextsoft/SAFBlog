/**
 * Canonical site identity.
 *
 * The Vite app derived this from `window.location.origin`, which resolved to
 * "" outside the browser and silently became the preview domain on staging
 * deploys — producing canonicals that pointed at the wrong host. It is now a
 * build-time constant with a single source of truth.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://blog.stephenakintayofoundation.org";

export const SITE_NAME = "The Blueprint";

export const SITE_TAGLINE = "A Media Brand by Stephen Akintayo Productions";

/** Keep ~120–155 characters so SERP snippets and SEO audits accept it. */
export const SITE_DESCRIPTION =
  "Stories, insights, and ideas shaping the future of business, leadership, innovation, and impact — from The Blueprint by Stephen Akintayo Productions.";

export const SITE_LOCALE = "en_NG";

export const SITE_LANGUAGE = "en";

/** Resolve a path against the canonical origin. */
export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Social profiles, emitted as schema.org `sameAs`.
 *
 * Only include verified organisation profiles. A wrong sameAs is worse than
 * none: it can bind the site to the wrong entity.
 */
export const SOCIAL_PROFILES: string[] = [
  "https://www.facebook.com/stephenakintayofoundation/",
];

export const CONTACT_EMAIL = "info@stephenakintayofoundation.org";
