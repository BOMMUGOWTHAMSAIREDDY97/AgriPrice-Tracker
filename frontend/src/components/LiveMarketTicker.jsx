import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Activity, 
  Pause, 
  Play, 
  ChevronRight, 
  Zap 
} from 'lucide-react';
import { fetchLiveRates } from '../services/api';
import { CATEGORY_ICONS, getCommodityCategory } from '../utils/commodityCategories';

export default function LiveMarketTicker({ onSelectCommodity }) {
  const [ratesData, setRatesData] = useState({ rates: [], top_gainers: [], top_losers: [], market_pulse: {} });
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTicker() {
      try {
        const data = await fetchLiveRates({ limit: 40 });
        setRatesData(data);
      } catch (e) {
        console.error('Ticker load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadTicker();

    // Auto-refresh ticker every 30 seconds
    const interval = setInterval(loadTicker, 30000);
    return () => clearInterval(interval);
  }, []);

  const { rates = [], market_pulse = {} } = ratesData;

  if (rates.length === 0 && !loading) return null;

  return (
    <div className="w-full bg-slate-950/90 border-y border-emerald-500/20 backdrop-blur-md relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        
        {/* Left Pulse Badge */}
        <div className="flex items-center gap-2 flex-shrink-0 bg-slate-900 border border-emerald-500/30 px-3 py-1 rounded-xl shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> LIVE MANDI PULSE
          </span>
          {market_pulse.advances !== undefined && (
            <span className="hidden sm:inline-flex text-[10px] font-mono text-slate-400 ml-1 border-l border-slate-800 pl-2">
              <span className="text-emerald-400 font-bold">▲{market_pulse.advances}</span> / <span className="text-rose-400 font-bold">▼{market_pulse.declines}</span>
            </span>
          )}
        </div>

        {/* Scrolling Ticker Track */}
        <div 
          className="flex-1 overflow-hidden relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex items-center gap-6 whitespace-nowrap animate-marquee ${isPaused ? 'pause-animation' : ''}`}>
            {rates.concat(rates).map((item, idx) => {
              const isUp = item.direction === 'UP';
              const isDown = item.direction === 'DOWN';
              const cat = item.category || getCommodityCategory(item.commodity);

              return (
                <button
                  key={`${item.commodity}-${item.market}-${idx}`}
                  onClick={() => onSelectCommodity && onSelectCommodity(item.commodity, item.market)}
                  className="inline-flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 px-3 py-1 rounded-xl transition text-xs flex-shrink-0 group text-left"
                >
                  <span className="text-sm">{CATEGORY_ICONS[cat] || '🌱'}</span>
                  <span className="font-bold text-white group-hover:text-emerald-400 transition">
                    {item.commodity}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ₹{item.current_price.toLocaleString('en-IN')}
                  </span>

                  {/* Day-over-Day UP / DOWN Chip */}
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isUp 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : isDown 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isUp && <TrendingUp className="w-2.5 h-2.5" />}
                    {isDown && <TrendingDown className="w-2.5 h-2.5" />}
                    <span>{isUp ? '+' : ''}{item.day_change_pct}%</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ticker Play / Pause toggle */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition flex-shrink-0"
          title={isPaused ? 'Resume live ticker' : 'Pause ticker'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

      </div>
    </div>
  );
}
