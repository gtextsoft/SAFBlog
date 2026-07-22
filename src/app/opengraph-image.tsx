import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social card.
 *
 * Applies to every route that does not define its own — the homepage, /about,
 * /newsletter and the archives. Without it those shares render as a bare text
 * link, and the homepage is the most-shared URL on the site.
 *
 * Deliberately matches the per-post card in app/blog/[slug]/opengraph-image.tsx
 * so a timeline of shared links reads as one publication.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FCFBF7",
          color: "#16181D",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, backgroundColor: "#1F49AC" }} />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#5B616E",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 58, lineHeight: 1.12, letterSpacing: -1.5 }}>
            Stories of education, empowerment, and lasting change
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#5B616E",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Education · Sustainable development · Community empowerment
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#5B616E",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          blog.stephenakintayofoundation.org
        </div>
      </div>
    ),
    size,
  );
}
