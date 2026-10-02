import React from 'react';

export type TimeRangeFilter = '24j' | '7h' | '30h';
export type CategoryFilter = 'Semua' | 'Ekonomi' | 'Politik' | 'Dunia' | 'Teknologi' | 'Sains';

interface BottomFilterDockProps {
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  selectedTimeRange: TimeRangeFilter;
  onSelectTimeRange: (range: TimeRangeFilter) => void;
}

const CATEGORIES: { id: CategoryFilter; label: string; dotColor?: string }[] = [
  { id: 'Semua', label: 'Semua' },
  { id: 'Ekonomi', label: 'Ekonomi', dotColor: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' },
  { id: 'Politik', label: 'Politik', dotColor: 'bg-purple-400 shadow-[0_0_6px_#a855f7]' },
  { id: 'Dunia', label: 'Dunia', dotColor: 'bg-rose-400 shadow-[0_0_6px_#ef4444]' },
  { id: 'Teknologi', label: 'Teknologi', dotColor: 'bg-emerald-400 shadow-[0_0_6px_#10b981]' },
  { id: 'Sains', label: 'Sains', dotColor: 'bg-cyan-400 shadow-[0_0_6px_#00F3FF]' },
];

const TIME_RANGES: { id: TimeRangeFilter; label: string }[] = [
  { id: '24j', label: '24j' },
  { id: '7h', label: '7h' },
  { id: '30h', label: '30h' },
];

export const BottomFilterDock: React.FC<BottomFilterDockProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedTimeRange,
  onSelectTimeRange,
}) => {
  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-[#0a0e17]/85 backdrop-blur-xl border border-cyan-500/25 shadow-[0_0_25px_rgba(0,243,255,0.12)] select-none pointer-events-auto max-w-[94vw] overflow-x-auto no-scrollbar"
      aria-label="Filter Berita & Rentang Waktu"
    >
      {/* Category Chips */}
      <div className="flex items-center gap-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat.dotColor && (
                <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`} />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-cyan-500/30 mx-1 flex-none" />

      {/* Time Range Chips */}
      <div className="flex items-center gap-1">
        {TIME_RANGES.map((rng) => {
          const isSelected = selectedTimeRange === rng.id;

          return (
            <button
              key={rng.id}
              type="button"
              onClick={() => onSelectTimeRange(rng.id)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-orange-500/25 border border-orange-400 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {rng.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
