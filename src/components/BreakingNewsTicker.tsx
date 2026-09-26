import React, { useState, useEffect } from 'react';
import { Radio, ChevronRight } from 'lucide-react';
import { BREAKING_ALERTS } from '../data/newsData';
import { BreakingAlert } from '../types';

interface BreakingNewsTickerProps {
  onSelectCountryName?: (countryName: string) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  onSelectCountryName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_ALERTS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const currentAlert: BreakingAlert = BREAKING_ALERTS[currentIndex];

  return (
    <div
      onClick={() => {
        if (onSelectCountryName && currentAlert) {
          onSelectCountryName(currentAlert.country);
        }
      }}
      className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-xl border border-cyan-500/25 shadow-lg max-w-xl mx-auto w-full transition active:scale-98 hover:border-cyan-400/50"
    >
      <div className="flex items-center gap-1.5 flex-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
          KILAS
        </span>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-xs text-slate-200 truncate font-medium group-hover:text-white transition">
          <span className="font-bold text-cyan-400 mr-1.5">[{currentAlert.country}]:</span>
          {currentAlert.headline}
        </p>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 flex-none" />
    </div>
  );
};
