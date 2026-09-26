import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, Globe, Compass, Coins, Users, ChevronRight } from 'lucide-react';
import { CountryInfo } from '../types';
import { COUNTRIES_DATA } from '../data/countries';

interface CountryListViewProps {
  onClose: () => void;
  onSelectCountry: (country: CountryInfo) => void;
}

export const CountryListView: React.FC<CountryListViewProps> = ({
  onClose,
  onSelectCountry,
}) => {
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('Semua');

  const allCountries = useMemo(() => Object.values(COUNTRIES_DATA), []);

  const continents = ['Semua', 'Asia Tenggara', 'Asia Timur', 'Timur Tengah', 'Eropa Barat', 'Amerika Utara', 'Amerika Selatan', 'Oseania'];

  const filtered = useMemo(() => {
    return allCountries.filter((c) => {
      const matchCont = selectedContinent === 'Semua' || c.continent.toLowerCase().includes(selectedContinent.toLowerCase());
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nameId.toLowerCase().includes(search.toLowerCase()) ||
        c.capital.toLowerCase().includes(search.toLowerCase()) ||
        c.currency.toLowerCase().includes(search.toLowerCase());
      return matchCont && matchSearch;
    });
  }, [allCountries, selectedContinent, search]);

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
          <Globe className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Katalog Negara Dunia</h2>
        </div>

        <div className="w-8" />
      </header>

      {/* Search & Continent Filters */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari negara, ibukota, atau mata uang..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {continents.map((cont) => (
            <button
              key={cont}
              onClick={() => setSelectedContinent(cont)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedContinent === cont
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cont}
            </button>
          ))}
        </div>
      </div>

      {/* Country List Items */}
      <main className="flex-1 overflow-y-auto p-4 space-y-2.5 max-w-2xl mx-auto w-full pb-[calc(env(safe-area-inset-bottom,0px)+32px)]">
        {filtered.map((country) => (
          <div
            key={country.id}
            onClick={() => {
              onSelectCountry(country);
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition active:scale-[0.99] flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none select-none">{country.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                    {country.nameId}
                  </h4>
                  <span className="text-xs text-slate-500">({country.name})</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-cyan-400" />
                    {country.capital}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    {country.currency.split(' ')[0]}
                  </span>
                  <span>•</span>
                  <span>{country.continent}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition flex-none" />
          </div>
        ))}
      </main>
    </div>
  );
};
