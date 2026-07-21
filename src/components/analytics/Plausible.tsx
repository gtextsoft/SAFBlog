import Script from "next/script";

/**
 * Plausible analytics. Only loads when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 */
export function Plausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
