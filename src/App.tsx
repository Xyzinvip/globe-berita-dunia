import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GlobeCanvas } from './components/GlobeCanvas';
import { TopNav } from './components/TopNav';
import { LeftNavRail } from './components/LeftNavRail';
import { TrendingNewsPanel } from './components/TrendingNewsPanel';
import { BottomFilterDock, CategoryFilter, TimeRangeFilter } from './components/BottomFilterDock';
import { SelfCollapsingHelp } from './components/SelfCollapsingHelp';
import { NewsTourOverlay } from './components/NewsTourOverlay';
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
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { CountryInfo, NewsArticle, UserProfile } from './types';
import { getCountryInfo } from './data/countries';
import { getNewsForCountry, CURATED_NEWS, FALLBACK_WORLD_NEWS } from './data/newsData';
import { getUserProfile, getNotifications } from './utils/storage';
import { notificationService } from './services/notificationService';
import { fetchLiveNews } from './services/newsApi';
import { fetchUSGSEarthquakes, EarthquakeItem } from './services/earthquakeService';

const TOUR_COUNTRIES = [
  'Indonesia',
  'Amerika Serikat',
  'Jepang',
  'Inggris',
  'Tiongkok',
  'Jerman',
  'Ukraina',
  'Arab Saudi',
];

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Filters
  const [filterCategory, setFilterCategory] = useState<CategoryFilter>('Semua');
  const [filterTimeRange, setFilterTimeRange] = useState<TimeRangeFilter>('24j');

  // News Tour state
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStopIndex, setTourStopIndex] = useState<number>(0);

  // Live Data Layers (Fitur 5)
  const [showTerminator, setShowTerminator] = useState<boolean>(true);
  const [showEarthquakes, setShowEarthquakes] = useState<boolean>(false);
  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);

  // Modals & views
  const [showDailyBriefing, setShowDailyBriefing] = useState<boolean>(false);
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

  // Tour Country List
  const tourCountryList = useMemo(() => {
    return TOUR_COUNTRIES.map((c) => getCountryInfo(c)).filter(Boolean) as CountryInfo[];
  }, []);

  // News Tour auto-advance every 7 seconds
  useEffect(() => {
    if (!isTourActive || tourCountryList.length === 0) return;
    const interval = setInterval(() => {
      setTourStopIndex((prev) => (prev + 1) % tourCountryList.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isTourActive, tourCountryList.length]);

  const currentTourCountry =
    isTourActive && tourCountryList.length > 0 ? tourCountryList[tourStopIndex] : null;

  const tourHeadline = useMemo(() => {
    if (!currentTourCountry) return undefined;
    const list = getNewsForCountry(currentTourCountry.name, currentTourCountry.code);
    return list[0]?.title || 'Memantau perkembangan geopolitik dan ekonomi terbaru...';
  }, [currentTourCountry]);

  const tourCategory = useMemo(() => {
    if (!currentTourCountry) return undefined;
    const list = getNewsForCountry(currentTourCountry.name, currentTourCountry.code);
    return list[0]?.category || 'Dunia';
  }, [currentTourCountry]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch earthquakes when layer is toggled on
  useEffect(() => {
    if (showEarthquakes && earthquakes.length === 0) {
      fetchUSGSEarthquakes().then((data) => {
        if (data && data.length > 0) setEarthquakes(data);
      });
    }
  }, [showEarthquakes, earthquakes.length]);

  // Autonomous Screen Saver: Auto-trigger News Tour when idle for 28 seconds
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      // Only schedule idle tour when no modals, sheets, or readers are open
      if (
        !selectedCountry &&
        !selectedArticle &&
        !showDailyBriefing &&
        !showGeminiChat &&
        !showProfileModal &&
        !showNotificationsModal &&
        !showForYouFeed &&
        !showEconomicCalendar &&
        !showSavedArticles &&
        !showCountryList
      ) {
        idleTimer = setTimeout(() => {
          setIsTourActive(true);
        }, 28000);
      }
    };

    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [
    selectedCountry,
    selectedArticle,
    showDailyBriefing,
    showGeminiChat,
    showProfileModal,
    showNotificationsModal,
    showForYouFeed,
    showEconomicCalendar,
    showSavedArticles,
    showCountryList,
  ]);

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
        setShowDailyBriefing(false);
        setIsTourActive(false);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setAutoRotate((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        setShowGeminiChat((prev) => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        setShowDailyBriefing((prev) => !prev);
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
    if (country && isTourActive) {
      setIsTourActive(false);
    }
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
      {/* 3D Interactive World Globe (Full background Canvas with Day/Night & Earthquakes) */}
      <GlobeCanvas
        selectedCountry={selectedCountry}
        onSelectCountry={handleSelectCountry}
        autoRotate={autoRotate && !isTourActive}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        theme={theme}
        filterCategory={filterCategory}
        filterTimeRange={filterTimeRange}
        tourCountry={currentTourCountry}
        isTourActive={isTourActive}
        onToggleNewsTour={() => {
          setIsTourActive((prev) => {
            const next = !prev;
            if (next) {
              setSelectedCountry(null);
              setSelectedArticle(null);
            }
            return next;
          });
        }}
        showTerminator={showTerminator}
        onToggleTerminator={() => setShowTerminator((prev) => !prev)}
        showEarthquakes={showEarthquakes}
        onToggleEarthquakes={() => setShowEarthquakes((prev) => !prev)}
        earthquakes={earthquakes}
      />

      {/* Floating In-App Push Notification Alert Banner */}
      <InAppPushBanner onOpenArticle={handleOpenArticleById} />

      {/* Top Navigation: 1 sleek compact row */}
      <TopNav
        onSelectCountry={handleSelectCountry}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenNotifications={() => {
          setShowNotificationsModal(true);
          refreshUnreadCount();
        }}
        unreadNotificationsCount={unreadNotifCount}
        userProfile={userProfile}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenDailyBriefing={() => setShowDailyBriefing(true)}
      />

      {/* Vertical Left Icon Rail with Managed Tooltips */}
      <LeftNavRail
        onOpenForYou={() => setShowForYouFeed(true)}
        onOpenCountryList={() => setShowCountryList(true)}
        onOpenEconomicCalendar={() => setShowEconomicCalendar(true)}
        onOpenSavedArticles={() => setShowSavedArticles(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenDailyBriefing={() => setShowDailyBriefing(true)}
        isTourActive={isTourActive}
        onToggleNewsTour={() => {
          setIsTourActive((prev) => {
            const next = !prev;
            if (next) {
              setSelectedCountry(null);
              setSelectedArticle(null);
            }
            return next;
          });
        }}
      />

      {/* Live Breaking News Ticker */}
      {!selectedCountry && !isTourActive && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+68px)] left-14 sm:left-24 right-3.5 sm:right-84 max-w-xl mx-auto z-20 pointer-events-auto">
          <BreakingNewsTicker onSelectCountryName={handleSelectCountryByName} />
        </div>
      )}

      {/* Trending "Sedang Hangat" Panel (Floating Card on Desktop, Bottom Sheet on Mobile) */}
      {!selectedCountry && !isTourActive && (
        <TrendingNewsPanel
          articles={allArticles}
          onSelectArticle={handleOpenArticle}
          onFlyToCountryName={handleSelectCountryByName}
        />
      )}

      {/* Bottom Filter Dock (Merged Category & Time Range Chips) */}
      {!selectedCountry && !isTourActive && (
        <BottomFilterDock
          selectedCategory={filterCategory}
          onSelectCategory={setFilterCategory}
          selectedTimeRange={filterTimeRange}
          onSelectTimeRange={setFilterTimeRange}
        />
      )}

      {/* Self-Collapsing Navigation Prompt & Accessible Help */}
      {!selectedCountry && !isTourActive && <SelfCollapsingHelp />}

      {/* News Tour HUD Overlay */}
      <NewsTourOverlay
        isActive={isTourActive}
        currentStopIndex={tourStopIndex}
        totalStops={tourCountryList.length}
        country={currentTourCountry}
        headline={tourHeadline}
        category={tourCategory}
        onStopTour={() => setIsTourActive(false)}
        onOpenCountry={(c) => {
          setIsTourActive(false);
          handleSelectCountry(c);
        }}
        durationMs={7000}
      />

      {/* Single Consolidated AI Gateway: Draggable Holographic Mascot */}
      <AIAssistantWidget
        onOpenAIChat={() => setShowGeminiChat(true)}
        selectedCountry={selectedCountry}
      />

      {/* Country News Bottom Sheet Drawer (Docks to Right on Desktop) */}
      <CountryNewsSheet
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
        onOpenArticle={handleOpenArticle}
      />

      {/* In-App Direct Article Reader */}
      {selectedArticle && (
        <InAppArticleReader
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectRelatedArticle={(rel) => setSelectedArticle(rel)}
          relatedArticles={relatedArticles}
          onOpenAIChat={() => setShowGeminiChat(true)}
        />
      )}

      {/* Daily Briefing 60-Sec Audio Modal */}
      <DailyBriefingModal
        isOpen={showDailyBriefing}
        onClose={() => setShowDailyBriefing(false)}
        articles={allArticles}
        onFlyToCountry={handleSelectCountryByName}
        onOpenArticle={handleOpenArticle}
      />

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
      {showGeminiChat && (
        <GeminiChatModal
          isOpen={showGeminiChat}
          onClose={() => setShowGeminiChat(false)}
          activeCountry={selectedCountry}
          activeArticle={selectedArticle}
        />
      )}
    </div>
  );
}
