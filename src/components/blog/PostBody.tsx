import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Article body.
 *
 * Supports legacy Markdown posts and newer TipTap HTML. HTML is sanitized
 * before render; Markdown still goes through react-markdown (no raw HTML).
 */
function looksLikeHtml(value: string): boolean {
  return /^<[a-z][\s\S]*>/i.test(value.trim());
}

const PURIFY = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "target", "rel"],
};

/** Ensure images in TipTap HTML stay visible even if Tailwind didn't see their classes. */
function withReadableImages(html: string): string {
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

export function PostBody({ content }: { content: string }) {
  if (looksLikeHtml(content)) {
    const clean = withReadableImages(DOMPurify.sanitize(content, PURIFY));
    return (
      <div
        className="prose-editorial [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  return (
    <div className="prose-editorial">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...props }) {
            const isInternal = href?.startsWith("/") || href?.startsWith("#");

            if (isInternal && href) {
              return (
                <Link href={href} {...props}>
                  {children}
                </Link>
              );
            }

            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },

          img({ src, alt }) {
            if (typeof src !== "string") return null;

            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt ?? ""}
                loading="lazy"
                className="my-6 w-full rounded"
                style={{ maxWidth: "100%", height: "auto", display: "block" }}
              />
            );
          },

          table({ children, ...props }) {
            return (
              <div className="my-6 overflow-x-auto">
                <table {...props}>{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
