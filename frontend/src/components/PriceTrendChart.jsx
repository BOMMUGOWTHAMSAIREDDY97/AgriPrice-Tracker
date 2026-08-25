import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Calendar, TrendingUp, Filter, Maximize2 } from 'lucide-react';

export default function PriceTrendChart({ 
  data = [], 
  commodity = 'Tomato', 
  market = 'Rajkot', 
  timeframe = '30d', 
  onTimeframeChange,
  showMovingAverage = true 
}) {
  const [activeRange, setActiveRange] = useState(timeframe);

  const ranges = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' }
  ];

  const handleRangeSelect = (val) => {
    setActiveRange(val);
    if (onTimeframeChange) {
      onTimeframeChange(val);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="glass-panel bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-1.5 z-50">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-[10px] text-brand-400 font-semibold">{pData.market || market}</span>
          </div>
          <div className="space-y-1 text-slate-200">
            <div className="flex items-center justify-between gap-4">
              <span className="text-brand-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                Modal Price:
              </span>
              <span className="font-bold text-white text-sm">
                ₹{Number(pData.modal_price || 0).toLocaleString('en-IN')}/q
              </span>
            </div>
            {pData.ma_7 && (
              <div className="flex items-center justify-between gap-4 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  7-Day MA:
                </span>
                <span className="font-medium text-amber-300">
                  ₹{Number(pData.ma_7).toLocaleString('en-IN')}/q
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>Mandi Range:</span>
              <span>
                ₹{Number(pData.min_price || 0).toLocaleString('en-IN')} - ₹{Number(pData.max_price || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format date labels
  const formattedData = data.map(item => {
    let dStr = item.date;
    if (dStr && dStr.includes('T')) dStr = dStr.split('T')[0];
    if (dStr && dStr.includes(' ')) dStr = dStr.split(' ')[0];
    return {
      ...item,
      displayDate: dStr ? dStr.slice(5) : ''
    };
  });

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-full">
      {/* Header with Title and Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Price Trend & Volatility Analysis
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">
              {commodity} ({market})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical modal price with 7-day moving average and mandi price spread
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRangeSelect(r.value)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeRange === r.value
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80 relative">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No historical data available for selected filter.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
              
              <XAxis 
                dataKey="displayDate" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Price Band Area */}
              <Area 
                type="monotone" 
                dataKey="max_price" 
                stroke="transparent" 
                fill="url(#rangeGradient)" 
                name="Max Price Band"
              />

              {/* Modal Price Line & Area */}
              <Area 
                type="monotone" 
                dataKey="modal_price" 
                stroke="#22c55e" 
                strokeWidth={2.5}
                fill="url(#priceGradient)" 
                name="Modal Price"
              />

              {/* Moving Average Line */}
              {showMovingAverage && (
                <Line 
                  type="monotone" 
                  dataKey="ma_7" 
                  stroke="#fbbf24" 
                  strokeWidth={1.8} 
                  strokeDasharray="4 4"
                  dot={false}
                  name="7-Day Moving Avg"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-brand-500 rounded-full" />
            <span className="text-slate-300 font-medium">Modal Price (₹/Quintal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 rounded-full border-dashed" />
            <span className="text-slate-300 font-medium">7-Day Moving Average</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 bg-sky-400/20 border border-sky-400/40 rounded" />
            <span className="text-slate-300 font-medium">Min/Max Range Band</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Source: Indian Mandis Wholesale Arrival Feeds
        </div>
      </div>
    </div>
  );
}
