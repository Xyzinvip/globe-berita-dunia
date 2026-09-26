import React, { useState, useEffect } from 'react';
import { Bookmark, ChevronLeft, Trash2, Clock, BookOpen } from 'lucide-react';
import { NewsArticle } from '../types';
import { getBookmarks, removeBookmark } from '../utils/storage';

interface SavedArticlesViewProps {
  onClose: () => void;
  onOpenArticle: (article: NewsArticle) => void;
}

export const SavedArticlesView: React.FC<SavedArticlesViewProps> = ({
  onClose,
  onOpenArticle,
}) => {
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeBookmark(id);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#050814] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <header className="px-4 py-3 bg-[#080d22]/90 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
          <span>Kembali ke Globe</span>
        </button>

        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Artikel Tersimpan ({bookmarks.length})</h2>
        </div>

        <div className="w-8" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full pb-[calc(env(safe-area-inset-bottom,0px)+32px)]">
        {bookmarks.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Belum Ada Berita Tersimpan</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Saat membaca artikel berita di dalam aplikasi, ketuk ikon bookmark untuk menyimpannya agar dapat dibaca kembali secara offline.
            </p>
          </div>
        ) : (
          bookmarks.map((art) => (
            <div
              key={art.id}
              onClick={() => onOpenArticle(art)}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer transition active:scale-[0.99] flex gap-3.5 items-center group"
            >
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-20 h-20 rounded-xl object-cover flex-none bg-slate-800 group-hover:scale-105 transition duration-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{art.countryName}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition">
                  {art.title}
                </h4>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span className="text-cyan-400">{art.source}</span>
                  <button
                    onClick={(e) => handleRemove(e, art.id)}
                    title="Hapus simpanan"
                    className="p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};
