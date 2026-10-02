import React, { useState, useEffect } from 'react';
import { Compass, Pause, ArrowRight, X } from 'lucide-react';
import { CountryInfo } from '../types';

interface NewsTourOverlayProps {
  isActive: boolean;
  currentStopIndex: number;
  totalStops: number;
  country: CountryInfo | null;
  headline?: string;
  category?: string;
  onStopTour: () => void;
  onOpenCountry: (country: CountryInfo) => void;
  durationMs?: number;
}

export const NewsTourOverlay: React.FC<NewsTourOverlayProps> = ({
  isActive,
  currentStopIndex,
  totalStops,
  country,
  headline,
  category,
  onStopTour,
  onOpenCountry,
  durationMs = 7000,
}) => {
  const [progress, setProgress] = useState(0);

  // Animate progress bar per stop
  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const start = performance.now();
    let animId: number;

    const frame = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);
      if (pct < 100 && isActive) {
        animId = requestAnimationFrame(frame);
      }
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [isActive, currentStopIndex, durationMs]);

  if (!isActive || !country) return null;

  return (
    <div className="fixed top-[calc(env(safe-area-inset-top,0px)+80px)] left-1/2 -translate-x-1/2 z-30 max-w-md w-[calc(100vw-32px)] pointer-events-auto select-none animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="relative rounded-2xl bg-[#070e1c]/90 backdrop-blur-xl border border-emerald-400/50 shadow-[0_0_30px_rgba(52,211,153,0.25)] p-3.5 text-slate-100 overflow-hidden">
        {/* Holographic Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </span>
            <span className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-emerald-300">
              MODE TUR BERITA [{currentStopIndex + 1}/{totalStops}]
            </span>
          </div>

          <button
            type="button"
            onClick={onStopTour}
            className="p-1 hover:text-rose-400 text-slate-400 rounded-lg hover:bg-slate-800 transition"
            title="Hentikan Tur Berita"
            aria-label="Hentikan Tur"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Country & Headline */}
        <div className="flex items-start gap-3">
          <span className="text-2xl select-none leading-none mt-0.5">
            {country.flag}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide truncate">
                {country.nameId || country.name}
              </h4>
              {category && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">
                  {category}
                </span>
              )}
            </div>
            {headline && (
              <p className="text-xs text-slate-200 mt-1 line-clamp-2 leading-snug">
                {headline}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-emerald-500/20 text-xs">
          <button
            type="button"
            onClick={onStopTour}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            <Pause className="w-3 h-3 text-emerald-400" />
            <span>Jeda Tur</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onStopTour();
              onOpenCountry(country);
            }}
            className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 transition group"
          >
            <span>Buka Berita Lengkap</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
