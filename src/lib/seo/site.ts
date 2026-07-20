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

export const SITE_NAME = "Stephen Akintayo Foundation";

export const SITE_TAGLINE = "Empowering Communities";

export const SITE_DESCRIPTION =
  "Stories of impact, insights on development, and updates from the Stephen Akintayo Foundation — creating lasting change through education, sustainable development, and community empowerment.";

export const SITE_LOCALE = "en_NG";

export const SITE_LANGUAGE = "en";

/** Resolve a path against the canonical origin. */
export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Social profiles, emitted as schema.org `sameAs` to tie the site to the
 * organisation's external entities. Replace the placeholders that the old
 * footer shipped (bare facebook.com, twitter.com, …) with the real handles
 * before launch — a wrong sameAs is worse than none.
 */
export const SOCIAL_PROFILES: string[] = [];

export const CONTACT_EMAIL = "info@stephenakintayofoundation.org";
