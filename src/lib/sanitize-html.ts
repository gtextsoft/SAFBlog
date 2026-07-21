import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * Sanitize TipTap / CMS HTML for public render.
 *
 * Uses sanitize-html (pure Node) instead of isomorphic-dompurify/jsdom, which
 * crashes on Vercel with ERR_REQUIRE_ESM.
 */
export function sanitizePostHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "iframe",
      "figure",
      "figcaption",
      "span",
      "div",
      "section",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel", "class"],
      img: ["src", "alt", "title", "width", "height", "loading", "class", "style"],
      iframe: [
        "src",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
        "scrolling",
        "class",
        "style",
        "title",
      ],
      "*": ["class", "style", "id"],
      td: ["colspan", "rowspan", "style", "class"],
      th: ["colspan", "rowspan", "style", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const isInternal = href.startsWith("/") || href.startsWith("#");
        if (isInternal) {
          return { tagName, attribs };
        }
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "noopener noreferrer",
            target: "_blank",
          },
        };
      },
    },
  });
}

/** Ensure images stay responsive in article prose. */
export function withReadableImages(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    let next = attrs;
    if (!/\bstyle\s*=/i.test(next)) {
      next += ` style="max-width:100%;height:auto;display:block;margin:1.5em 0"`;
    }
    if (!/\bloading\s*=/i.test(next)) {
      next += ` loading="lazy"`;
    }
    if (!/\balt\s*=/i.test(next)) {
      next += ` alt=""`;
    }
    return `<img${next}>`;
  });
}
