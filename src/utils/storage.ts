import { NewsArticle, UserProfile, AppNotification, NewsCategory } from '../types';

const BOOKMARKS_KEY = 'globe_berita_bookmarks';
const USER_PROFILE_KEY = 'globe_berita_user_profile';
const NOTIFICATIONS_KEY = 'globe_berita_notifications';

export const ALL_CATEGORIES: NewsCategory[] = [
  'Politik',
  'Ekonomi',
  'Teknologi',
  'Energi',
  'Sains',
  'Pertahanan',
  'Dunia',
  'Kesehatan',
  'Budaya',
  'Olahraga'
];

export const POPULAR_SOURCES: string[] = [
  'Reuters',
  'Bloomberg',
  'BBC News',
  'Antara',
  'Kompas',
  'Financial Times',
  'The Wall Street Journal',
  'CNBC',
  'The Verge',
  'Al Jazeera',
  'Nikkei Asia',
  'Associated Press'
];

export const DEFAULT_TOPICS: string[] = [
  'Semikonduktor & AI',
  'Suku Bunga & Inflasi',
  'KTT Internasional',
  'Transisi Energi Bersih',
  'Mobil Listrik & Baterai',
  'Eksplorasi Antariksa',
  'Perdagangan Bebas'
];

export const AVATAR_OPTIONS = [
  { id: 'analyst', label: 'Analis Global', emoji: '🌐' },
  { id: 'reporter', label: 'Jurnalis Lapangan', emoji: '🎙️' },
  { id: 'investor', label: 'Ekonom & Investor', emoji: '📈' },
  { id: 'tech', label: 'Inovator Teknologi', emoji: '⚡' },
  { id: 'diplomat', label: 'Diplomat Dunia', emoji: '🏛️' },
  { id: 'curious', label: 'Pengamat Bebas', emoji: '🧭' }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Pembaca Dunia',
  avatar: '🌐',
  preferredLanguage: 'id',
  selectedCategories: ['Politik', 'Ekonomi', 'Teknologi', 'Energi', 'Sains'],
  followedTopics: ['Semikonduktor & AI', 'Suku Bunga & Inflasi', 'Transisi Energi Bersih'],
  preferredSources: ['Reuters', 'Bloomberg', 'Antara', 'BBC News', 'CNBC'],
  notificationsEnabled: true,
  breakingAlertsOnly: false,
  fontSizePreference: 'md',
  themePreference: 'dark',
  apiProvider: 'auto',
  customApiKey: '',
  lastActive: new Date().toISOString(),
  readArticlesCount: 0,
  savedArticlesCount: 0
};

// --- BOOKMARKS ---
export function getBookmarks(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(article: NewsArticle): boolean {
  try {
    const bookmarks = getBookmarks();
    if (!bookmarks.some((b) => b.id === article.id)) {
      bookmarks.unshift(article);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      updateProfileStats(0, bookmarks.length);
      return true;
    }
  } catch (err) {
    console.error('Error saving bookmark:', err);
  }
  return false;
}

export function removeBookmark(articleId: string): void {
  try {
    const bookmarks = getBookmarks().filter((b) => b.id !== articleId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    updateProfileStats(0, bookmarks.length);
  } catch (err) {
    console.error('Error removing bookmark:', err);
  }
}

export function isBookmarked(articleId: string): boolean {
  return getBookmarks().some((b) => b.id === articleId);
}

// --- USER PROFILE ---
export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_USER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile:', err);
  }
}

export function incrementReadCount(): void {
  try {
    const prof = getUserProfile();
    prof.readArticlesCount = (prof.readArticlesCount || 0) + 1;
    prof.lastActive = new Date().toISOString();
    saveUserProfile(prof);
  } catch (err) {
    console.error('Error incrementing read count:', err);
  }
}

function updateProfileStats(_readDelta: number, bookmarkCount: number): void {
  try {
    const prof = getUserProfile();
    prof.savedArticlesCount = bookmarkCount;
    saveUserProfile(prof);
  } catch {
    // Ignore
  }
}

// --- NOTIFICATIONS ---
export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotification(notif: AppNotification): void {
  try {
    const list = getNotifications();
    // Prevent duplicate notification IDs
    if (!list.some((n) => n.id === notif.id)) {
      list.unshift(notif);
      // Keep up to 40 latest
      const trimmed = list.slice(0, 40);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
    }
  } catch (err) {
    console.error('Error saving notification:', err);
  }
}

export function markNotificationAsRead(notifId: string): void {
  try {
    const list = getNotifications().map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error marking notification read:', err);
  }
}

export function markAllNotificationsAsRead(): void {
  try {
    const list = getNotifications().map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error marking all notifications read:', err);
  }
}

export function clearNotifications(): void {
  try {
    localStorage.removeItem(NOTIFICATIONS_KEY);
  } catch (err) {
    console.error('Error clearing notifications:', err);
  }
}
