import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Article body.
 *
 * Rendered on the server, so the prose is in the HTML source for crawlers
 * and AI answer engines rather than appearing after hydration.
 *
 * `remarkGfm` was missing before: tables, strikethrough, task lists and
 * autolinks were silently dropped, even though the editor toolbar emits
 * strikethrough syntax. Tables matter here beyond correctness — they are one
 * of the most reliably extractable formats for AI answer engines.
 *
 * Raw HTML stays disabled (no rehype-raw), so post content cannot inject
 * markup. Keep it that way unless sanitisation is added alongside.
 */
export function PostBody({ content }: { content: string }) {
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

            // External links from post content: open in a new tab and deny
            // the new page access to window.opener.
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },

          img({ src, alt }) {
            if (typeof src !== "string") return null;

            // Explicit dimensions plus an aspect-ratio wrapper: an in-body
            // image without reserved space is a direct CLS hit.
            return (
              <span className="relative my-6 block aspect-[16/9] overflow-hidden rounded">
                <Image src={src} alt={alt ?? ""} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
              </span>
            );
          },

          // Wrap tables so a wide one scrolls inside its own box instead of
          // forcing the whole page to scroll sideways on mobile.
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
