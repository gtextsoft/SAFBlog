import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/lib/seo/site";
import type { Post, PostSummary } from "@/types/blog";

/**
 * schema.org builders.
 *
 * Everything here is rendered into the HTML on the server. The previous app
 * injected these from a useEffect, so a crawler that does not run JavaScript —
 * which is most AI crawlers — saw no structured data at all.
 *
 * Stable @ids let the separate nodes reference one another instead of
 * repeating themselves, which is what turns a pile of tags into an entity
 * graph search engines can actually resolve.
 */

const ORGANISATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const BLOG_ID = `${SITE_URL}/blog#blog`;

export function organisationSchema() {
  return {
    "@type": "NGO",
    "@id": ORGANISATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logos/saflogo.png"),
    },
    // Omitted entirely when unknown: a sameAs pointing at the wrong profile is
    // a worse signal than none, and the old footer shipped placeholder links.
    ...(SOCIAL_PROFILES.length > 0 && { sameAs: SOCIAL_PROFILES }),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: { "@id": ORGANISATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function blogSchema() {
  return {
    "@type": "Blog",
    "@id": BLOG_ID,
    url: absoluteUrl("/blog"),
    name: `${SITE_NAME} — Stories`,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: { "@id": ORGANISATION_ID },
  };
}

/** Rough word count of the article body, for `wordCount`. */
function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>~|-]/g, " ")
    .replace(/<[^>]+>/g, " ");

  return text.split(/\s+/).filter(Boolean).length;
}

/** Plain text of the body, for `articleBody`. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function blogPostingSchema(post: Post) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const body = toPlainText(post.content);

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title.slice(0, 110), // Google truncates beyond ~110 chars
    description: post.excerpt || undefined,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": BLOG_ID },
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    inLanguage: SITE_LANGUAGE,
    wordCount: countWords(post.content),
    // articleBody is what lets an answer engine quote the piece accurately
    // rather than reconstructing it from a snippet.
    articleBody: body,
    timeRequired: `PT${post.readingMinutes}M`,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.fullName,
          ...(post.author.slug && {
            url: absoluteUrl(`/author/${post.author.slug}`),
            "@id": `${SITE_URL}/author/${post.author.slug}#person`,
          }),
          ...(post.author.role && { jobTitle: post.author.role }),
          ...(post.author.bio && { description: post.author.bio }),
          ...((() => {
            const sameAs = [
              post.author.twitterUrl,
              post.author.linkedinUrl,
              post.author.websiteUrl,
            ].filter(Boolean);
            return sameAs.length > 0 ? { sameAs } : {};
          })()),
        }
      : { "@id": ORGANISATION_ID },
    publisher: { "@id": ORGANISATION_ID },
    ...(post.coverImageUrl && {
      image: { "@type": "ImageObject", url: post.coverImageUrl },
    }),
    ...(post.categories.length > 0 && {
      articleSection: post.categories.map((c) => c.name),
    }),
    ...(post.tags.length > 0 && { keywords: post.tags.map((t) => t.name).join(", ") }),
    // Marks the passage a voice assistant should read aloud.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".prose-editorial > p:first-of-type"],
    },
  };
}

export function faqPageSchema(faq: { question: string; answer: string }[], pageUrl: string) {
  if (faq.length === 0) return null;
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(pageUrl)}#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

/** Archive pages: describes the listing and what it contains. */
export function collectionSchema({
  name,
  description,
  url,
  posts,
}: {
  name: string;
  description?: string | null;
  url: string;
  posts: PostSummary[];
}) {
  return {
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(url)}#collection`,
    url: absoluteUrl(url),
    name,
    ...(description && { description }),
    inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  };
}

/**
 * Wrap nodes into a single @graph document.
 *
 * One script tag with cross-referenced @ids beats several disconnected ones —
 * it is how the crawler learns the article, the blog and the organisation are
 * the same entities rather than three unrelated mentions.
 */
export function jsonLdGraph(...nodes: (object | null | undefined)[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}
