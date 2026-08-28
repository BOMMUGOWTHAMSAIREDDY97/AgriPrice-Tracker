import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Filter, 
  RotateCcw,
  Calendar,
  Layers,
  Database,
  Sparkles,
  Flame,
  Clock
} from 'lucide-react';
import { 
  fetchCommodities, 
  fetchStates, 
  fetchMarkets, 
  fetchPricesTable 
} from '../services/api';
import { 
  COMMODITY_CATEGORIES, 
  CATEGORY_ICONS, 
  CATEGORY_COLORS, 
  getCommodityCategory 
} from '../utils/commodityCategories';

const CATEGORY_TABS = [
  { key: 'All', label: 'All Crops', icon: '🌱' },
  { key: 'Vegetables', label: 'Vegetables', icon: '🥦' },
  { key: 'Spices', label: 'Spices', icon: '🌶️' },
  { key: 'Millets & Cereals', label: 'Millets & Grains', icon: '🌾' },
  { key: 'Pulses & Legumes', label: 'Pulses & Dal', icon: '🫘' },
  { key: 'Fruits', label: 'Fruits', icon: '🍎' },
  { key: 'Oilseeds & Cash Crops', label: 'Cash Crops', icon: '🌻' }
];

const TIMELINE_PRESETS = [
  { key: '', label: 'All Daily Records', icon: Calendar },
  { key: 'today', label: "Today's Live Arrivals", icon: Flame, badge: 'Live' },
  { key: 'yesterday', label: 'Yesterday', icon: Clock },
  { key: '7d', label: 'Last 7 Days', icon: Sparkles },
  { key: '30d', label: 'Last 30 Days', icon: Layers }
];

