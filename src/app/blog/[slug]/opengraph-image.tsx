import { ImageResponse } from "next/og";

import { getPostBySlug } from "@/lib/queries/posts";
import { SITE_NAME } from "@/lib/seo/site";

export const alt = "Stephen Akintayo Foundation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-post social card.
 *
 * The old site put the same logo on every share, which is why links to
 * individual articles all looked identical in a timeline. This renders the
 * headline, so a shared link says what it is.
 *
 * Deliberately typographic rather than compositing the cover photo: text over
 * an arbitrary uploaded image regularly ends up unreadable, and there is no
 * art direction step to catch it.
 */
// `params` is a Promise in the App Router. Typing it as a plain object
// silently yields `undefined` for slug, which falls through to the generic
// card on every post — the exact bug this file exists to fix.
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? SITE_NAME;
  const author = post?.author?.fullName ?? SITE_NAME;
  const minutes = post?.readingMinutes;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // Matches --background / --foreground in the light theme.
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

        <div
          style={{
            display: "flex",
            fontSize: title.length > 80 ? 56 : 68,
            lineHeight: 1.12,
            letterSpacing: -1.5,
            // ImageResponse has no line-clamp; the font-size step above keeps
            // long headlines inside the frame.
            maxHeight: 340,
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "#5B616E",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex" }}>{author}</div>
          {minutes ? (
            <>
              <div style={{ display: "flex" }}>·</div>
              <div style={{ display: "flex" }}>{minutes} min read</div>
            </>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
