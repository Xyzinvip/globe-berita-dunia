import React, { useState } from 'react';
import {
  Sparkles,
  List,
  Calendar,
  Bookmark,
  SlidersHorizontal,
  Compass,
  Play,
  Pause,
} from 'lucide-react';

interface LeftNavRailProps {
  onOpenForYou: () => void;
  onOpenCountryList: () => void;
  onOpenEconomicCalendar: () => void;
  onOpenSavedArticles: () => void;
  onOpenProfile: () => void;
  isTourActive?: boolean;
  onToggleNewsTour?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  isActive?: boolean;
  accentColor?: string;
}

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  onOpenForYou,
  onOpenCountryList,
  onOpenEconomicCalendar,
  onOpenSavedArticles,
  onOpenProfile,
  isTourActive = false,
  onToggleNewsTour,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      id: 'for-you',
      label: 'Untuk Anda',
      sublabel: 'Rekomendasi Berita AI',
      icon: <Sparkles className="w-4 h-4 text-orange-400" />,
      onClick: onOpenForYou,
      accentColor: 'hover:border-orange-500/50 hover:shadow-orange-500/20',
    },
    {
      id: 'countries',
      label: 'Katalog Negara',
      sublabel: 'Daftar Wilayah Dunia',
      icon: <List className="w-4 h-4 text-cyan-400" />,
      onClick: onOpenCountryList,
      accentColor: 'hover:border-cyan-400/50 hover:shadow-cyan-500/20',
    },
    {
      id: 'calendar',
      label: 'Kalender Ekonomi',
      sublabel: 'Jadwal Rilis Pasar Global',
      icon: <Calendar className="w-4 h-4 text-amber-400" />,
      onClick: onOpenEconomicCalendar,
      accentColor: 'hover:border-amber-400/50 hover:shadow-amber-500/20',
    },
    {
      id: 'bookmarks',
      label: 'Tersimpan',
      sublabel: 'Koleksi Artikel Pilihan',
      icon: <Bookmark className="w-4 h-4 text-rose-400" />,
      onClick: onOpenSavedArticles,
      accentColor: 'hover:border-rose-400/50 hover:shadow-rose-500/20',
    },
    {
      id: 'preferences',
      label: 'Preferensi',
      sublabel: 'Profil & Minat Topik',
      icon: <SlidersHorizontal className="w-4 h-4 text-purple-400" />,
      onClick: onOpenProfile,
      accentColor: 'hover:border-purple-400/50 hover:shadow-purple-500/20',
    },
    ...(onToggleNewsTour
      ? [
          {
            id: 'news-tour',
            label: isTourActive ? 'Hentikan Tur' : 'Tur Berita',
            sublabel: isTourActive ? 'Kamera sedang mengorbit' : 'Eksplorasi Otomatis 60FPS',
            icon: isTourActive ? (
              <Pause className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Compass className="w-4 h-4 text-emerald-400" />
            ),
            onClick: onToggleNewsTour,
            isActive: isTourActive,
            badge: isTourActive ? 'LIVE' : undefined,
            accentColor: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20',
          },
        ]
      : []),
  ];

  return (
    <aside
      className="flex fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#0a0e17]/85 backdrop-blur-xl border border-cyan-500/25 shadow-[0_0_20px_rgba(0,243,255,0.1)] select-none pointer-events-auto"
      aria-label="Navigasi Utama"
    >
      {navItems.map((item) => {
        const isHovered = hoveredId === item.id;

        return (
          <div
            key={item.id}
            className="relative flex items-center"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              type="button"
              onClick={item.onClick}
              className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border ${
                item.isActive
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-[#0f172a]/70 border-cyan-500/20 text-slate-300 hover:text-white hover:bg-[#131d38] hover:scale-105'
              } ${item.accentColor || ''}`}
              aria-label={item.label}
            >
              {item.icon}

              {/* Pulsing beacon if active */}
              {item.isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* Managed Tooltip Popover */}
            {isHovered && (
              <div
                className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#070e1c]/95 backdrop-blur-xl border border-cyan-400/50 text-cyan-200 text-xs shadow-[0_0_20px_rgba(0,243,255,0.25)] whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                role="tooltip"
              >
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/60 text-[9px] text-emerald-300 font-extrabold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.sublabel}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};
