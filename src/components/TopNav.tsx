import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Moon,
  Sun,
  Calendar,
  Bookmark,
  List,
  X,
  Bell,
  Sparkles,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import { CountryInfo, UserProfile } from '../types';
import { COUNTRIES_DATA } from '../data/countries';

interface TopNavProps {
  onSelectCountry: (country: CountryInfo) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenEconomicCalendar: () => void;
  onOpenSavedArticles: () => void;
  onOpenCountryList: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenForYou: () => void;
  onOpenAIChat: () => void;
  unreadNotificationsCount: number;
  userProfile: UserProfile;
  autoRotate: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSelectCountry,
  theme,
  onToggleTheme,
  onOpenEconomicCalendar,
  onOpenSavedArticles,
  onOpenCountryList,
  onOpenProfile,
  onOpenNotifications,
  onOpenForYou,
  onOpenAIChat,
  unreadNotificationsCount,
  userProfile,
  autoRotate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const allCountries = Object.values(COUNTRIES_DATA);

  const suggestions = searchQuery.trim()
    ? allCountries
        .filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.nameId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.capital.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: CountryInfo) => {
    onSelectCountry(country);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-3 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+8px)] pb-2 max-w-5xl mx-auto flex flex-col gap-2 pointer-events-auto">
      {/* Top Search & Actions Row */}
      <div className="flex items-center gap-2">
        {/* Brand mark on desktop */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 text-slate-100 shrink-0">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-orange-300 bg-clip-text text-transparent">
            Globe Berita
          </span>
        </div>

        {/* Search Bar with Autocomplete */}
        <div ref={searchContainerRef} className="relative flex-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30 shadow-lg text-slate-100 transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20">
            <Search className="w-4 h-4 text-cyan-400 flex-none opacity-80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Cari negara (Indonesia, AS, Jepang, Inggris)..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-[#090f26]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/80">
              {suggestions.map((country) => (
                <div
                  key={country.id}
                  onClick={() => handleSelect(country)}
                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-cyan-500/15 cursor-pointer active:bg-cyan-500/25 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{country.flag}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{country.nameId}</p>
                      <p className="text-[10px] text-slate-400">
                        {country.capital} • {country.continent}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-400">Buka Berita &rarr;</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Menu Action Buttons */}
        <div className="flex items-center gap-1.5 flex-none">
          {/* AI News Analyst Chatbot Button */}
          <button
            type="button"
            onClick={onOpenAIChat}
            title="Tanya Analis Berita Global AI (Gemini 3.1 Pro & 3.5 Flash)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-500/15 active:scale-95 transition"
            aria-label="Analis Berita Global AI"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Tanya Gemini</span>
            <span className="sm:hidden text-[10px]">AI</span>
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            title="Pusat Pemberitahuan Berita"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-92 transition"
            aria-label="Pemberitahuan"
          >
            <Bell className="w-4 h-4 text-cyan-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-bounce">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfile}
            title={`Profil: ${userProfile.name}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400 text-slate-200 flex items-center justify-center shadow-lg active:scale-92 transition text-base"
            aria-label="Profil Pengguna"
          >
            <span>{userProfile.avatar || '🌐'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-92 transition"
            aria-label="Tema Tampilan"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Navigation Category Bar */}
      <div className="flex items-center justify-between gap-1.5 px-1 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 active:scale-95 transition shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI Analis</span>
          </button>

          <button
            type="button"
            onClick={onOpenForYou}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/25 hover:from-orange-500/35 hover:to-amber-500/35 border border-orange-500/40 text-[11px] font-bold text-orange-300 active:scale-95 transition shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>Untuk Anda</span>
          </button>

          <button
            type="button"
            onClick={onOpenCountryList}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white active:scale-95 transition"
          >
            <List className="w-3 h-3 text-cyan-400" />
            <span>Katalog</span>
          </button>

          <button
            type="button"
            onClick={onOpenEconomicCalendar}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white active:scale-95 transition"
          >
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>Kalender</span>
          </button>

          <button
            type="button"
            onClick={onOpenSavedArticles}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white active:scale-95 transition"
          >
            <Bookmark className="w-3 h-3 text-orange-400" />
            <span>Tersimpan</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white active:scale-95 transition"
          >
            <SlidersHorizontal className="w-3 h-3 text-purple-400" />
            <span>Preferensi</span>
          </button>
        </div>

        {/* Status Indicator */}
        {autoRotate && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-semibold text-cyan-300 tracking-wide shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Berputar Otomatis</span>
          </span>
        )}
      </div>
    </header>
  );
};
