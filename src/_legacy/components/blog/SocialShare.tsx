import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Mail, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export const SocialShare = ({ url, title, description, className = "" }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const shareText = description ? `${title} - ${description}` : title;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log("Share cancelled");
      }
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className} animate-on-scroll`}>
      <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>

      {/* Native Share (mobile) */}
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="gap-2"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}

      {/* Twitter */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="gap-2 group"
        aria-label="Share on Twitter"
      >
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            window.open(shareLinks.twitter, "_blank", "width=550,height=420");
          }}
        >
          <Twitter className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span className="hidden sm:inline">Twitter</span>
        </a>
      </Button>

      {/* Facebook */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="gap-2"
        aria-label="Share on Facebook"
      >
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            window.open(shareLinks.facebook, "_blank", "width=550,height=420");
          }}
        >
          <Facebook className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span className="hidden sm:inline">Facebook</span>
        </a>
      </Button>

      {/* LinkedIn */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="gap-2"
        aria-label="Share on LinkedIn"
      >
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            window.open(shareLinks.linkedin, "_blank", "width=550,height=420");
          }}
        >
          <Linkedin className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
      </Button>

      {/* Email */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="gap-2"
        aria-label="Share via Email"
      >
        <a href={shareLinks.email}>
          <Mail className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span className="hidden sm:inline">Email</span>
        </a>
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-2"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </Button>
    </div>
  );
};

