import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Compass,
  Users,
  Coins,
  BookOpen,
  Calendar,
  Info,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { CountryInfo, NewsArticle, NewsCategory } from '../types';
import { getNewsForCountry } from '../data/newsData';
import { getEconomicEventsForCountry } from '../data/economicCalendar';
import { fetchLiveNews } from '../services/newsApi';
import { sortArticlesChronological, isLatestArticle } from '../utils/dateHelper';

interface CountryNewsSheetProps {
  country: CountryInfo | null;
  onClose: () => void;
  onOpenArticle: (article: NewsArticle) => void;
  onOpenAIChat?: () => void;
}

export const CountryNewsSheet: React.FC<CountryNewsSheetProps> = ({
  country,
  onClose,
  onOpenArticle,
  onOpenAIChat,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'economic' | 'profile'>('news');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveArticles, setLiveArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live articles whenever country changes
  useEffect(() => {
    if (!country) return;
    let isMounted = true;
    const initialFallback = getNewsForCountry(country.name, country.code);
    setLiveArticles(initialFallback);
    setIsLoading(true);

    fetchLiveNews({ country: country.name })
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setLiveArticles(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live country news:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [country]);

  const economicEvents = useMemo(() => {
    if (!country) return [];
    return getEconomicEventsForCountry(country.name, country.currency.split(' ')[0]);
  }, [country]);

  const filteredArticles = useMemo(() => {
    const list = liveArticles.filter((art) => {
      const matchCategory = selectedCategory === 'Semua' || art.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
    // Strict Reverse-Chronological Order (newest timestamp at index 0)
    return sortArticlesChronological(list);
  }, [liveArticles, selectedCategory, searchQuery]);

  if (!country) return null;

  const categories: (NewsCategory | 'Semua')[] = [
    'Semua',
    'Ekonomi',
    'Politik',
    'Teknologi',
    'Sains',
    'Energi',
    'Dunia',
  ];

  return (
    <aside
      className="fixed inset-x-0 bottom-0 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:top-24 z-40 max-w-xl lg:max-w-md w-full mx-auto transition-transform duration-300 ease-out"
      aria-label={`Berita ${country.nameId}`}
    >
      <div className="bg-[#070d1e]/90 backdrop-blur-2xl border-t border-x lg:border border-cyan-500/35 rounded-t-[28px] lg:rounded-[28px] shadow-[0_0_35px_rgba(0,243,255,0.15)] flex flex-col h-[78vh] lg:h-full pb-[calc(env(safe-area-inset-bottom,0px)+12px)] overflow-hidden">
        {/* Drag handle on mobile */}
        <div className="w-10 h-1 rounded-full bg-slate-700/80 mx-auto mt-2.5 mb-1.5 flex-none lg:hidden" />

        {/* Sheet Header */}
        <div className="px-5 pt-2 pb-3 border-b border-slate-800/80 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none select-none drop-shadow-md">{country.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {country.nameId || country.name}
                </h2>
                {country.nameId !== country.name && (
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    ({country.name})
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  {country.capital}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  {country.population}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {country.currency.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-none">
            {isLoading && (
              <span title="Memperbarui berita...">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin mr-1" />
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 active:scale-95 transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 pt-2.5 pb-1 gap-2 flex-none">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition active:scale-98 ${
              activeTab === 'news'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Berita ({liveArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('economic')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition active:scale-98 ${
              activeTab === 'economic'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender ({economicEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition active:scale-98 ${
              activeTab === 'profile'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Profil</span>
          </button>
        </div>

        {/* Direct In-App Reader Header Badge */}
        <div className="px-4 py-1.5 flex items-center justify-between text-[11px] text-cyan-300 bg-cyan-950/30 border-y border-cyan-500/15">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Mode Baca Langsung: Berita disajikan tanpa keluar portal</span>
          </span>
          <span className="font-bold text-cyan-400">Live</span>
        </div>

        {/* Tab 1: News Feed */}
        {activeTab === 'news' && (
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {/* Category Filter Chips (Micro-interaction & Sci-Fi Glassmorphism) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 hover:scale-105 ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-400 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                      : 'bg-[#0a1226]/80 border border-cyan-500/20 text-slate-400 hover:text-slate-200 hover:border-cyan-400/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Articles List */}
            {filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold">Tidak ada berita ditemukan</p>
                <p className="text-xs text-slate-500 mt-1">
                  Coba pilih kategori lain atau reset pencarian.
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => {
                const isLive = article.isBreaking;
                const isLatest = !isLive && isLatestArticle(article);

                return (
                  <article
                    key={article.id}
                    onClick={() => onOpenArticle(article)}
                    className="p-3.5 rounded-2xl bg-[#0a1226]/75 hover:bg-[#0d1833] border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)] transition-all duration-200 cursor-pointer flex gap-3.5 items-start group active:scale-[0.99]"
                  >
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-20 h-20 rounded-xl object-cover flex-none bg-slate-800 border border-cyan-500/20 group-hover:border-cyan-400/40 transition-colors"
                      loading="lazy"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                        {/* Neon LIVE or LATEST Badge */}
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/60 text-[9px] font-extrabold text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.45)] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                            LIVE
                          </span>
                        ) : isLatest ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/60 text-[9px] font-extrabold text-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.4)] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            LATEST
                          </span>
                        ) : null}

                        <span className="font-semibold text-cyan-400">{article.source}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-300">{article.category}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{article.publishedAt}</span>
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[11px]">
                      <span className="text-cyan-400 font-medium group-hover:underline">
                        Buka bacaan native &rarr;
                      </span>
                      {article.originalUrl && (
                        <a
                          href={article.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 p-0.5"
                          title="Buka sumber asli di tab baru"
                        >
                          <span className="text-[10px]">Sumber</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
        )}

        {/* Tab 2: Economic Calendar */}
        {activeTab === 'economic' && (
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5">
            {economicEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Tidak ada jadwal rilis data minggu ini</p>
                <p className="text-xs text-slate-500 mt-1">
                  Data indikator makroekonomi untuk mata uang ini akan diperbarui segera.
                </p>
              </div>
            ) : (
              economicEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span className="font-bold text-white text-sm">{evt.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        evt.impact === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {evt.impact} Impact
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-2 leading-relaxed">{evt.description}</p>

                  <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sebelumnya</span>
                      <strong className="text-slate-300 font-semibold">{evt.previous}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Prakiraan</span>
                      <strong className="text-amber-400 font-semibold">{evt.forecast}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Aktual</span>
                      <strong className="text-cyan-400 font-semibold">{evt.actual || 'Menunggu'}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Country Profile */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Ibu Kota
                </span>
                <span className="text-sm font-semibold text-white">{country.capital}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Populasi
                </span>
                <span className="text-sm font-semibold text-white">{country.population}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Mata Uang
                </span>
                <span className="text-sm font-semibold text-white">{country.currency}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Zona Waktu
                </span>
                <span className="text-sm font-semibold text-white">{country.timezone}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Layers className="w-4 h-4" />
                <span>Navigasi Cepat Globe</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Ketuk di luar lembar ini atau seret ke bawah untuk kembali mengeksplorasi bola bumi. Geser globe untuk memilih negara lain di kawasan sekitarnya.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
