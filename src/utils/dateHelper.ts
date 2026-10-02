import { NewsArticle } from '../types';

/**
 * Parses article publish time into an epoch timestamp in milliseconds.
 * Supports ISO date strings, Indonesian relative time strings ("Baru saja", "15 mnt lalu", "2 jam lalu"),
 * and standard numeric formats.
 */
export function parsePublishedAt(publishedAt?: string): number {
  if (!publishedAt) return 0;

  const trimmed = publishedAt.trim().toLowerCase();

  if (trimmed === 'baru saja' || trimmed === 'just now' || trimmed === 'live') {
    return Date.now();
  }

  // Check for Indonesian minutes: "15 menit lalu", "42 mnt lalu"
  const minMatch = trimmed.match(/(\d+)\s*(?:menit|mnt|min|m)\s*lalu/i) || trimmed.match(/(\d+)\s*(?:minutes?|mins?|m)\s*ago/i);
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10);
    return Date.now() - mins * 60 * 1000;
  }

  // Check for hours: "1 jam lalu", "3 jam lalu"
  const hrMatch = trimmed.match(/(\d+)\s*(?:jam|j|h)\s*lalu/i) || trimmed.match(/(\d+)\s*(?:hours?|hrs?|h)\s*ago/i);
  if (hrMatch) {
    const hours = parseInt(hrMatch[1], 10);
    return Date.now() - hours * 3600 * 1000;
  }

  // Check for days: "1 hari lalu", "2 hari lalu", "kemarin"
  if (trimmed === 'kemarin' || trimmed === 'yesterday') {
    return Date.now() - 24 * 3600 * 1000;
  }
  const dayMatch = trimmed.match(/(\d+)\s*(?:hari|d)\s*lalu/i) || trimmed.match(/(\d+)\s*(?:days?|d)\s*ago/i);
  if (dayMatch) {
    const days = parseInt(dayMatch[1], 10);
    return Date.now() - days * 24 * 3600 * 1000;
  }

  // Standard date parsing (ISO 8601, RFC 2822)
  const parsed = Date.parse(publishedAt);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return 0;
}

/**
 * Returns true if an article is considered fresh / breaking (under 60 minutes or breaking flag).
 */
export function isLatestArticle(article: NewsArticle): boolean {
  if (article.isBreaking) return true;
  const ts = parsePublishedAt(article.publishedAt);
  if (ts <= 0) return false;
  const diffMs = Date.now() - ts;
  return diffMs >= 0 && diffMs <= 60 * 60 * 1000; // Under 1 hour
}

/**
 * Sorts an array of news articles in strict Reverse-Chronological Order (newest first).
 */
export function sortArticlesChronological(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    // If one is marked breaking and published time is similar, give breaking priority
    if (a.isBreaking && !b.isBreaking) return -1;
    if (!a.isBreaking && b.isBreaking) return 1;

    const timeA = parsePublishedAt(a.publishedAt);
    const timeB = parsePublishedAt(b.publishedAt);
    return timeB - timeA;
  });
}
