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
  Database
} from 'lucide-react';
import { 
  fetchCommodities, 
  fetchStates, 
  fetchMarkets, 
  fetchPricesTable 
} from '../services/api';

export default function PriceExplorer() {
  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]);
  const [markets, setMarkets] = useState([]);

  // Filter states
  const [commodity, setCommodity] = useState('');
  const [state, setState] = useState('');
  const [market, setMarket] = useState('');
  const [variety, setVariety] = useState('');
  const [search, setSearch] = useState('');
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
          commodity,
          state,
          market,
          variety,
          search,
          startDate,
          endDate,
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
  }, [commodity, state, market, variety, search, startDate, endDate, page, limit, sortBy, sortOrder]);

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
    setCommodity('');
    setState('');
    setMarket('');
    setVariety('');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setSortBy('arrival_date');
    setSortOrder('desc');
  };

  const exportCSV = () => {
    if (tableData.length === 0) return;
    const headers = ['Arrival Date', 'State', 'District', 'Market', 'Commodity', 'Variety', 'Grade', 'Min Price', 'Max Price', 'Modal Price'];
    const rows = tableData.map(r => [
      r.arrival_date,
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
    link.setAttribute('download', `agriprice_export_${commodity || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-400 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Wholesale Arrival Feeds</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Historical Price Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Filter, search, sort, and export chronological mandi records across India.
            </p>
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              disabled={tableData.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition shadow-lg shadow-brand-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
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
                placeholder="Search crop, mandi, state..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Commodity Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => { setCommodity(e.target.value); setPage(1); }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
            >
              <option value="">All Commodities</option>
              {commodities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              State
            </label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
            >
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Market Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Mandi / Market
            </label>
            <select
              value={market}
              onChange={(e) => { setMarket(e.target.value); setPage(1); }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
            >
              <option value="">All Markets</option>
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

        </div>

        {/* Row 2: Date Range & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date Filter:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none text-xs focus:ring-1 focus:ring-brand-500"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none text-xs focus:ring-1 focus:ring-brand-500"
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
              <span>Clear Filters</span>
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
                  <div className="flex items-center justify-end gap-1.5 text-brand-400">
                    <span>Modal Price</span>
                    <ArrowUpDown className="w-3 h-3 text-brand-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No matching records found. Try clearing some filters.
                  </td>
                </tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr 
                    key={`${row.commodity}-${row.market}-${row.arrival_date}-${idx}`}
                    className="hover:bg-slate-800/40 transition-colors font-medium"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300 font-mono text-xs">
                      {row.arrival_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-white">
                      {row.commodity}
                      {row.variety && row.variety !== 'Other' && (
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
                    <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-brand-400">
                      ₹{Number(row.modal_price).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
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
