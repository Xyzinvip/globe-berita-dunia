import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  X,
  ExternalLink,
  Sparkles,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { NewsArticle } from '../types';
import { getCategoryBadge } from './TrendingNewsPanel';

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  onFlyToCountry?: (countryName: string) => void;
  onOpenArticle?: (article: NewsArticle) => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose,
  articles,
  onFlyToCountry,
  onOpenArticle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Take top 5 key news items
  const keyPoints = articles.slice(0, 5);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSupported('speechSynthesis' in window);
    }
  }, []);

  // Cleanup speech synthesis when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSpeechIndex(null);
    }
  }, [isOpen]);

  // Construct audio script
  const buildAudioScript = () => {
    let script = 'Briefing harian enam puluh detik dari Globe Berita. ';
    keyPoints.forEach((point, idx) => {
      const order = ['Pertama', 'Kedua', 'Ketiga', 'Keempat', 'Kelima'][idx] || `Poin ${idx + 1}`;
      script += `${order}, dari ${point.countryName}. ${point.title}. ${point.summary || ''}. `;
    });
    script += 'Sekian ringkasan enam puluh detik hari ini. Pantau terus perkembangan geopolitik dunia di Globe Berita.';
    return script;
  };

  const handleStartAudio = () => {
    if (!speechSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const fullScript = buildAudioScript();
    const utterance = new SpeechSynthesisUtterance(fullScript);
    utteranceRef.current = utterance;

    // Indonesian language selection
    utterance.lang = 'id-ID';
    utterance.rate = 1.05; // Slightly faster for 60-second feel
    utterance.pitch = 1.0;

    // Try finding an Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setActiveSpeechIndex(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSpeechIndex(null);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSpeechIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseAudio = () => {
    if (speechSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStopAudio = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSpeechIndex(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
    >
      <div className="relative w-full max-w-2xl bg-[#0a0e1a]/95 border border-cyan-500/35 rounded-3xl shadow-[0_0_40px_rgba(0,243,255,0.18)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 backdrop-blur-2xl">
        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-none">
              <Headphones className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="briefing-title" className="text-base font-bold text-white tracking-wide">
                  Briefing 60 Detik AI
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
                  Live Audio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                5 Poin Berita Terpenting Dunia Hari Ini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition"
            aria-label="Tutup Briefing"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Player Controller Bar */}
        <div className="px-5 sm:px-6 py-3 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <button
                type="button"
                onClick={handleStartAudio}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isPaused ? 'Lanjutkan Audio' : 'Dengarkan Audio (60d)'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseAudio}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Jeda Audio</span>
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button
                type="button"
                onClick={handleStopAudio}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Hentikan Audio"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Audio Wave Visualizer Animation */}
            {isPlaying && (
              <div className="flex items-center gap-1 pl-2" aria-label="Audio sedang diputar">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0ms' }} />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-6" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '300ms' }} />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-5" style={{ animationDelay: '450ms' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: '600ms' }} />
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Web Speech API Synthesis</span>
          </div>
        </div>

        {/* Warning if Speech Synthesis not supported in current browser */}
        {!speechSupported && (
          <div className="mx-5 sm:mx-6 mt-3 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <VolumeX className="w-4 h-4 flex-none" />
            <span>Web Speech API tidak didukung pada browser ini. Anda dapat membaca ringkasan 5 poin berita di bawah.</span>
          </div>
        )}

        {/* 5 News Points List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          {keyPoints.map((point, idx) => {
            const badge = getCategoryBadge(point.category);
            const isHighlight = activeSpeechIndex === idx;

            return (
              <div
                key={point.id}
                className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border ${
                  isHighlight
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.15)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400/80">
                      0{idx + 1}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                    <span className={`text-[11px] font-semibold ${badge.textColor}`}>
                      {badge.label}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300 font-medium">
                      {point.countryName}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {point.publishedAt}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-white leading-snug">
                  {point.title}
                </h3>

                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {point.summary || (point.fullContent && point.fullContent[0]) || point.title}
                </p>

                {/* Quick actions */}
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  {onFlyToCountry && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onFlyToCountry(point.countryName);
                      }}
                      className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1 transition"
                    >
                      <span>Terbang ke {point.countryName} &rarr;</span>
                    </button>
                  )}
                  {onOpenArticle && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenArticle(point);
                      }}
                      className="ml-auto text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Baca Lengkap</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-300/80 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Executive Digest · Diperbarui secara real-time</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-semibold text-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
