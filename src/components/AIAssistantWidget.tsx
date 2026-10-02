import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, MessageSquare, Bot, X } from 'lucide-react';
import { CountryInfo } from '../types';

interface AIAssistantWidgetProps {
  onOpenAIChat: () => void;
  selectedCountry: CountryInfo | null;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  onOpenAIChat,
  selectedCountry,
}) => {
  // Widget size in px
  const WIDGET_WIDTH = 68;
  const WIDGET_HEIGHT = 68;

  // Position state (default to bottom-right with leftward offset: bottom 24px, right 80px)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(16, window.innerWidth - WIDGET_WIDTH - 80),
        y: Math.max(80, window.innerHeight - WIDGET_HEIGHT - 24),
      };
    }
    return { x: 300, y: 500 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isDocked, setIsDocked] = useState<'left' | 'right' | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number; hasMoved: boolean }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
    hasMoved: false,
  });

  // Clamp position to viewport bounds
  const clampPosition = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      const minX = 12;
      const maxX = Math.max(12, window.innerWidth - WIDGET_WIDTH - 12);
      const minY = 76; // Below TopNav
      const maxY = Math.max(76, window.innerHeight - WIDGET_HEIGHT - 20);
      return {
        x: Math.min(maxX, Math.max(minX, x)),
        y: Math.min(maxY, Math.max(minY, y)),
      };
    },
    []
  );

  // Resize handler to keep widget in bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  // Periodic cute blinking animation for chibi hologram eyes
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 240);
    }, 4200);
    return () => clearInterval(blinkInterval);
  }, []);

  // Hide tooltip after 7 seconds or when dragged
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [selectedCountry]);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > 5) {
      dragStartRef.current.hasMoved = true;
      setShowTooltip(false);
    }

    const nextX = dragStartRef.current.posX + dx;
    const nextY = dragStartRef.current.posY + dy;
    setPosition(clampPosition(nextX, nextY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const hasMoved = dragStartRef.current.hasMoved;

    // If tapped without dragging -> open AI chat!
    if (!hasMoved) {
      onOpenAIChat();
      return;
    }

    // Auto-dock to nearest edge if close
    const screenWidth = window.innerWidth;
    const dockThreshold = 55;
    if (position.x < dockThreshold) {
      setIsDocked('left');
      setPosition((prev) => ({ ...prev, x: 8 }));
    } else if (screenWidth - (position.x + WIDGET_WIDTH) < dockThreshold) {
      setIsDocked('right');
      setPosition((prev) => ({ ...prev, x: screenWidth - WIDGET_WIDTH - 80 }));
    } else {
      setIsDocked(null);
    }
  };

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-40 select-none ${
        isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-transform duration-200 ease-out'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Speech / Contextual Tooltip Bubble */}
      {showTooltip && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenAIChat();
          }}
          className="absolute -top-11 right-0 sm:right-auto sm:-left-16 whitespace-nowrap px-3 py-1.5 rounded-2xl bg-[#090f26]/95 border border-cyan-400/50 text-cyan-200 text-xs font-semibold shadow-[0_0_20px_rgba(0,243,255,0.35)] backdrop-blur-xl animate-bounce flex items-center gap-1.5 cursor-pointer pointer-events-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
          <span>
            {selectedCountry ? `Analisis ${selectedCountry.nameId}?` : 'Tanya AI Gemini'}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="p-0.5 hover:text-white text-cyan-400/60"
            aria-label="Tutup"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Holographic Chibi Assistant Orb Container */}
      <div className="relative group">
        {/* Holographic Concentric Pulse Ring 1 */}
        <div className="absolute -inset-2.5 rounded-full border border-dashed border-cyan-400/30 animate-spin-slow pointer-events-none" />

        {/* Outer Aura Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-500/40 via-blue-500/30 to-teal-400/40 blur-md opacity-80 group-hover:opacity-100 transition-opacity animate-pulse" />

        {/* Chibi Main Body Sphere */}
        <div
          className={`relative w-[64px] h-[64px] rounded-full p-1 bg-gradient-to-b from-[#0e2a4a] via-[#08152e] to-[#040817] border-2 border-cyan-400/70 shadow-[0_0_25px_rgba(0,243,255,0.5),inset_0_0_15px_rgba(0,243,255,0.25)] backdrop-blur-2xl flex flex-col items-center justify-center transition-transform ${
            isDragging ? 'scale-105' : 'group-hover:scale-105 group-active:scale-95'
          }`}
        >
          {/* Cyber Antenna with Beacon Orb */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00F3FF] animate-ping opacity-90" />
            <span className="w-1.5 h-1.5 -mt-2 rounded-full bg-cyan-200 shadow-[0_0_8px_#00F3FF]" />
            <span className="w-0.5 h-2 bg-gradient-to-t from-cyan-400 to-transparent" />
          </div>

          {/* Hologram Scanlines Overlay */}
          <div
            className="absolute inset-0 rounded-full opacity-25 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 243, 255, 0.4) 0px, transparent 2px)',
            }}
          />

          {/* Chibi Hologram Face Visor */}
          <div className="w-11 h-7 rounded-xl bg-slate-950/90 border border-cyan-500/50 shadow-[inset_0_0_8px_rgba(0,243,255,0.4)] flex items-center justify-center gap-2 px-1 relative overflow-hidden">
            {/* Hologram Visor Glares */}
            <div className="absolute -top-3 -right-2 w-8 h-4 bg-cyan-400/20 rotate-45 blur-xs pointer-events-none" />

            {/* Chibi Eyes (Interactive / Blinking) */}
            {isBlinking ? (
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-0.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#00F3FF]" />
                <span className="w-2.5 h-0.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#00F3FF]" />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Left Eye */}
                <div className="w-2.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00F3FF] flex items-center justify-center relative">
                  <span className="w-1 h-1 rounded-full bg-white absolute top-0.5 right-0.5" />
                </div>
                {/* Right Eye */}
                <div className="w-2.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00F3FF] flex items-center justify-center relative">
                  <span className="w-1 h-1 rounded-full bg-white absolute top-0.5 right-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Mini Cute Mouth Line */}
          <div className="w-2 h-1 border-b-2 border-cyan-300/80 rounded-full mt-1" />

          {/* Subtitle / Hologram Badge */}
          <div className="absolute -bottom-2.5 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,243,255,0.4)] flex items-center gap-1 text-[9px] font-extrabold text-cyan-300 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI BOT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
