import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Promotion artwork.
 *
 * Images we host (uploaded to Supabase storage) go through next/image and get
 * AVIF/WebP conversion and resizing.
 *
 * Images on someone else's domain are rendered with a plain <img>. next/image
 * would refuse them unless the host were whitelisted, and whitelisting `**`
 * would make this site an open image proxy — any third party could route
 * arbitrary files through our optimiser, consuming the quota and serving
 * their content from our origin. A sponsor's CDN URL is not worth that.
 *
 * Both paths reserve space with a fixed aspect ratio, so neither shifts the
 * layout when it loads.
 */

function isSelfHosted(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  try {
    return new URL(url).hostname === new URL(base).hostname;
  } catch {
    return false;
  }
}

export function PromotionImage({
  src,
  aspect,
  sizes,
  className,
}: {
  src: string;
  /** Tailwind aspect-ratio class, e.g. "aspect-[16/10]". */
  aspect: string;
  sizes: string;
  className?: string;
}) {
  const wrapper = cn("relative overflow-hidden rounded bg-muted", aspect, className);

  if (isSelfHosted(src)) {
    return (
      <div className={wrapper}>
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
