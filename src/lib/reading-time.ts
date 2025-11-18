/**
 * Calculate reading time for a text string
 * Based on average reading speed of 200-250 words per minute
 * @param text - The text content to calculate reading time for
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Reading time in minutes (rounded up)
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  if (!text || text.trim().length === 0) {
    return 1; // Minimum 1 minute
  }

  // Remove markdown syntax and HTML tags for more accurate word count
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove markdown links but keep text
    .replace(/[#*_~`]/g, "") // Remove markdown formatting
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .trim();

  // Count words (split by whitespace and filter empty strings)
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time (round up)
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Format reading time as a human-readable string
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read" or "1 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

