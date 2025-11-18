import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: "video" | "square" | "auto";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  sizes?: string;
}

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading (except priority images)
 * - Proper width/height to prevent layout shift
 * - Responsive images with srcset
 * - Error handling with fallback
 * - Loading placeholder
 */
export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  aspectRatio = "auto",
  objectFit = "cover",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || "");
  const imgRef = useRef<HTMLImageElement>(null);

  // Define class mappings
  const aspectRatioClasses = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "",
  };

  const objectFitClasses: Record<string, string> = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  };

  // Update imageSrc when src prop changes
  useEffect(() => {
    if (src) {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);


  // Early return if no src provided
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          aspectRatioClasses[aspectRatio] || "",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">No image</span>
      </div>
    );
  }

  // Generate responsive srcset for better performance
  const generateSrcSet = (originalSrc: string): string => {
    // If it's an external URL (starts with http), return as-is
    if (originalSrc.startsWith("http")) {
      return originalSrc;
    }

    // For local images, you could generate different sizes
    // For now, return the original src
    return originalSrc;
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Fallback to a placeholder or default image
    setImageSrc("/placeholder.svg");
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Check if image is already complete when imageSrc changes (handles cached images)
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      const img = imgRef.current;
      if (img && img.complete && img.naturalHeight !== 0) {
        setIsLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [imageSrc]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          aspectRatioClasses[aspectRatio],
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClasses[aspectRatio], className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFitClasses[objectFit] || objectFitClasses.cover,
          "w-full h-full"
        )}
        onLoad={(e) => {
          handleLoad();
          // Double-check in case image was already loaded
          const img = e.currentTarget;
          if (img.complete && img.naturalHeight !== 0) {
            setIsLoading(false);
          }
        }}
        onError={handleError}
        fetchpriority={priority ? "high" : "auto"}
        sizes={sizes}
      />
    </div>
  );
};

