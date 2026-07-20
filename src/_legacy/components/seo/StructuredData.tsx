import { useEffect } from "react";

interface ArticleStructuredDataProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  author: {
    name: string;
    url?: string;
  };
  publishedTime: string;
  modifiedTime?: string;
  category?: string;
  tags?: string[];
}

interface OrganizationStructuredDataProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  socialProfiles?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface BlogStructuredDataProps {
  name?: string;
  description?: string;
  url?: string;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

export const ArticleStructuredData = ({
  title,
  description,
  image,
  url,
  author,
  publishedTime,
  modifiedTime,
  category,
  tags,
}: ArticleStructuredDataProps) => {
  useEffect(() => {
    const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
    const fullImage = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : `${SITE_URL}/logos/saflogo.png`;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      image: fullImage,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: {
        "@type": "Person",
        name: author.name,
        ...(author.url && { url: author.url }),
      },
      publisher: {
        "@type": "Organization",
        name: "Stephen Akintayo Foundation",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logos/saflogo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": fullUrl,
      },
      ...(category && { articleSection: category }),
      ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
    };

    addStructuredData(schema, "article-schema");
  }, [title, description, image, url, author, publishedTime, modifiedTime, category, tags]);

  return null;
};

export const OrganizationStructuredData = ({
  name = "Stephen Akintayo Foundation",
  url = SITE_URL,
  logo = `${SITE_URL}/logos/saflogo.png`,
  description = "The Stephen Akintayo Foundation is dedicated to creating lasting change through education, sustainable development, and community empowerment.",
  socialProfiles,
}: OrganizationStructuredDataProps) => {
  useEffect(() => {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      url,
      logo,
      description,
    };

    if (socialProfiles) {
      const sameAs: string[] = [];
      if (socialProfiles.facebook) sameAs.push(socialProfiles.facebook);
      if (socialProfiles.twitter) sameAs.push(socialProfiles.twitter);
      if (socialProfiles.instagram) sameAs.push(socialProfiles.instagram);
      if (socialProfiles.linkedin) sameAs.push(socialProfiles.linkedin);
      if (sameAs.length > 0) {
        schema.sameAs = sameAs;
      }
    }

    addStructuredData(schema, "organization-schema");
  }, [name, url, logo, description, socialProfiles]);

  return null;
};

export const BreadcrumbStructuredData = ({ items }: BreadcrumbStructuredDataProps) => {
  useEffect(() => {
    const fullItems = items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: fullItems,
    };

    addStructuredData(schema, "breadcrumb-schema");
  }, [items]);

  return null;
};

export const BlogStructuredData = ({
  name = "Stephen Akintayo Foundation Blog",
  description = "Stories of impact, insights on development, and updates from the Stephen Akintayo Foundation",
  url = `${SITE_URL}/blog`,
}: BlogStructuredDataProps) => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name,
      description,
      url,
      publisher: {
        "@type": "Organization",
        name: "Stephen Akintayo Foundation",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logos/saflogo.png`,
        },
      },
    };

    addStructuredData(schema, "blog-schema");
  }, [name, description, url]);

  return null;
};

function addStructuredData(schema: object, id: string) {
  // Remove existing schema with same id
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Add new schema
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

