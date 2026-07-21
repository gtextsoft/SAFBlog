import Image from "next/image";
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

export function PostBody({ content }: { content: string }) {
  if (looksLikeHtml(content)) {
    const clean = DOMPurify.sanitize(content, PURIFY);
    return (
      <div
        className="prose-editorial [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded [&_img]:rounded"
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
              <span className="relative my-6 block aspect-[16/9] overflow-hidden rounded">
                <Image
                  src={src}
                  alt={alt ?? ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                />
              </span>
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
