import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  useEffect(() => {
    generateAndSetSitemap();
  }, []);

  const generateAndSetSitemap = async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://safoundation.org";
    const currentDate = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Blog -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Newsletter -->
  <url>
    <loc>${baseUrl}/newsletter</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- About -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Fetch published posts
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (posts) {
      posts.forEach((post) => {
        const lastmod = post.updated_at
          ? new Date(post.updated_at).toISOString().split("T")[0]
          : post.published_at
          ? new Date(post.published_at).toISOString().split("T")[0]
          : currentDate;
        xml += `
  <url>
    <loc>${baseUrl}/blog/${encodeURIComponent(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    // Fetch categories
    const { data: categories } = await supabase.from("categories").select("slug");

    if (categories) {
      categories.forEach((category) => {
        xml += `
  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(category.slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });
    }

    // Fetch tags
    const { data: tags } = await supabase.from("tags").select("slug");

    if (tags) {
      tags.forEach((tag) => {
        xml += `
  <url>
    <loc>${baseUrl}/tag/${encodeURIComponent(tag.slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
      });
    }

    xml += `
</urlset>`;

    // Set content type and return XML
    document.contentType = "application/xml";
    
    // For Vite/React Router, we'll need to handle this differently
    // The sitemap will be generated client-side and can be accessed via /sitemap.xml
    // In production, this should be handled server-side
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    
    // This is a workaround - in production, use a server route or static generation
    console.log("Sitemap XML generated. In production, serve this as /sitemap.xml");
  };

  return null;
};

export default Sitemap;

