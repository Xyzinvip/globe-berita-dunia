import React, { useState } from 'react';
import { Calendar, Filter, TrendingUp, AlertCircle, Clock, ChevronLeft } from 'lucide-react';
import { ECONOMIC_EVENTS } from '../data/economicCalendar';
import { EconomicEvent } from '../types';

interface EconomicCalendarViewProps {
  onClose: () => void;
  onSelectCountry?: (countryName: string) => void;
}

export const EconomicCalendarView: React.FC<EconomicCalendarViewProps> = ({
  onClose,
  onSelectCountry,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('Semua');
  const [selectedImpact, setSelectedImpact] = useState<string>('Semua');

  const currencies = ['Semua', 'USD', 'IDR', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD'];
  const impacts = ['Semua', 'High', 'Medium'];

  const filteredEvents = ECONOMIC_EVENTS.filter((evt) => {
    const matchCcy = selectedCurrency === 'Semua' || evt.currency === selectedCurrency;
    const matchImpact = selectedImpact === 'Semua' || evt.impact === selectedImpact;
    return matchCcy && matchImpact;
  });

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
          <Calendar className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Kalender Ekonomi Global</h2>
        </div>

        <div className="w-8" />
      </header>

      {/* Filter Row */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 space-y-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-semibold text-[11px] flex-none">Mata Uang:</span>
          {currencies.map((ccy) => (
            <button
              key={ccy}
              onClick={() => setSelectedCurrency(ccy)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                selectedCurrency === ccy
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {ccy}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] flex-none">Dampak:</span>
          {impacts.map((imp) => (
            <button
              key={imp}
              onClick={() => setSelectedImpact(imp)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                selectedImpact === imp
                  ? 'bg-orange-500 text-slate-950'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {imp}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full pb-[calc(env(safe-area-inset-bottom,0px)+32px)]">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            Tidak ada peristiwa ekonomi yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => {
                if (onSelectCountry) onSelectCountry(evt.countryName);
              }}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 cursor-pointer shadow-sm transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    {evt.currency}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      evt.impact === 'High'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {evt.impact}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">{evt.countryName}</span>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-medium">
                  <span>{evt.date}</span> • <span className="text-cyan-300">{evt.time}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mb-2 leading-snug">{evt.title}</h3>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center mb-2.5">
                <div>
                  <span className="block text-[10px] text-slate-400">Aktual</span>
                  <span className="text-xs font-extrabold text-green-400">{evt.actual || '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Prakiraan</span>
                  <span className="text-xs font-extrabold text-white">{evt.forecast}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Sebelumnya</span>
                  <span className="text-xs font-extrabold text-slate-300">{evt.previous}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>
            </div>
          ))
        )}
      </main>
    </div>
  );
};
