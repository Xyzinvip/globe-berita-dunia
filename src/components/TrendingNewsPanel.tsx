import React, { useState } from 'react';
import { Flame, ChevronRight, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { NewsArticle } from '../types';

interface TrendingNewsPanelProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onFlyToCountryName?: (countryName: string) => void;
}

export function getCategoryBadge(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ekonomi') || cat.includes('economy')) {
    return {
      dotColor: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
      textColor: 'text-amber-300',
      label: 'Ekonomi',
    };
  }
  if (cat.includes('politik') || cat.includes('politics')) {
    return {
      dotColor: 'bg-purple-400 shadow-[0_0_8px_#a855f7]',
      textColor: 'text-purple-300',
      label: 'Politik',
    };
  }
  if (cat.includes('teknologi') || cat.includes('tech')) {
    return {
      dotColor: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
      textColor: 'text-emerald-300',
      label: 'Teknologi',
    };
  }
  if (cat.includes('sains') || cat.includes('science')) {
    return {
      dotColor: 'bg-cyan-400 shadow-[0_0_8px_#00F3FF]',
      textColor: 'text-cyan-300',
      label: 'Sains',
    };
  }
  return {
    dotColor: 'bg-rose-400 shadow-[0_0_8px_#ef4444]',
    textColor: 'text-rose-300',
    label: 'Dunia',
  };
}

export const TrendingNewsPanel: React.FC<TrendingNewsPanelProps> = ({
  articles,
  onSelectArticle,
  onFlyToCountryName,
}) => {
  // Collapsed by default on small mobile screens to keep view clean, expanded on desktop
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Take top 5 news articles
  const trendingArticles = articles.slice(0, 5);

  const handleArticleClick = (article: NewsArticle) => {
    if (onFlyToCountryName && article.countryName) {
      onFlyToCountryName(article.countryName);
    }
    onSelectArticle(article);
  };

  return (
    <aside
      className={`fixed z-25 transition-all duration-300 select-none pointer-events-auto ${
        // Mobile layout: Bottom Sheet docked at bottom
        // Desktop layout (sm:): Floating glassmorphism card on the top right
        'bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:top-[calc(env(safe-area-inset-top,0px)+72px)] sm:right-6 w-full sm:max-w-xs'
      }`}
      aria-label="Berita Sedang Hangat"
    >
      <div className="rounded-t-3xl sm:rounded-2xl bg-[#0a0e17]/90 backdrop-blur-2xl border-t border-x sm:border border-cyan-500/30 shadow-[0_0_25px_rgba(0,243,255,0.12)] overflow-hidden transition-all duration-200 hover:border-cyan-500/40">
        {/* Mobile Drag / Swipe Pill Handle */}
        <div
          className="sm:hidden pt-2 pb-0.5 flex justify-center cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="w-10 h-1 rounded-full bg-slate-600/80 hover:bg-cyan-400 transition-colors" />
        </div>

        {/* Header with Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 sm:px-3.5 py-2.5 flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5 sm:gap-2">
            <span className="p-1 rounded-lg bg-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
              <Flame className="w-4 h-4 animate-pulse text-orange-400" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                <span>Sedang Hangat</span>
                <span className="sm:hidden text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-mono">
                  {trendingArticles.length} Isu
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                {trendingArticles.length} Isu Teratas Dunia
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 group-hover:text-white transition">
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Content list when expanded */}
        {!isCollapsed && (
          <div className="px-3 pb-3 sm:pb-3 space-y-1.5 border-t border-cyan-500/15 pt-2 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
            {trendingArticles.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Memuat isu terhangat...
              </p>
            ) : (
              trendingArticles.map((art) => {
                const badge = getCategoryBadge(art.category);

                return (
                  <div
                    key={art.id}
                    onClick={() => handleArticleClick(art)}
                    className="group/item flex items-center gap-2.5 p-2 rounded-xl bg-[#0f172a]/60 hover:bg-[#131f3b] border border-cyan-500/15 hover:border-cyan-400/40 cursor-pointer transition-all active:scale-[0.98]"
                    title={`${art.title} (${art.countryName}) - Klik untuk meluncur ke lokasi`}
                  >
                    {/* Category indicator dot */}
                    <span
                      className={`w-2 h-2 rounded-full flex-none ${badge.dotColor}`}
                    />

                    {/* Headline and Metadata */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 group-hover/item:text-cyan-200 transition-colors truncate">
                        {art.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-cyan-400 truncate max-w-[80px]">
                          {art.countryName}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{art.publishedAt}</span>
                        </span>
                      </div>
                    </div>

                    {/* Fly-to arrow */}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-cyan-300 group-hover/item:translate-x-0.5 transition-transform flex-none" />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
