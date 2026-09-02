import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';
import { fetchPriceHistory } from '../services/api';

const formatDate = (value, options) => {
  if (!value) return '';
  const date = new Date(value + 'T00:00:00Z');
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...options }).format(date);
};

const formatSeriesData = (series = []) => {
  return series.map(item => {
    let dStr = item.date;
    if (dStr && dStr.includes('T')) dStr = dStr.split('T')[0];
    if (dStr && dStr.includes(' ')) dStr = dStr.split(' ')[0];
    return {
      ...item,
      date: dStr,
      displayDate: formatDate(dStr, { day: '2-digit', month: 'short' })
    };
  });
};

const RANGES = [
  { label: '7D',  value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y',  value: '1y' }
];

export default function PriceTrendChart({
  data,
  commodity = 'Tomato',
  market = 'Rajkot',
  timeframe = '30d',
  onTimeframeChange,
  showMovingAverage = true
}) {
  const [activeRange, setActiveRange] = useState(timeframe);
  const [chartData, setChartData] = useState(() => (Array.isArray(data) && data.length > 0 ? formatSeriesData(data) : []));
  const [loading, setLoading] = useState(false);

  // Sync with data prop when passed and non-empty
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setChartData(formatSeriesData(data));
    }
  }, [data]);

  // Keep activeRange in sync if parent changes timeframe externally
  useEffect(() => {
    setActiveRange(timeframe);
  }, [timeframe]);

  // Fetch price history using central API service (properly respects Vercel/Render VITE_API_URL)
  const loadHistory = useCallback(async (tf) => {
    if (!commodity || !market) return;
    setLoading(true);
    try {
      const json = await fetchPriceHistory(commodity, market, tf);
      const formatted = formatSeriesData(json.series || []);
      if (formatted.length > 0) {
        setChartData(formatted);
      }
    } catch (e) {
      console.error('PriceTrendChart fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [commodity, market]);

  // Load when commodity, market, or activeRange changes
  useEffect(() => {
    loadHistory(activeRange);
  }, [loadHistory, activeRange]);

  // Handle timeframe button click
  const handleRangeSelect = (val) => {
    setActiveRange(val);
    loadHistory(val);
    if (onTimeframeChange) {
      onTimeframeChange(val);
    }
  };

  // Custom Tooltip — reads full data from the row directly
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    // The payload may have entries for max_price, modal_price, ma_7
    // Use any entry's .payload which is the full row object
    const row = payload[0]?.payload;
    if (!row) return null;

    const modalPrice = Number(row.modal_price || 0);
    const ma7 = Number(row.ma_7 || 0);
    const minPrice = Number(row.min_price || 0);
    const maxPrice = Number(row.max_price || 0);
    const dateStr = row.date;
    const mkt = row.market || market;

    return (
      <div style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(51,65,85,0.9)', borderRadius: 16, padding: '12px 14px', minWidth: 210, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: 8, marginBottom: 8 }}>
          <span style={{ fontWeight: 800, color: '#34d399', fontSize: 12 }}>
            {formatDate(dateStr, { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 6, padding: '1px 7px' }}>
            {mkt}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 600, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
            Modal Price:
          </span>
          <span style={{ fontWeight: 900, color: '#fff', fontSize: 14 }}>
            ₹{modalPrice.toLocaleString('en-IN')}/q
          </span>
        </div>

        {ma7 > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 600, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              7-Day MA:
            </span>
            <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: 12 }}>
              ₹{ma7.toLocaleString('en-IN')}/q
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: 7, marginTop: 2, fontSize: 11, color: '#94a3b8' }}>
          <span>Mandi Range:</span>
          <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
            ₹{minPrice.toLocaleString('en-IN')} – ₹{maxPrice.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    );
  };

  // X-axis tick interval — avoids label crowding
  let tickInterval = 0;
  if (chartData.length > 200) tickInterval = 28;
  else if (chartData.length > 60) tickInterval = 8;
  else if (chartData.length > 14) tickInterval = 3;
  else tickInterval = 0;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col h-full bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 pb-3.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Price Trend &amp; Volatility Analysis
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              {commodity} ({market})
            </span>
            {chartData.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                ● {chartData.length} Daily Nodes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical modal price with 7-day moving average and mandi price spread
          </p>
        </div>

        {/* ── Timeframe Buttons ── */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start flex-shrink-0 shadow-inner">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRangeSelect(r.value)}
              disabled={loading}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all select-none ${
                activeRange === r.value
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer'
              } disabled:opacity-60`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHART ── */}
      <div className="w-full h-72 sm:h-80 relative flex-1">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading {activeRange.toUpperCase()} price history...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No historical data available for selected filter.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.13} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />

              <XAxis
                dataKey="displayDate"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={tickInterval}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />

              {/* Shared tooltip reads full row payload */}
              <Tooltip content={<CustomTooltip />} />

              {/* Min/Max Mandi Spread Band */}
              <Area
                type="monotone"
                dataKey="max_price"
                stroke="transparent"
                fill="url(#rangeGradient)"
                name="Max Band"
                legendType="none"
                isAnimationActive={false}
              />

              {/* Modal Price + fill gradient */}
              <Area
                type="monotone"
                dataKey="modal_price"
                stroke="#10b981"
                strokeWidth={2.8}
                fill="url(#priceGradient)"
                name="Modal Price"
                dot={chartData.length <= 35
                  ? { r: 3.5, fill: '#10b981', stroke: '#022c22', strokeWidth: 1.5 }
                  : false}
                activeDot={{ r: 7, stroke: '#34d399', strokeWidth: 3, fill: '#064e3b' }}
                isAnimationActive={false}
              />

              {/* 7-Day Moving Average */}
              {showMovingAverage && (
                <Line
                  type="monotone"
                  dataKey="ma_7"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#78350f' }}
                  name="7-Day MA"
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── FOOTER LEGEND ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-emerald-500 rounded-full inline-block" />
            <span className="text-slate-200 font-semibold">Modal Price (₹/Quintal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-amber-400 rounded-full inline-block" style={{ borderTop: '2px dashed #fbbf24', height: 0 }} />
            <span className="text-slate-300 font-medium">7-Day Moving Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-400/20 border border-sky-400/40 rounded inline-block" />
            <span className="text-slate-300 font-medium">Min/Max Spread</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span>Each node = 1 calendar day of mandi arrivals</span>
        </div>
      </div>
    </div>
  );
}
