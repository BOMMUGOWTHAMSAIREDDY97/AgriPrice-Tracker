import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table2,
  SlidersHorizontal
} from 'lucide-react';
import { fetchLiveRates } from '../services/api';
import { CATEGORY_ICONS, getCommodityCategory } from '../utils/commodityCategories';

const CATEGORY_FILTERS = [
  { key: 'All', label: 'All Crops', icon: '🌱' },
  { key: 'Vegetables', label: 'Vegetables', icon: '🥦' },
  { key: 'Spices', label: 'Spices', icon: '🌶️' },
  { key: 'Millets & Cereals', label: 'Millets & Grains', icon: '🌾' },
  { key: 'Pulses & Legumes', label: 'Pulses & Dal', icon: '🫘' },
  { key: 'Fruits', label: 'Fruits', icon: '🍎' },
  { key: 'Oilseeds & Cash Crops', label: 'Cash Crops', icon: '🌻' }
];

const PAGE_SIZE = 60;

export default function DailyMarketRatesBoard({ onSelectCommodity }) {
  const [allRates, setAllRates] = useState([]);
  const [marketPulse, setMarketPulse] = useState({});
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'gainers', 'losers'
  const [sortBy, setSortBy] = useState('change'); // 'change', 'price', 'commodity'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table'
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      // Load ALL rates — no server-side limit
      const data = await fetchLiveRates({ limit: 99999 });
      setAllRates(data.rates || []);
      setMarketPulse(data.market_pulse || {});
    } catch (e) {
      console.error('Failed to load live rates:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [category, search, filterMode, sortBy]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Filter pipeline (all client-side — no extra API call)
  const filtered = allRates.filter(item => {
    // Category filter
    if (category !== 'All') {
      const cat = item.category || getCommodityCategory(item.commodity);
      if (cat !== category) return false;
    }
    // Mode filter
    if (filterMode === 'gainers' && item.direction !== 'UP') return false;
    if (filterMode === 'losers' && item.direction !== 'DOWN') return false;
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.commodity.toLowerCase().includes(q) ||
        item.market.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return b.current_price - a.current_price;
    if (sortBy === 'commodity') return a.commodity.localeCompare(b.commodity);
    // default: absolute day change %
    return Math.abs(b.day_change_pct) - Math.abs(a.day_change_pct);
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const gainersCount = allRates.filter(r =>
    (category === 'All' || (r.category || getCommodityCategory(r.commodity)) === category) &&
    r.direction === 'UP'
  ).length;
  const losersCount = allRates.filter(r =>
    (category === 'All' || (r.category || getCommodityCategory(r.commodity)) === category) &&
    r.direction === 'DOWN'
  ).length;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-slate-700/60 shadow-2xl space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Day-over-Day Live Rate Engine — All India Mandi Network</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display flex flex-wrap items-center gap-2">
            Daily Mandi Rates &amp; Price Fluctuations
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {sorted.length.toLocaleString('en-IN')} Live Records
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete real-time 🔺UP &amp; 🔻DOWN movements across <strong className="text-white">123 commodities</strong> and <strong className="text-white">1,622 mandis</strong> in 31 states.
          </p>
        </div>

        {/* Controls: Refresh + View Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button onClick={() => setViewMode('grid')} title="Grid view"
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} title="Table view"
              className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              <Table2 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleRefresh} disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Refresh Live Rates">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
        {CATEGORY_FILTERS.map((tab) => {
          const tabCount = tab.key === 'All'
            ? allRates.length
            : allRates.filter(r => (r.category || getCommodityCategory(r.commodity)) === tab.key).length;
          const isActive = category === tab.key;
          return (
            <button key={tab.key} onClick={() => setCategory(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                isActive ? 'bg-slate-950/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}>{tabCount.toLocaleString('en-IN')}</span>
            </button>
          );
        })}
      </div>

      {/* ── Mode + Sort + Search Row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Gainers / Losers / All tabs */}
        <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 flex-shrink-0">
          <button onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterMode === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            All ({filtered.length > 0 ? filtered.length : sorted.length})
          </button>
          <button onClick={() => setFilterMode('gainers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${filterMode === 'gainers' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'text-emerald-400/80 hover:text-emerald-400'}`}>
            <TrendingUp className="w-3 h-3" />
            Gainers ▲{gainersCount}
          </button>
          <button onClick={() => setFilterMode('losers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${filterMode === 'losers' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm' : 'text-rose-400/80 hover:text-rose-400'}`}>
            <TrendingDown className="w-3 h-3" />
            Losers ▼{losersCount}
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Sort:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer">
            <option value="change">% Change (High to Low)</option>
            <option value="price">Price (High to Low)</option>
            <option value="commodity">Commodity (A-Z)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search commodity, market, or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs">✕</button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm">Loading all {allRates.length > 0 ? allRates.length.toLocaleString('en-IN') : ''} live mandi rates...</div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No results found for "<strong>{search || category}</strong>". Try a different filter.
        </div>
      ) : viewMode === 'table' ? (

        /* ── TABLE VIEW ── */
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                <th className="px-4 py-3 text-slate-400 font-bold uppercase tracking-wide">#</th>
                <th className="px-4 py-3 text-slate-400 font-bold uppercase tracking-wide">Commodity</th>
                <th className="px-4 py-3 text-slate-400 font-bold uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-slate-400 font-bold uppercase tracking-wide">Market / State</th>
                <th className="px-4 py-3 text-right text-slate-400 font-bold uppercase tracking-wide">Today ₹/q</th>
                <th className="px-4 py-3 text-right text-slate-400 font-bold uppercase tracking-wide">Yesterday ₹/q</th>
                <th className="px-4 py-3 text-right text-slate-400 font-bold uppercase tracking-wide">Change ₹</th>
                <th className="px-4 py-3 text-right text-slate-400 font-bold uppercase tracking-wide">Change %</th>
                <th className="px-4 py-3 text-center text-slate-400 font-bold uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, idx) => {
                const isUp = item.direction === 'UP';
                const isDown = item.direction === 'DOWN';
                const cat = item.category || getCommodityCategory(item.commodity);
                const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                return (
                  <tr key={`${item.commodity}-${item.market}-${idx}`}
                    className="border-b border-slate-800/60 hover:bg-slate-900/60 transition group">
                    <td className="px-4 py-3 text-slate-500 font-mono">{rowNum}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
                        <span>{CATEGORY_ICONS[cat] || '🌱'}</span>
                        {item.commodity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{cat}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="font-medium">{item.market}</div>
                      <div className="text-slate-500 text-[10px]">{item.state}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      ₹{item.current_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      ₹{item.yesterday_price.toLocaleString('en-IN')}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-400'}`}>
                      {isUp ? '+' : ''}{item.day_change_val.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-black px-2 py-0.5 rounded-lg text-[10px] border ${
                        isUp ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                             : isDown ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                             : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isUp && <ArrowUpRight className="w-2.5 h-2.5" />}
                        {isDown && <ArrowDownRight className="w-2.5 h-2.5" />}
                        {isUp ? '+' : ''}{item.day_change_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => onSelectCommodity && onSelectCommodity(item.commodity, item.market)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 font-bold text-[10px] transition cursor-pointer whitespace-nowrap">
                        Analyze →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : (

        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {pageItems.map((item, idx) => {
            const isUp = item.direction === 'UP';
            const isDown = item.direction === 'DOWN';
            const cat = item.category || getCommodityCategory(item.commodity);

            return (
              <div key={`${item.commodity}-${item.market}-${idx}`}
                className="glass-panel p-4 rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 bg-slate-900/60 hover:bg-slate-900 transition flex flex-col justify-between gap-3 group">
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{CATEGORY_ICONS[cat] || '🌱'}</span>
                      <h4 className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition leading-tight">
                        {item.commodity}
                      </h4>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 truncate max-w-[180px]">
                      {item.market}, {item.state}
                    </div>
                  </div>

                  <div className={`flex flex-col items-end px-2 py-1 rounded-lg border text-right flex-shrink-0 ${
                    isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                         : isDown ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                         : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <div className="flex items-center gap-0.5 text-xs font-black">
                      {isUp && <ArrowUpRight className="w-3 h-3" />}
                      {isDown && <ArrowDownRight className="w-3 h-3" />}
                      <span>{isUp ? '+' : ''}{item.day_change_pct}%</span>
                    </div>
                    <span className="text-[10px] font-mono">
                      {isUp ? '+' : ''}₹{item.day_change_val}/q
                    </span>
                  </div>
                </div>

                {/* Price Row */}
                <div className="flex items-end justify-between border-t border-slate-800/60 pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Today</span>
                    <span className="text-base font-black text-white">
                      ₹{item.current_price.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-400">/q</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Yesterday</span>
                    <span className="text-xs text-slate-400">₹{item.yesterday_price.toLocaleString('en-IN')}/q</span>
                  </div>
                </div>

                {/* Action */}
                <button onClick={() => onSelectCommodity && onSelectCommodity(item.commodity, item.market)}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer">
                  Analyze & Forecast {item.commodity}
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{((page - 1) * PAGE_SIZE + 1).toLocaleString('en-IN')}</strong> –{' '}
            <strong className="text-white">{Math.min(page * PAGE_SIZE, sorted.length).toLocaleString('en-IN')}</strong>{' '}
            of <strong className="text-white">{sorted.length.toLocaleString('en-IN')}</strong> records
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 text-xs font-bold transition">
              «
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 7) { p = i + 1; }
              else if (page <= 4) { p = i + 1; }
              else if (page >= totalPages - 3) { p = totalPages - 6 + i; }
              else { p = page - 3 + i; }
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    page === p ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                  }`}>
                  {p}
                </button>
              );
            })}

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 text-xs font-bold transition">
              »
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Page {page} of {totalPages.toLocaleString('en-IN')}
          </div>
        </div>
      )}

    </div>
  );
}