export default function PriceExplorer() {
  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]);
  const [markets, setMarkets] = useState([]);

  // Category & Filter states
  const [category, setCategory] = useState('All');
  const [commodity, setCommodity] = useState('');
  const [state, setState] = useState('');
  const [market, setMarket] = useState('');
  const [variety, setVariety] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination & Sort
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('arrival_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  // Load dropdown lists
  useEffect(() => {
    async function loadMeta() {
      const [cList, sList] = await Promise.all([
        fetchCommodities(),
        fetchStates()
      ]);
      setCommodities(cList);
      setStates(sList);
    }
    loadMeta();
  }, []);

  // Update markets when commodity or state changes
  useEffect(() => {
    async function updateMarkets() {
      const mList = await fetchMarkets(commodity, state);
      setMarkets(mList);
    }
    updateMarkets();
  }, [commodity, state]);

  // Fetch paginated table data
  useEffect(() => {
    async function loadTable() {
      setLoading(true);
      try {
        const res = await fetchPricesTable({
          category: category !== 'All' ? category : undefined,
          commodity,
          state,
          market,
          variety,
          search,
          dateFilter: dateFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          limit,
          sortBy,
          sortOrder
        });

        setTableData(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
      } catch (err) {
        console.error('Failed to load table data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTable();
  }, [category, commodity, state, market, variety, search, dateFilter, startDate, endDate, page, limit, sortBy, sortOrder]);

  const handleCategorySelect = (catKey) => {
    setCategory(catKey);
    setPage(1);
    // If current selected commodity is not in new category, reset it
    if (catKey !== 'All' && commodity && !COMMODITY_CATEGORIES[catKey]?.includes(commodity)) {
      setCommodity('');
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleReset = () => {
    setCategory('All');
    setCommodity('');
    setState('');
    setMarket('');
    setVariety('');
    setSearch('');
    setDateFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setSortBy('arrival_date');
    setSortOrder('desc');
  };

  const exportCSV = () => {
    if (tableData.length === 0) return;
    const headers = ['Arrival Date', 'Category', 'State', 'District', 'Market', 'Commodity', 'Variety', 'Grade', 'Min Price', 'Max Price', 'Modal Price'];
    const rows = tableData.map(r => [
      r.arrival_date,
      `"${r.category || getCommodityCategory(r.commodity)}"`,
      `"${r.state}"`,
      `"${r.district}"`,
      `"${r.market}"`,
      `"${r.commodity}"`,
      `"${r.variety || ''}"`,
      `"${r.grade || 'FAQ'}"`,
      r.min_price,
      r.max_price,
      r.modal_price
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agriprice_export_${category}_${commodity || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format arrival dates with relative indicators
  const formatArrivalDate = (dateStr) => {
    if (!dateStr) return '';
    const todayStr = new Date().toISOString().split('T')[0];
    const yDate = new Date();
    yDate.setDate(yDate.getDate() - 1);
    const yesterdayStr = yDate.toISOString().split('T')[0];

    let badge = null;
    if (dateStr === todayStr) {
      badge = <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">TODAY</span>;
    } else if (dateStr === yesterdayStr) {
      badge = <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">YESTERDAY</span>;
    }

    return (
      <div className="flex items-center">
        <span>{dateStr}</span>
        {badge}
      </div>
    );
  };

  const filteredCommodityList = category === 'All' 
    ? commodities 
    : commodities.filter(c => (COMMODITY_CATEGORIES[category] || []).includes(c));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>National Daily Mandi Price Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              All Commodities &amp; Daily Feeds
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore daily arrival prices across <strong>Vegetables, Spices, Millets &amp; Grains, Pulses, Fruits, and Cash Crops</strong> from 1,622+ APMC mandis across India.
            </p>
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              disabled={tableData.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 shadow-lg">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Commodity Categories
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">123 Total Crops Available</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = category === tab.key;
              const count = tab.key === 'All' 
                ? commodities.length 
                : (COMMODITY_CATEGORIES[tab.key]?.filter(c => commodities.includes(c)).length || 0);

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleCategorySelect(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Timeline Presets */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Timeline View:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TIMELINE_PRESETS.map((preset) => {
              const isActive = dateFilter === preset.key;
              const Icon = preset.icon;

              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => { setDateFilter(preset.key); setPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{preset.label}</span>
                  {preset.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-500 text-white animate-pulse">
                      {preset.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-4">
        
        {/* Row 1: Search & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vegetable, spice, millet, mandi..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Commodity Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Commodity ({filteredCommodityList.length})
            </label>
            <select
              value={commodity}
              onChange={(e) => { setCommodity(e.target.value); setPage(1); }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="">All Commodities in {category === 'All' ? 'All Categories' : category}</option>
              {category === 'All' ? (
                Object.entries(COMMODITY_CATEGORIES).map(([catName, list]) => {
                  const available = list.filter(c => commodities.includes(c));
                  if (available.length === 0) return null;
                  return (
                    <optgroup key={catName} label={`${CATEGORY_ICONS[catName]} ${catName} (${available.length})`} className="bg-slate-950 font-bold text-emerald-400">
                      {available.map(c => (
                        <option key={c} value={c} className="bg-slate-900 text-white font-normal">
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  );
                })
              ) : (
                filteredCommodityList.map(c => (
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
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="">All India ({states.length} States)</option>
              {states.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-7 text-slate-400 text-xs">▼</div>
          </div>

          {/* Market Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Mandi / Market ({markets.length})
            </label>
            <select
              value={market}
              onChange={(e) => { setMarket(e.target.value); setPage(1); }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
            >
              <option value="">All Mandis</option>
              {markets.map(m => <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-7 text-slate-400 text-xs">▼</div>
          </div>

        </div>

        {/* Row 2: Custom Date Range & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Custom Date Range:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setDateFilter(''); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none text-xs focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setDateFilter(''); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Showing <strong className="text-white">{pagination.total.toLocaleString()}</strong> records
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

      </div>

      {/* Table Card */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-700/80">
              <tr>
                <th onClick={() => handleSort('arrival_date')} className="px-4 py-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="px-4 py-3.5">
                  <span>Category</span>
                </th>
                <th onClick={() => handleSort('commodity')} className="px-4 py-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center gap-1.5">
                    <span>Commodity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('market')} className="px-4 py-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center gap-1.5">
                    <span>Market</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('state')} className="px-4 py-3.5 cursor-pointer hover:text-white transition">
                  <div className="flex items-center gap-1.5">
                    <span>State</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('min_price')} className="px-4 py-3.5 text-right cursor-pointer hover:text-white transition">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Min Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('max_price')} className="px-4 py-3.5 text-right cursor-pointer hover:text-white transition">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Max Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('modal_price')} className="px-4 py-3.5 text-right cursor-pointer hover:text-white transition">
                  <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-extrabold">
                    <span>Modal Price (₹/Q)</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading agricultural records...</span>
                    </div>
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No matching records found for the selected category &amp; date range. Try switching categories or clearing filters.
                  </td>
                </tr>
              ) : (
                tableData.map((row, idx) => {
                  const cat = row.category || getCommodityCategory(row.commodity);
                  return (
                    <tr 
                      key={`${row.commodity}-${row.market}-${row.arrival_date}-${idx}`}
                      className="hover:bg-slate-800/40 transition-colors font-medium"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-300 font-mono text-xs">
                        {formatArrivalDate(row.arrival_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[cat] || 'border-slate-700 text-slate-300'}`}>
                          <span>{CATEGORY_ICONS[cat]}</span>
                          <span>{cat}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-white">
                        {row.commodity}
                        {row.variety && row.variety !== 'Other' && row.variety !== 'FAQ' && (
                          <span className="ml-1.5 text-[10px] font-normal text-slate-400">({row.variety})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-200">
                        {row.market}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-xs">
                        {row.state}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-slate-400">
                        ₹{Number(row.min_price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-slate-400">
                        ₹{Number(row.max_price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-emerald-400 text-sm">
                        ₹{Number(row.modal_price).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-850/80 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

