import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/site";

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
          backgroundColor: "#FFFFFF",
          color: "#1F2937",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 28, height: 4, backgroundColor: "#C9A227" }} />
          <div
            style={{
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#C9A227",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Publication
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#111827",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#64748B",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#1F2937",
              fontFamily: "system-ui, sans-serif",
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            Stories, insights, and ideas shaping the future of business, leadership, innovation,
            and impact.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#94A3B8",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {SITE_URL.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size,
  );
}
