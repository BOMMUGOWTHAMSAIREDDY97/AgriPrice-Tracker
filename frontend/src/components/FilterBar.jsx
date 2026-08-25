import React from 'react';
import { Filter, RotateCcw, MapPin, Tag } from 'lucide-react';

export default function FilterBar({
  commodities = [],
  markets = [],
  states = [],
  selectedCommodity = 'Tomato',
  selectedState = '',
  selectedMarket = '',
  onCommodityChange,
  onStateChange,
  onMarketChange,
  onReset,
  loading = false
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Market Filters</span>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
          
          {/* Commodity Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Commodity
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => onCommodityChange && onCommodityChange(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              {commodities.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-7 text-slate-400 text-xs">▼</div>
          </div>

          {/* State Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              State (Optional)
            </label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange && onStateChange(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">All States</option>
              {states.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-7 text-slate-400 text-xs">▼</div>
          </div>

          {/* Market Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Mandi / Market
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => onMarketChange && onMarketChange(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">Primary / All Markets</option>
              {markets.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-7 text-slate-400 text-xs">▼</div>
          </div>

        </div>

        {/* Reset / Demo Action */}
        <div className="flex items-center gap-2 self-end md:self-center pt-2 md:pt-4">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            title="Reset Filters to Default Demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

      </div>
    </div>
  );
}
