import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  canonical?: string;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";
const DEFAULT_TITLE = "Stephen Akintayo Foundation - Empowering Communities";
const DEFAULT_DESCRIPTION =
  "The Stephen Akintayo Foundation is dedicated to creating lasting change through education, sustainable development, and community empowerment.";
const DEFAULT_IMAGE = `${SITE_URL}/logos/saflogo.png`;

export const SEOHead = ({
  title,
  description,
  image,
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  tags,
  canonical,
}: SEOHeadProps) => {
  const pageTitle = title ? `${title} | Stephen Akintayo Foundation` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageImage = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE;
  const pageUrl = url ? (url.startsWith("http") ? url : `${SITE_URL}${url}`) : SITE_URL;
  const canonicalUrl = canonical ? (canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`) : pageUrl;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", pageDescription);
    updateMetaTag("author", "Stephen Akintayo Foundation");

    // Open Graph tags
    updateMetaTag("og:title", pageTitle, "property");
    updateMetaTag("og:description", pageDescription, "property");
    updateMetaTag("og:image", pageImage, "property");
    updateMetaTag("og:url", pageUrl, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", "Stephen Akintayo Foundation", "property");

    if (type === "article") {
      if (author) updateMetaTag("article:author", author, "property");
      if (publishedTime) updateMetaTag("article:published_time", publishedTime, "property");
      if (modifiedTime) updateMetaTag("article:modified_time", modifiedTime, "property");
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          const tagElement = document.createElement("meta");
          tagElement.setAttribute("property", "article:tag");
          tagElement.setAttribute("content", tag);
          document.head.appendChild(tagElement);
        });
      }
    }

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:site", "@SAFoundation");
    updateMetaTag("twitter:title", pageTitle);
    updateMetaTag("twitter:description", pageDescription);
    updateMetaTag("twitter:image", pageImage);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);
  }, [pageTitle, pageDescription, pageImage, pageUrl, type, author, publishedTime, modifiedTime, tags, canonicalUrl]);

  return null;
};

