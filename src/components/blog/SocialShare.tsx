"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Facebook, Linkedin, Mail, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Share controls for a post. Absolute URL is passed from the server so we
 * never fall back to window.location.origin (wrong host on previews).
 */
export function SocialShare({
  url,
  title,
  description,
  className,
}: {
  url: string;
  title: string;
  description?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const fullUrl = url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(description ? `${title} — ${description}` : title);

  const links = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: description || title, url: fullUrl });
    } catch {
      /* cancelled */
    }
  }

  const btn =
    "inline-flex h-9 items-center gap-1.5 rounded border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Share</span>
      {canNative && (
        <button type="button" onClick={() => void nativeShare()} className={btn} aria-label="Share">
          <Share2 className="h-3.5 w-3.5" />
        </button>
      )}
      <a href={links.twitter} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
        <span className="font-semibold">𝕏</span>
      </a>
      <a href={links.facebook} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Facebook">
        <Facebook className="h-3.5 w-3.5" />
      </a>
      <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on LinkedIn">
        <Linkedin className="h-3.5 w-3.5" />
      </a>
      <a href={links.email} className={btn} aria-label="Share by email">
        <Mail className="h-3.5 w-3.5" />
      </a>
      <button type="button" onClick={() => void copy()} className={btn} aria-label="Copy link">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
