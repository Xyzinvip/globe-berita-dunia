import React, { useState } from 'react';
import { NewsArticle, UserProfile } from '../types';
import { filterPersonalizedNews } from '../services/newsApi';
import {
  Sparkles,
  X,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Globe2,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { isBookmarked, saveBookmark, removeBookmark } from '../utils/storage';

interface PersonalizedFeedViewProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  userProfile: UserProfile;
  onSelectArticle: (article: NewsArticle) => void;
  onOpenProfile: () => void;
}

export const PersonalizedFeedView: React.FC<PersonalizedFeedViewProps> = ({
  isOpen,
  onClose,
  articles,
  userProfile,
  onSelectArticle,
  onOpenProfile
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'topics' | 'sources'>('all');
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const { articles: personalizedList, matchedReasons } = filterPersonalizedNews(
    articles,
    userProfile
  );

  const filtered = personalizedList.filter((art) => {
    if (filterMode === 'topics') {
      const followed = userProfile.followedTopics.map((t) => t.toLowerCase());
      return followed.some(
        (top) =>
          art.title.toLowerCase().includes(top) || art.summary.toLowerCase().includes(top)
      );
    }
    if (filterMode === 'sources') {
      const preferred = userProfile.preferredSources.map((s) => s.toLowerCase());
      return preferred.some((src) => art.source.toLowerCase().includes(src));
    }
    return true;
  });

  const toggleBookmark = (art: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = isBookmarked(art.id);
    if (current) {
      removeBookmark(art.id);
      setBookmarkedMap((prev) => ({ ...prev, [art.id]: false }));
    } else {
      saveBookmark(art);
      setBookmarkedMap((prev) => ({ ...prev, [art.id]: true }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="for-you-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xl">
              {userProfile.avatar || '✨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="for-you-title" className="text-base font-bold text-white">
                  Kabar Untuk Anda
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                  Personalisasi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Disusun khusus untuk <strong className="text-slate-200">{userProfile.name}</strong> berdasarkan preferensi Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Atur kategori dan topik favorit"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Ubah Minat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Interests Summary Chips */}
        <div className="px-5 py-2.5 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between gap-3 text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-xl font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-orange-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Semua ({personalizedList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('topics')}
              className={`px-3 py-1 rounded-xl font-medium transition-colors ${
                filterMode === 'topics'
                  ? 'bg-orange-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Topik Diikuti
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('sources')}
              className={`px-3 py-1 rounded-xl font-medium transition-colors ${
                filterMode === 'sources'
                  ? 'bg-orange-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Sumber Favorit
            </button>
          </div>

          <div className="text-[11px] text-slate-400 shrink-0 hidden md:block">
            {userProfile.followedTopics.slice(0, 3).join(' • ')}
          </div>
        </div>

        {/* Article Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Tag className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Belum ada artikel yang cocok dengan filter ini</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Coba tambahkan lebih banyak topik atau kategori di menu preferensi profil Anda.
              </p>
              <button
                type="button"
                onClick={onOpenProfile}
                className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Atur Kategori & Topik Sekarang</span>
              </button>
            </div>
          ) : (
            filtered.map((article) => {
              const bookmarked = bookmarkedMap[article.id] ?? isBookmarked(article.id);
              const reason = matchedReasons[article.id] || 'Rekomendasi Berita';

              return (
                <article
                  key={article.id}
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-orange-500/40 transition-all cursor-pointer flex flex-col sm:flex-row gap-3.5 group active:scale-[0.99]"
                >
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full sm:w-36 h-36 sm:h-28 rounded-xl object-cover bg-slate-800 shrink-0"
                    loading="lazy"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Reason & Category header */}
                      <div className="flex items-center gap-2 text-xs mb-1.5 text-slate-400">
                        <span className="text-orange-400 font-medium text-[11px] truncate">
                          {reason}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-cyan-400 font-semibold">{article.countryName}</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">{article.source}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{article.publishedAt}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(article, e)}
                          className={`p-1.5 rounded-lg border transition ${
                            bookmarked
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title={bookmarked ? 'Hapus Simpanan' : 'Simpan Berita'}
                          aria-label="Simpan Berita"
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span className="text-orange-400 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Baca</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filtered.length} artikel terpersonalisasi</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
