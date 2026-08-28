import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Activity, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Filter,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { fetchLiveRates } from '../services/api';
import { 
  COMMODITY_CATEGORIES, 
  CATEGORY_ICONS, 
  CATEGORY_COLORS, 
  getCommodityCategory 
} from '../utils/commodityCategories';

const CATEGORY_FILTERS = [
  { key: 'All', label: 'All Crops', icon: '🌱' },
  { key: 'Vegetables', label: 'Vegetables', icon: '🥦' },
  { key: 'Spices', label: 'Spices', icon: '🌶️' },
  { key: 'Millets & Cereals', label: 'Millets & Grains', icon: '🌾' },
  { key: 'Pulses & Legumes', label: 'Pulses & Dal', icon: '🫘' },
  { key: 'Fruits', label: 'Fruits', icon: '🍎' },
  { key: 'Oilseeds & Cash Crops', label: 'Cash Crops', icon: '🌻' }
];

export default function DailyMarketRatesBoard({ onSelectCommodity }) {
  const [ratesData, setRatesData] = useState({ rates: [], top_gainers: [], top_losers: [], market_pulse: {} });
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'gainers', 'losers'
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (cat = category, q = search) => {
    try {
      const data = await fetchLiveRates({ category: cat, search: q, limit: 100 });
      setRatesData(data);
    } catch (e) {
      console.error('Failed to load live rates:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(category, search);
  }, [category, search]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(category, search);
  };

  const { rates = [], top_gainers = [], top_losers = [], market_pulse = {} } = ratesData;

  // Filter list by gainers/losers/all
  let displayList = rates;
  if (filterMode === 'gainers') {
    displayList = rates.filter(r => r.direction === 'UP');
  } else if (filterMode === 'losers') {
    displayList = rates.filter(r => r.direction === 'DOWN');
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Day-over-Day Live Rate Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display flex items-center gap-2">
            <span>Daily Mandi Rates &amp; Price Fluctuations</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Feed
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of today's arrival prices vs yesterday with exact 🔺 UP &amp; 🔻 DOWN movements.
          </p>
        </div>

        {/* Quick Filter & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterMode === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({rates.length})
            </button>
            <button
              onClick={() => setFilterMode('gainers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'gainers' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'text-emerald-400/80 hover:text-emerald-400'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Gainers (▲{market_pulse.advances || top_gainers.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('losers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'losers' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm' : 'text-rose-400/80 hover:text-rose-400'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>Losers (▼{market_pulse.declines || top_losers.length})</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Refresh Live Rates"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_FILTERS.map((tab) => {
          const isActive = category === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by commodity name (e.g. Tomato, Jeera, Bajra, Cotton), market or state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
        />
      </div>

      {/* Live Market Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Fetching live mandi rates...</span>
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No live commodity rates found for "{search || category}". Try searching another crop.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayList.slice(0, 36).map((item, idx) => {
            const isUp = item.direction === 'UP';
            const isDown = item.direction === 'DOWN';
            const cat = item.category || getCommodityCategory(item.commodity);

            return (
              <div
                key={`${item.commodity}-${item.market}-${idx}`}
                className="glass-panel p-4 rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 bg-slate-900/60 hover:bg-slate-900 transition flex flex-col justify-between gap-3 group relative overflow-hidden"
              >
                {/* Top Row: Crop & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{CATEGORY_ICONS[cat] || '🌱'}</span>
                      <h4 className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition">
                        {item.commodity}
                      </h4>
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5 truncate max-w-[200px]">
                      {item.market}, {item.state}
                    </div>
                  </div>

                  {/* Day-over-Day Movement Badge */}
                  <div className={`flex flex-col items-end px-2 py-1 rounded-lg border text-right ${
                    isUp 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : isDown 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <div className="flex items-center gap-1 text-xs font-black">
                      {isUp && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
                      {isDown && <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{isUp ? '+' : ''}{item.day_change_pct}%</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-80">
                      {isUp ? '+' : ''}₹{item.day_change_val}/q
                    </span>
                  </div>
                </div>

                {/* Middle Row: Current Price vs Yesterday */}
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Modal Rate</span>
                    <span className="text-lg font-black text-white">
                      ₹{item.current_price.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-400">/q</span>
                    </span>
                    <span className="ml-2 text-xs font-semibold text-slate-400">
                      (₹{item.price_per_kg}/kg)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Yesterday</span>
                    <span className="text-xs font-medium text-slate-400">
                      ₹{item.yesterday_price.toLocaleString('en-IN')}/q
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Quick Action */}
                <button
                  onClick={() => onSelectCommodity && onSelectCommodity(item.commodity, item.market)}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1 mt-1 cursor-pointer"
                >
                  <span>Analyze &amp; Forecast {item.commodity}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
