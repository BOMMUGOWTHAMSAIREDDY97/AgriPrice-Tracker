import React, { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Layers, 
  ArrowRight,
  Filter,
  Info,
  Scale
} from 'lucide-react';
import MarketComparisonChart from '../components/MarketComparisonChart';
import { fetchCommodities, fetchMarketComparison } from '../services/api';

export default function MarketComparison() {
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [comparisonData, setComparisonData] = useState({
    markets: [],
    highest_market: null,
    lowest_market: null,
    average_price: 0,
    dynamic_insight: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCommodities() {
      const list = await fetchCommodities();
      setCommodities(list);
    }
    loadCommodities();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchMarketComparison(selectedCommodity);
        setComparisonData(res);
      } catch (err) {
        console.error('Error loading market comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedCommodity) {
      loadData();
    }
  }, [selectedCommodity]);

  const { markets = [], highest_market, lowest_market, average_price = 0, dynamic_insight } = comparisonData;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-400 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Inter-Mandi Arbitrage Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Market Price Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Compare mandi prices across states to identify optimal selling hubs and capture inter-market arbitrage.
            </p>
          </div>

          {/* Commodity Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
            <span className="text-xs font-bold text-slate-400 pl-2">Select Crop:</span>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {commodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Highlights Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Highest Price Market */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <span>Highest Price Market</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">
            ₹{Number(highest_market?.current_price || 0).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">/ quintal</span>
          </div>
          <div className="text-xs text-slate-300 mt-1 font-semibold">
            {highest_market?.market} <span className="text-slate-400 font-normal">({highest_market?.state})</span>
          </div>
        </div>

        {/* National Average */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <span>Benchmark Mandi Average</span>
            <Scale className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">
            ₹{Math.round(average_price).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">/ quintal</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {markets.length} major active mandis
          </div>
        </div>

        {/* Lowest Price Market */}
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-br from-rose-950/30 to-slate-900 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
            <span>Lowest Price Market</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">
            ₹{Number(lowest_market?.current_price || 0).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">/ quintal</span>
          </div>
          <div className="text-xs text-slate-300 mt-1 font-semibold">
            {lowest_market?.market} <span className="text-slate-400 font-normal">({lowest_market?.state})</span>
          </div>
        </div>

      </div>

      {/* Dynamic Arbitrage Insight Box */}
      {dynamic_insight && (
        <div className="glass-panel rounded-2xl p-5 border border-brand-500/40 bg-gradient-to-r from-brand-950/60 via-slate-900 to-slate-900 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dynamic Market Intelligence</h4>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed font-medium">
                {dynamic_insight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart Visualization */}
      <MarketComparisonChart
        comparisonData={comparisonData}
        commodity={selectedCommodity}
      />

      {/* Detailed Market Comparison Table */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              All Reporting Mandis for {selectedCommodity}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked from highest to lowest prevailing wholesale rate
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
            {markets.length} Mandis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Market / Mandi</th>
                <th className="px-4 py-3.5">State & District</th>
                <th className="px-4 py-3.5 text-right">Current Modal Price</th>
                <th className="px-4 py-3.5 text-right">Price Range</th>
                <th className="px-4 py-3.5 text-right">7D Momentum</th>
                <th className="px-4 py-3.5 text-center">Trend State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
              {markets.map((m, idx) => {
                const isHighest = idx === 0;
                const isLowest = idx === markets.length - 1;

                return (
                  <tr key={m.market} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-bold">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                      <span>{m.market}</span>
                      {isHighest && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Highest
                        </span>
                      )}
                      {isLowest && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Lowest
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {m.district ? `${m.district}, ` : ''}{m.state}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-white text-sm">
                      ₹{Number(m.current_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      ₹{Number(m.min_price).toLocaleString('en-IN')} - ₹{Number(m.max_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span className={m.change_7d >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.change_7d >= 0 ? '+' : ''}{m.change_7d}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        m.trend === 'Rising' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        m.trend === 'Falling' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {m.trend}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
