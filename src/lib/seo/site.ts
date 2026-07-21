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
 * Social profiles, emitted as schema.org `sameAs`, tying this site to the
 * Foundation's established entity in the Knowledge Graph.
 *
 * Only include profiles belonging to the ORGANISATION. Stephen Akintayo's
 * personal profiles (Forbes Councils, LinkedIn, etc.) describe a Person, not
 * the NGO — listing them here asserts the two are the same entity, which is a
 * false claim. Those belong on a Person node, e.g. an author page.
 *
 * A wrong sameAs is worse than none: it can bind the site to the wrong entity.
 * Every URL here must be verified as officially the Foundation's.
 */
export const SOCIAL_PROFILES: string[] = [
  "https://www.facebook.com/stephenakintayofoundation/",
];

export const CONTACT_EMAIL = "info@stephenakintayofoundation.org";
