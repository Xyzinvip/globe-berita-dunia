import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Compass, RotateCcw } from 'lucide-react';

interface SelfCollapsingHelpProps {
  onResetZoom?: () => void;
}

export const SelfCollapsingHelp: React.FC<SelfCollapsingHelpProps> = ({ onResetZoom }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(touch);
    }

    // Auto-collapse after 7.5 seconds
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 7500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Expanded Initial Banner (Auto-collapses after 7.5s) */}
      {!isCollapsed && (
        <div className="fixed bottom-16 sm:bottom-14 left-4 sm:left-6 z-20 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0a0e17]/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,243,255,0.15)] text-xs text-slate-300">
            <span className="text-base select-none">🌍</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-cyan-200 font-medium">
                {isTouchDevice
                  ? 'Geser untuk memutar · Cubit untuk zoom · Ketuk negara untuk berita'
                  : 'Geser mouse untuk rotasi · Scroll untuk zoom · Ketuk negara'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:text-white text-slate-400 rounded-lg hover:bg-slate-800 transition"
              aria-label="Tutup petunjuk"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Collapsed Compact "?" Button */}
      {isCollapsed && (
        <div className="fixed bottom-4 left-4 sm:left-6 z-20 flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            title="Bantuan Navigasi & Pintasan Keyboard"
            className="w-9 h-9 rounded-2xl bg-[#0a0e17]/85 backdrop-blur-xl border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,243,255,0.12)] flex items-center justify-center font-bold text-xs font-mono transition-all"
            aria-label="Bantuan dan Pintasan"
          >
            ?
          </button>
        </div>
      )}

      {/* Help & Shortcuts Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#0a0e17]/95 backdrop-blur-2xl border border-cyan-400/40 p-5 shadow-[0_0_30px_rgba(0,243,255,0.2)] text-slate-200 font-sans animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Panduan & Pintasan Navigasi</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gesture Guide */}
            <div className="space-y-2 mb-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Navigasi Globe 3D
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span><strong>Geser / Drag:</strong> Memutar bola dunia ke segala arah.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span><strong>Pinch / Scroll:</strong> Memperbesar atau memperkecil tampilan globe.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span><strong>Ketuk Negara:</strong> Mengunci reticle HUD & membuka kabar berita.</span>
                </li>
              </ul>
            </div>

            {/* Keyboard Shortcuts (Hidden on touch devices) */}
            {!isTouchDevice && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Pintasan Keyboard Desktop
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-cyan-500/30 font-mono text-[10px] text-cyan-300">
                      Spasi
                    </kbd>
                    <span className="text-slate-300">Putar / Henti</span>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-cyan-500/30 font-mono text-[10px] text-cyan-400">
                      C
                    </kbd>
                    <span className="text-slate-300">Tanya AI</span>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-orange-500/30 font-mono text-[10px] text-orange-300">
                      P
                    </kbd>
                    <span className="text-slate-300">Profil</span>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-amber-500/30 font-mono text-[10px] text-amber-300">
                      N
                    </kbd>
                    <span className="text-slate-300">Notifikasi</span>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
                      Esc
                    </kbd>
                    <span className="text-slate-300">Tutup Panel</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-5 w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-bold transition active:scale-98"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
