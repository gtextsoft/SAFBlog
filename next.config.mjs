/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig = {
  reactStrictMode: true,

  // TipTap HTML (and rare data-URL images) can exceed the default 1 MB Server Action limit.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  images: {
    // AVIF first, WebP as the fallback for older clients.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Cover images live in the `post-images` storage bucket.
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },

  async redirects() {
    return [
      // The old SPA served a stub at /sitemap.xml; app/sitemap.ts now owns it.
      // Kept explicit so any cached inbound link resolves rather than 404s.
    ];
  },
};

export default nextConfig;
