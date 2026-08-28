import React, { useState } from 'react';
import { Filter, RotateCcw, MapPin, Tag, Sparkles } from 'lucide-react';
import { COMMODITY_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, getCommodityCategory } from '../utils/commodityCategories';

const CATEGORY_TABS = [
  { key: 'All', label: 'All Crops', icon: '🌱' },
  { key: 'Vegetables', label: 'Vegetables', icon: '🥦' },
  { key: 'Spices', label: 'Spices', icon: '🌶️' },
  { key: 'Millets & Cereals', label: 'Millets & Grains', icon: '🌾' },
  { key: 'Pulses & Legumes', label: 'Pulses & Dal', icon: '🫘' },
  { key: 'Fruits', label: 'Fruits', icon: '🍎' },
  { key: 'Oilseeds & Cash Crops', label: 'Cash Crops', icon: '🌻' }
];

export default function FilterBar({
  commodities = [],
  markets = [],
  states = [],
  selectedCommodity = 'Tomato',
  selectedState = '',
  selectedMarket = '',
  selectedCategory = 'All',
  onCommodityChange,
  onStateChange,
  onMarketChange,
  onCategoryChange,
  onReset,
  loading = false
}) {
  const [activeTab, setActiveTab] = useState(selectedCategory || 'All');

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (onCategoryChange) {
      onCategoryChange(tabKey);
    }
    // If current commodity is not in selected category, switch to the first commodity of that category
    if (tabKey !== 'All' && COMMODITY_CATEGORIES[tabKey]) {
      const available = COMMODITY_CATEGORIES[tabKey].filter(c => commodities.includes(c));
      if (available.length > 0 && !COMMODITY_CATEGORIES[tabKey].includes(selectedCommodity)) {
        if (onCommodityChange) onCommodityChange(available[0]);
      }
    }
  };

  // Filter dropdown commodities based on active category
  const filteredCommodities = activeTab === 'All' 
    ? commodities 
    : commodities.filter(c => (COMMODITY_CATEGORIES[activeTab] || []).includes(c));

  const currentCategory = getCommodityCategory(selectedCommodity);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-lg space-y-4">
      
      {/* Category Pills Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 min-w-max">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'All' 
              ? commodities.length 
              : (COMMODITY_CATEGORIES[tab.key]?.filter(c => commodities.includes(c)).length || 0);

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab('All');
            if (onReset) onReset();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 border border-slate-700/50 transition flex-shrink-0"
          title="Reset Filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Filter Dropdowns Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          
          {/* Commodity Dropdown */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Commodity ({filteredCommodities.length})
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${CATEGORY_COLORS[currentCategory] || 'border-slate-700 text-slate-300'}`}>
                {CATEGORY_ICONS[currentCategory]} {currentCategory}
              </span>
            </div>
            <select
              value={selectedCommodity}
              onChange={(e) => onCommodityChange && onCommodityChange(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              {activeTab === 'All' ? (
                Object.entries(COMMODITY_CATEGORIES).map(([catName, list]) => {
                  const available = list.filter(c => commodities.includes(c));
                  if (available.length === 0) return null;
                  return (
                    <optgroup key={catName} label={`${CATEGORY_ICONS[catName] || ''} ${catName} (${available.length})`} className="bg-slate-950 font-bold text-emerald-400">
                      {available.map(c => (
                        <option key={c} value={c} className="bg-slate-900 text-white font-normal">
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  );
                })
              ) : (
                filteredCommodities.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute right-3 top-7 text-slate-400 text-xs">▼</div>
          </div>

          {/* State Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              State ({states.length} states)
            </label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange && onStateChange(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">All India (31 States)</option>
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
              Mandi / Market ({markets.length} available)
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

      </div>
    </div>
  );
}

