import { NewsArticle, UserProfile, NewsCategory } from '../types';
import { CURATED_NEWS, FALLBACK_WORLD_NEWS } from '../data/newsData';

// Map between Indonesian NewsCategory and backend/API categories
const CATEGORY_MAP: Record<string, string> = {
  'politik': 'politik',
  'ekonomi': 'bisnis',
  'teknologi': 'teknologi',
  'energi': 'energi',
  'sains': 'sains',
  'pertahanan': 'pertahanan',
  'budaya': 'budaya',
  'olahraga': 'budaya',
  'kesehatan': 'sains',
  'dunia': 'umum'
};

export async function fetchLiveNews(params: {
  country?: string;
  category?: string;
  q?: string;
  provider?: string;
  apiKey?: string;
}): Promise<NewsArticle[]> {
  try {
    const url = new URL('/api/news', window.location.origin);
    if (params.country) url.searchParams.set('country', params.country);
    if (params.category && params.category !== 'all') {
      const mapped = CATEGORY_MAP[params.category.toLowerCase()] || params.category.toLowerCase();
      url.searchParams.set('category', mapped);
    }
    if (params.q) url.searchParams.set('q', params.q);
    if (params.provider) url.searchParams.set('provider', params.provider);
    if (params.apiKey) url.searchParams.set('apiKey', params.apiKey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        return data.articles.map((item: any) => normalizeArticle(item));
      }
    }
  } catch (err) {
    console.warn('Live news API request error, using curated database:', err);
  }

  // Graceful fallback to rich curated database
  return getFallbackNews(params.country, params.category, params.q);
}

function normalizeArticle(item: any): NewsArticle {
  const cat = mapToNewsCategory(item.category);
  return {
    id: item.id || `live-${Math.random().toString(36).substring(2, 9)}`,
    countryName: item.countryName || 'Global',
    countryCode: item.countryCode || 'GL',
    title: item.title || 'Berita Terkini',
    titleEn: item.titleEn,
    summary: item.summary || '',
    summaryEn: item.summaryEn,
    fullContent: Array.isArray(item.content)
      ? item.content
      : typeof item.content === 'string'
        ? item.content.split('\n\n').filter(Boolean)
        : [item.summary || ''],
    fullContentEn: item.fullContentEn,
    category: cat,
    source: item.source || 'Warta Dunia',
    sourceUrl: item.sourceUrl || item.originalUrl || '#',
    originalUrl: item.originalUrl || item.sourceUrl || 'https://news.google.com',
    publishedAt: formatRelativeTime(item.publishedAt),
    readTimeMinutes: item.readTimeMinutes || 3,
    keyTakeaways: Array.isArray(item.keyTakeaways) && item.keyTakeaways.length > 0
      ? item.keyTakeaways
      : [
          'Berita terkini diverifikasi oleh pemantau kawat berita internasional.',
          'Dampak terhadap stabilitas kawasan dan sektor terkait terus dipantau.',
          'Rincian dan tindak lanjut tersedia pada laporan resmi sumber publikasi.'
        ],
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    sentiment: item.sentiment || (item.isBreaking ? 'urgent' : 'neutral'),
    author: item.author || item.source,
    isBreaking: !!item.isBreaking
  };
}

function mapToNewsCategory(cat: string): NewsCategory {
  if (!cat) return 'Dunia';
  const c = cat.toLowerCase();
  if (c.includes('bisnis') || c.includes('ekonomi') || c.includes('business')) return 'Ekonomi';
  if (c.includes('tekno') || c.includes('tech') || c.includes('ai')) return 'Teknologi';
  if (c.includes('politik') || c.includes('politic')) return 'Politik';
  if (c.includes('energi') || c.includes('energy') || c.includes('iklim')) return 'Energi';
  if (c.includes('sains') || c.includes('science')) return 'Sains';
  if (c.includes('pertahanan') || c.includes('defense') || c.includes('militer')) return 'Pertahanan';
  if (c.includes('budaya') || c.includes('culture') || c.includes('olahraga')) return 'Budaya';
  return 'Dunia';
}

function formatRelativeTime(rawDate?: string): string {
  if (!rawDate) return 'Baru saja';
  if (rawDate.includes('lalu') || rawDate.includes('ago') || rawDate.includes('Baru')) {
    return rawDate;
  }
  try {
    const diffMs = Date.now() - new Date(rawDate).getTime();
    if (isNaN(diffMs)) return 'Hari ini';
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 2) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  } catch {
    return 'Hari ini';
  }
}

function getFallbackNews(country?: string, category?: string, q?: string): NewsArticle[] {
  let pool: NewsArticle[] = [];

  if (country && CURATED_NEWS[country]) {
    pool = [...CURATED_NEWS[country]];
  } else {
    // Combine curated
    const allCurated = Object.values(CURATED_NEWS).flat();
    pool = [...allCurated, ...FALLBACK_WORLD_NEWS];
  }

  // Filter by category
  if (category && category !== 'all') {
    const targetCat = category.toLowerCase();
    pool = pool.filter((art) => art.category.toLowerCase().includes(targetCat) || targetCat.includes(art.category.toLowerCase()));
  }

  // Filter by query
  if (q && q.trim()) {
    const query = q.toLowerCase();
    pool = pool.filter(
      (art) =>
        art.title.toLowerCase().includes(query) ||
        art.summary.toLowerCase().includes(query) ||
        art.source.toLowerCase().includes(query)
    );
  }

  return pool.slice(0, 15);
}

// Personalized news feed based on user preferences
export function filterPersonalizedNews(allArticles: NewsArticle[], profile: UserProfile): {
  articles: NewsArticle[];
  matchedReasons: Record<string, string>;
} {
  const matchedReasons: Record<string, string> = {};
  const selectedCats = profile.selectedCategories.map((c) => c.toLowerCase());
  const followedTopics = profile.followedTopics.map((t) => t.toLowerCase());
  const preferredSources = profile.preferredSources.map((s) => s.toLowerCase());

  const scored = allArticles.map((art) => {
    let score = 0;
    let matchReason = '';

    // Check category match
    if (selectedCats.includes(art.category.toLowerCase())) {
      score += 40;
      matchReason = `Kategori pilihan: ${art.category}`;
    }

    // Check followed topics in title or summary
    for (const topic of followedTopics) {
      if (
        art.title.toLowerCase().includes(topic) ||
        art.summary.toLowerCase().includes(topic)
      ) {
        score += 60;
        matchReason = `Topik favorit Anda: "${topic}"`;
        break;
      }
    }

    // Check preferred source
    if (preferredSources.some((src) => art.source.toLowerCase().includes(src))) {
      score += 25;
      if (!matchReason) {
        matchReason = `Sumber pilihan Anda: ${art.source}`;
      }
    }

    if (art.isBreaking) {
      score += 30;
      if (!matchReason) matchReason = 'Breaking News';
    }

    return { art, score, matchReason: matchReason || 'Tren Dunia Terkini' };
  });

  // Sort descending by match score
  scored.sort((a, b) => b.score - a.score);

  const articles = scored.map((item) => {
    matchedReasons[item.art.id] = item.matchReason;
    return item.art;
  });

  return { articles, matchedReasons };
}
