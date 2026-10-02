import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Moon,
  Sun,
  X,
  Bell,
  Globe,
} from 'lucide-react';
import { CountryInfo, UserProfile } from '../types';
import { COUNTRIES_DATA } from '../data/countries';

interface TopNavProps {
  onSelectCountry: (country: CountryInfo) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSelectCountry,
  theme,
  onToggleTheme,
  onOpenNotifications,
  unreadNotificationsCount,
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
    <header className="fixed top-0 left-0 right-0 z-30 px-3 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-2 max-w-4xl mx-auto flex items-center gap-2 sm:gap-3 pointer-events-auto select-none">
      {/* Brand mark */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0a0e17]/85 backdrop-blur-xl border border-cyan-500/30 text-slate-100 shrink-0 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
        <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
        <span className="text-xs font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-orange-300 bg-clip-text text-transparent hidden sm:inline">
          Globe Berita
        </span>
      </div>

      {/* Search Bar with Autocomplete */}
      <div ref={searchContainerRef} className="relative flex-1">
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0a0e17]/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.1)] text-slate-100 transition-all focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,243,255,0.25)]">
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
              className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-[#090f26]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_25px_rgba(0,243,255,0.2)] overflow-hidden z-50 divide-y divide-slate-800/80">
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
                <span className="text-[10px] font-semibold text-cyan-400">Kunci Target &rarr;</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons: Notifications & Theme Toggle */}
      <div className="flex items-center gap-1.5 flex-none">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          title="Pusat Pemberitahuan Berita"
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0a0e17]/80 backdrop-blur-xl border border-cyan-500/30 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:scale-105 active:scale-95 transition-all"
          aria-label="Pemberitahuan"
        >
          <Bell className="w-4 h-4 text-cyan-400" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-bounce">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0a0e17]/80 backdrop-blur-xl border border-cyan-500/30 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:scale-105 active:scale-95 transition-all"
          aria-label="Tema Tampilan"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400" />
          )}
        </button>
      </div>
    </header>
  );
};
