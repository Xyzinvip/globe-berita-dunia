import React, { useEffect, useState } from 'react';
import { AppNotification } from '../types';
import { notificationService } from '../services/notificationService';
import { COUNTRIES_DATA } from '../data/countries';
import { BellRing, X, ArrowRight } from 'lucide-react';

interface InAppPushBannerProps {
  onOpenArticle: (articleId: string) => void;
}

export const InAppPushBanner: React.FC<InAppPushBannerProps> = ({ onOpenArticle }) => {
  const [currentNotif, setCurrentNotif] = useState<AppNotification | null>(null);

  useEffect(() => {
    const unsub = notificationService.onInAppAlert((notif) => {
      setCurrentNotif(notif);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!currentNotif) return;
    const timer = setTimeout(() => {
      setCurrentNotif(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [currentNotif]);

  if (!currentNotif) return null;

  const country = Object.values(COUNTRIES_DATA).find(
    (c) => c.name.toLowerCase() === currentNotif.countryName.toLowerCase() || c.code === currentNotif.countryCode
  );
  const flag = country?.flag || '🌍';

  return (
    <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-3 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        onClick={() => {
          onOpenArticle(currentNotif.articleId);
          setCurrentNotif(null);
        }}
        className="pointer-events-auto max-w-lg w-full bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 rounded-2xl p-3.5 border border-cyan-500/40 shadow-2xl backdrop-blur-xl flex items-start gap-3 cursor-pointer hover:border-cyan-400 transition-all hover:scale-[1.01] active:scale-[0.99] group"
        role="alert"
        aria-live="assertive"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-500/30 transition-colors">
          <BellRing className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium tracking-wide mb-1">
            <span className="text-sm">{flag}</span>
            <span>{currentNotif.countryName}</span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-orange-400 font-semibold uppercase tracking-wider text-[10px]">
              {currentNotif.urgency === 'breaking' ? 'Breaking News' : currentNotif.category}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-cyan-200 transition-colors">
            {currentNotif.summary}
          </h4>

          <div className="flex items-center gap-1.5 mt-2 text-xs text-cyan-400 font-medium">
            <span>Baca sekarang</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentNotif(null);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
          title="Tutup pemberitahuan"
          aria-label="Tutup pemberitahuan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
