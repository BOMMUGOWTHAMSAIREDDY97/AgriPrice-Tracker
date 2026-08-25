import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  AlertTriangle, 
  Award, 
  Activity, 
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { fetchInsights } from '../services/api';

export default function InsightsPage() {
  const [insights, setInsights] = useState({
    top_rising: [],
    top_falling: [],
    most_volatile: [],
    highest_priced_markets: [],
    unusual_movements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchInsights();
        setInsights(data);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const {
    top_rising = [],
    top_falling = [],
    most_volatile = [],
    highest_priced_markets = [],
    unusual_movements = []
  } = insights;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-400 mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Automated Market Anomaly Detection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Market Intelligence & Anomalies
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Algorithmic scanning across all commodities and mandis to spot momentum surges, abnormal dips, volatility spikes, and arbitrage windows.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Updated with latest mandi arrival feeds</span>
          </div>
        </div>
      </div>

      {/* Unusual Price Movements & Anomaly Cards */}
      <div className="glass-panel rounded-2xl p-5 border border-brand-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Unusual Price Movements & Spikes
              </h3>
              <p className="text-xs text-slate-400">
                Significant deviations (≥ 8%) from 7-day rolling moving average
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold">
            {unusual_movements.length} Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {unusual_movements.map((anomaly, idx) => {
            const isSpike = anomaly.direction === 'SPIKE_UP';
            return (
              <div 
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between transition hover:scale-[1.01] ${
                  isSpike 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      {anomaly.commodity} · {anomaly.market}
                    </span>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {anomaly.state}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${
                    isSpike 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {anomaly.deviation_pct >= 0 ? '+' : ''}{anomaly.deviation_pct}% move
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {anomaly.text}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-white/10 text-slate-400">
                  <span>Current: <strong className="text-white">₹{anomaly.current_price}</strong></span>
                  <span>7D MA: <strong className="text-slate-300">₹{anomaly.ma_7d}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Top Rising vs Top Falling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Rising */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Top Rising Commodities</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Highest 7D Gains</span>
            </div>

            <div className="space-y-3">
              {top_rising.map((item, idx) => (
                <div 
                  key={item.commodity}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between hover:bg-slate-800/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-slate-500">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{item.commodity}</div>
                      <div className="text-[11px] text-slate-400">{item.markets_count} reporting mandis</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>+{item.change_7d_pct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Avg ₹{item.current_avg_price}/q</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Falling */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <TrendingDown className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Top Falling Commodities</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Largest 7D Drops</span>
            </div>

            <div className="space-y-3">
              {top_falling.map((item, idx) => (
                <div 
                  key={item.commodity}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between hover:bg-slate-800/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-slate-500">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{item.commodity}</div>
                      <div className="text-[11px] text-slate-400">{item.markets_count} reporting mandis</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-rose-400 flex items-center justify-end gap-0.5">
                      <ArrowDownRight className="w-4 h-4" />
                      <span>{item.change_7d_pct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Avg ₹{item.current_avg_price}/q</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Most Volatile & Highest Priced Markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Volatile Commodities */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Most Volatile Commodities</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Std Dev / Mean %</span>
          </div>

          <div className="space-y-3">
            {most_volatile.map((item, idx) => (
              <div 
                key={item.commodity}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between hover:bg-slate-800/80 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-slate-500">#{idx + 1}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{item.commodity}</div>
                    <div className="text-[11px] text-slate-400">Avg ₹{item.current_avg_price}/q</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-amber-400">
                    {item.volatility_pct}% Vol
                  </div>
                  <div className="text-[11px] text-slate-400">High price swings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest-Priced Mandis */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2 text-brand-400">
              <Award className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Highest-Priced Markets</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Premium Realizations</span>
          </div>

          <div className="space-y-3">
            {highest_priced_markets.map((item, idx) => (
              <div 
                key={`${item.commodity}-${item.market}-${idx}`}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between hover:bg-slate-800/80 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-slate-500">#{idx + 1}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{item.commodity}</div>
                    <div className="text-[11px] text-slate-400">{item.market} ({item.state})</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-brand-400">
                    ₹{Number(item.modal_price).toLocaleString('en-IN')}/q
                  </div>
                  <div className="text-[11px] text-slate-400">Top market rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
