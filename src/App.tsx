import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GlobeCanvas } from './components/GlobeCanvas';
import { TopNav } from './components/TopNav';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { CountryNewsSheet } from './components/CountryNewsSheet';
import { InAppArticleReader } from './components/InAppArticleReader';
import { EconomicCalendarView } from './components/EconomicCalendarView';
import { SavedArticlesView } from './components/SavedArticlesView';
import { CountryListView } from './components/CountryListView';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { PersonalizedFeedView } from './components/PersonalizedFeedView';
import { InAppPushBanner } from './components/InAppPushBanner';
import { GeminiChatModal } from './components/GeminiChatModal';
import { Bot, Sparkles } from 'lucide-react';
import { CountryInfo, NewsArticle, UserProfile } from './types';
import { getCountryInfo } from './data/countries';
import { getNewsForCountry, CURATED_NEWS, FALLBACK_WORLD_NEWS } from './data/newsData';
import { getUserProfile, getNotifications } from './utils/storage';
import { notificationService } from './services/notificationService';
import { fetchLiveNews } from './services/newsApi';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals & views
  const [showGeminiChat, setShowGeminiChat] = useState<boolean>(false);
  const [showEconomicCalendar, setShowEconomicCalendar] = useState<boolean>(false);
  const [showSavedArticles, setShowSavedArticles] = useState<boolean>(false);
  const [showCountryList, setShowCountryList] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showForYouFeed, setShowForYouFeed] = useState<boolean>(false);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  // Live pool of articles
  const [allArticles, setAllArticles] = useState<NewsArticle[]>(() => {
    const list = Object.values(CURATED_NEWS).flat();
    return [...list, ...FALLBACK_WORLD_NEWS];
  });

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Update unread notification count
  const refreshUnreadCount = useCallback(() => {
    const notifs = getNotifications();
    const unread = notifs.filter((n) => !n.isRead).length;
    setUnreadNotifCount(unread);
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount, showNotificationsModal]);

  // Load live news headlines initially in background
  useEffect(() => {
    fetchLiveNews({ q: 'dunia' })
      .then((live) => {
        if (live && live.length > 0) {
          setAllArticles((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newOnes = live.filter((a) => !existingIds.has(a.id));
            return [...newOnes, ...prev];
          });
        }
      })
      .catch((err) => {
        console.warn('Initial live news load error:', err);
      });
  }, []);

  // Handle article tap from notifications
  const handleOpenArticleById = useCallback(
    (articleId: string) => {
      const found = allArticles.find((a) => a.id === articleId);
      if (found) {
        setSelectedArticle(found);
        return;
      }
      // If not in current list, search curated
      const allCurated = Object.values(CURATED_NEWS).flat();
      const match = allCurated.find((a) => a.id === articleId);
      if (match) {
        setSelectedArticle(match);
      }
    },
    [allArticles]
  );

  useEffect(() => {
    const unsub = notificationService.onNotificationTap((articleId) => {
      handleOpenArticleById(articleId);
      refreshUnreadCount();
    });
    return unsub;
  }, [handleOpenArticleById, refreshUnreadCount]);

  // Periodic push notification simulation for preferred topics / categories
  useEffect(() => {
    if (!userProfile.notificationsEnabled) return;

    // Trigger initial notification after 8 seconds if never received
    const initialTimer = setTimeout(() => {
      const existing = getNotifications();
      if (existing.length === 0) {
        const pool = allArticles.filter((art) =>
          userProfile.selectedCategories.some(
            (c) => c.toLowerCase() === art.category.toLowerCase()
          )
        );
        const pick = pool[0] || allArticles[0];
        if (pick) {
          notificationService.sendArticleNotification(pick, 'breaking');
          refreshUnreadCount();
        }
      }
    }, 8000);

    // Periodic check every 3 minutes
    const interval = setInterval(() => {
      if (!userProfile.notificationsEnabled) return;
      const candidates = allArticles.filter((art) => art.isBreaking);
      const pick = candidates[Math.floor(Math.random() * candidates.length)] || allArticles[0];
      if (pick) {
        notificationService.sendArticleNotification(pick, 'breaking');
        refreshUnreadCount();
      }
    }, 180000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [userProfile.notificationsEnabled, userProfile.selectedCategories, allArticles, refreshUnreadCount]);

  // Keyboard navigation shortcuts for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setSelectedArticle(null);
        setSelectedCountry(null);
        setShowGeminiChat(false);
        setShowProfileModal(false);
        setShowNotificationsModal(false);
        setShowForYouFeed(false);
        setShowEconomicCalendar(false);
        setShowSavedArticles(false);
        setShowCountryList(false);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setAutoRotate((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        setShowGeminiChat((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        setShowProfileModal((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotificationsModal((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        setShowForYouFeed((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCountry = (country: CountryInfo | null) => {
    setSelectedCountry(country);
    if (country) {
      setAutoRotate(false);
    }
  };

  const handleSelectCountryByName = (name: string) => {
    const country = getCountryInfo(name);
    handleSelectCountry(country);
  };

  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return getNewsForCountry(selectedArticle.countryName, selectedArticle.countryCode);
  }, [selectedArticle]);

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${
        theme === 'dark' ? 'bg-[#02030a]' : 'bg-[#eef2fb]'
      }`}
    >
      {/* 3D Interactive World Globe (Full background Canvas) */}
      <GlobeCanvas
        selectedCountry={selectedCountry}
        onSelectCountry={handleSelectCountry}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        theme={theme}
      />

      {/* Floating In-App Push Notification Alert Banner */}
      <InAppPushBanner onOpenArticle={handleOpenArticleById} />

      {/* Top Navigation & Action Controls */}
      <TopNav
        onSelectCountry={handleSelectCountry}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenEconomicCalendar={() => setShowEconomicCalendar(true)}
        onOpenSavedArticles={() => setShowSavedArticles(true)}
        onOpenCountryList={() => setShowCountryList(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenNotifications={() => {
          setShowNotificationsModal(true);
          refreshUnreadCount();
        }}
        onOpenForYou={() => setShowForYouFeed(true)}
        onOpenAIChat={() => setShowGeminiChat(true)}
        unreadNotificationsCount={unreadNotifCount}
        userProfile={userProfile}
        autoRotate={autoRotate}
      />

      {/* Live Breaking News Ticker (under top nav) */}
      {!selectedCountry && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+86px)] left-3.5 right-3.5 max-w-xl mx-auto z-20 pointer-events-auto">
          <BreakingNewsTicker onSelectCountryName={handleSelectCountryByName} />
        </div>
      )}

      {/* Desktop Helper Bar at Bottom Left */}
      <div className="hidden lg:flex fixed bottom-5 left-6 z-20 items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 text-xs text-slate-400 pointer-events-auto">
        <span>Pintasan Desktop:</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-cyan-300">
          Spasi
        </kbd>
        <span>Putar</span>
        <span aria-hidden="true">·</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-cyan-400">
          C
        </kbd>
        <span>Tanya AI</span>
        <span aria-hidden="true">·</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-orange-300">
          P
        </kbd>
        <span>Profil</span>
        <span aria-hidden="true">·</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
          N
        </kbd>
        <span>Notif</span>
        <span aria-hidden="true">·</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">
          Esc
        </kbd>
        <span>Tutup</span>
      </div>

      {/* Floating Gemini AI Quick Launcher */}
      <button
        type="button"
        onClick={() => setShowGeminiChat(true)}
        className="fixed bottom-6 right-5 sm:bottom-7 sm:right-7 z-30 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-cyan-300/40 pointer-events-auto"
        title="Tanya Analis Berita Global AI (Gemini 3.1 & 3.5 - Tombol C)"
        aria-label="Tanya AI Gemini"
      >
        <div className="relative">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span className="tracking-wide">Tanya AI</span>
        {selectedCountry && (
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full border border-white/20 hidden sm:inline">
            {selectedCountry.flag} {selectedCountry.nameId}
          </span>
        )}
      </button>

      {/* Country News Bottom Sheet Drawer (Docks to Right on Desktop) */}
      <CountryNewsSheet
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
        onOpenArticle={handleOpenArticle}
        onOpenAIChat={() => setShowGeminiChat(true)}
      />

      {/* In-App Direct Article Reader (Native in-app reader without opening external tabs) */}
      {selectedArticle && (
        <InAppArticleReader
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectRelatedArticle={(rel) => setSelectedArticle(rel)}
          relatedArticles={relatedArticles}
          onOpenAIChat={() => setShowGeminiChat(true)}
        />
      )}

      {/* Standalone Economic Calendar View */}
      {showEconomicCalendar && (
        <EconomicCalendarView
          onClose={() => setShowEconomicCalendar(false)}
          onSelectCountry={(countryName) => {
            setShowEconomicCalendar(false);
            handleSelectCountryByName(countryName);
          }}
        />
      )}

      {/* Saved / Bookmarked Articles View */}
      {showSavedArticles && (
        <SavedArticlesView
          onClose={() => setShowSavedArticles(false)}
          onOpenArticle={(art) => {
            setShowSavedArticles(false);
            setSelectedArticle(art);
          }}
        />
      )}

      {/* World Countries Catalog / List View */}
      {showCountryList && (
        <CountryListView
          onClose={() => setShowCountryList(false)}
          onSelectCountry={(country) => {
            setShowCountryList(false);
            handleSelectCountry(country);
          }}
        />
      )}

      {/* Personalized 'Untuk Anda' Feed View */}
      <PersonalizedFeedView
        isOpen={showForYouFeed}
        onClose={() => setShowForYouFeed(false)}
        articles={allArticles}
        userProfile={userProfile}
        onSelectArticle={handleOpenArticle}
        onOpenProfile={() => {
          setShowForYouFeed(false);
          setShowProfileModal(true);
        }}
      />

      {/* User Profile Management Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={userProfile}
        onUpdateProfile={(updated) => {
          setUserProfile(updated);
        }}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onOpenArticle={handleOpenArticleById}
        availableArticles={allArticles}
      />

      {/* Gemini AI Multi-Turn Chatbot Modal */}
      <GeminiChatModal
        isOpen={showGeminiChat}
        onClose={() => setShowGeminiChat(false)}
        activeCountry={selectedCountry}
        activeArticle={selectedArticle}
      />
    </div>
  );
}
