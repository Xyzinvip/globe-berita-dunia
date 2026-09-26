export type NewsCategory =
  | 'Politik'
  | 'Ekonomi'
  | 'Teknologi'
  | 'Sains'
  | 'Iklim'
  | 'Dunia'
  | 'Olahraga'
  | 'Kesehatan'
  | 'Pertahanan'
  | 'Energi'
  | 'Budaya';

export interface NewsArticle {
  id: string;
  countryName: string;
  countryCode: string; // ISO 2 or 3 letter
  title: string;
  titleEn?: string;
  summary: string;
  summaryEn?: string;
  fullContent: string[];
  fullContentEn?: string[];
  category: NewsCategory;
  source: string;
  sourceLogo?: string;
  sourceUrl?: string;
  originalUrl?: string;
  publishedAt: string; // e.g. "10 menit lalu", "2 jam lalu"
  readTimeMinutes: number;
  keyTakeaways: string[];
  imageUrl: string;
  sentiment?: 'positive' | 'neutral' | 'urgent';
  author?: string;
  isBreaking?: boolean;
}

export interface EconomicEvent {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  title: string;
  date: string;
  time: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast: string;
  previous: string;
  unit?: string;
  description: string;
}

export interface CountryInfo {
  id: string; // TopoJSON numeric id (e.g. "360")
  name: string; // Name in TopoJSON (e.g. "Indonesia")
  nameId: string; // Indonesian name
  flag: string; // Emoji flag
  code: string; // 2-letter alpha code
  capital: string;
  continent: string;
  population: string;
  currency: string;
  timezone: string;
  center: [number, number]; // [lng, lat]
  languages?: string;
  gdp?: string;
}

export interface BreakingAlert {
  id: string;
  headline: string;
  country: string;
  countryCode: string;
  urgency: 'breaking' | 'urgent' | 'update';
  timestamp: string;
  articleId?: string;
  category?: NewsCategory;
}

export interface UserProfile {
  name: string;
  avatar: string; // Avatar icon identifier or emoji
  preferredLanguage: 'id' | 'en' | 'all';
  selectedCategories: NewsCategory[];
  followedTopics: string[]; // Custom keywords (e.g. "Semikonduktor", "Bank Sentral")
  preferredSources: string[]; // e.g. ["Reuters", "Bloomberg", "Antara", "BBC"]
  notificationsEnabled: boolean;
  breakingAlertsOnly: boolean;
  fontSizePreference: 'sm' | 'md' | 'lg';
  themePreference: 'dark' | 'light' | 'system';
  apiProvider: 'auto' | 'gnews' | 'newsapi';
  customApiKey?: string;
  lastActive: string;
  readArticlesCount: number;
  savedArticlesCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  category: NewsCategory;
  countryName: string;
  countryCode: string;
  articleId: string;
  isRead: boolean;
  urgency: 'breaking' | 'high' | 'normal';
}
