import React, { useState, useEffect } from 'react';
import { Radio, Crosshair, Terminal, X } from 'lucide-react';
import { CountryInfo } from '../types';

interface CyberTelemetryHUDProps {
  country: CountryInfo;
  onDismiss?: () => void;
}

export const CyberTelemetryHUD: React.FC<CyberTelemetryHUDProps> = ({
  country,
  onDismiss,
}) => {
  const fullText = [
    `SYS:// TARGET_ACQUIRED: [${country.nameId.toUpperCase()}] (${country.code})`,
    `> COORD: LAT ${country.center[1].toFixed(2)}° / LNG ${country.center[0].toFixed(2)}°`,
    `> CAPITAL: ${country.capital} | REGION: ${country.continent}`,
    `> POPULATION: ${country.population} | CURRENCY: ${country.currency.split(' ')[0]}`,
    `> SATELLITE TELEMETRY: LINK ESTABLISHED // 60 FPS`,
  ].join('\n');

  const [displayedLength, setDisplayedLength] = useState(0);

  // Typewriter typing animation
  useEffect(() => {
    setDisplayedLength(0);
    const speed = 14; // ms per char
    const interval = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev < fullText.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [country, fullText]);

  const displayedContent = fullText.slice(0, displayedLength);
  const isTyping = displayedLength < fullText.length;

  return (
    <div className="fixed top-[calc(env(safe-area-inset-top,0px)+86px)] left-3.5 right-3.5 sm:left-6 sm:right-auto sm:max-w-md z-30 pointer-events-auto animate-fadeIn select-none">
      <div className="relative rounded-2xl bg-[#070e1c]/90 backdrop-blur-xl border border-cyan-400/50 shadow-[0_0_25px_rgba(0,243,255,0.25)] p-3 text-cyan-300 font-mono text-[11px] leading-relaxed overflow-hidden">
        {/* Holographic Scanline Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 243, 255, 0.3) 0px, transparent 2px)',
          }}
        />

        {/* Top Telemetry Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#00F3FF]" />
            </span>
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-[10px] text-cyan-200">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>LOCK RETICLE // ACTIVE HUD</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-bold text-cyan-300 tracking-widest">
              {country.flag} {country.code}
            </span>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="p-1 hover:text-white text-cyan-400/70 active:scale-95 transition"
                aria-label="Tutup HUD"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Typed Lines Content */}
        <pre className="whitespace-pre-wrap font-mono text-[10px] sm:text-[11px] text-cyan-200/90 leading-tight">
          {displayedContent}
          <span
            className={`inline-block w-2 h-3.5 ml-0.5 align-middle bg-cyan-400 shadow-[0_0_8px_#00F3FF] ${
              isTyping ? 'animate-pulse' : 'animate-ping'
            }`}
          />
        </pre>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-cyan-500/20 text-[9px] text-cyan-400/80">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
            <span>REALTIME ORTHOGRAPHIC GEO-LOCK</span>
          </span>
          <span className="text-cyan-300 font-bold">MODE: CYBER_HUD</span>
        </div>
      </div>
    </div>
  );
};
