import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import { Award, TrendingUp, Info } from 'lucide-react';

export default function MarketComparisonChart({
  comparisonData = {},
  commodity = 'Tomato',
  onSelectMarket
}) {
  const {
    markets = [],
    highest_market,
    lowest_market,
    average_price = 0,
    dynamic_insight
  } = comparisonData;

  // Take top 10 markets for clean visual rendering
  const displayMarkets = markets.slice(0, 10);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const diffFromAvg = average_price > 0 
        ? (((data.current_price - average_price) / average_price) * 100).toFixed(1)
        : 0;

      return (
        <div className="glass-panel bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-1.5 z-50">
          <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>{data.market}</span>
            <span className="text-[11px] text-slate-400">{data.state}</span>
          </div>
          <div className="space-y-1 text-slate-200">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Current Modal Price:</span>
              <span className="font-extrabold text-white text-sm">
                ₹{Number(data.current_price).toLocaleString('en-IN')}/q
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">7D Momentum:</span>
              <span className={`font-semibold ${data.change_7d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.change_7d >= 0 ? '+' : ''}{data.change_7d}% ({data.trend})
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px] pt-1 border-t border-slate-800 text-slate-400">
              <span>Diff from Average:</span>
              <span className={Number(diffFromAvg) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {Number(diffFromAvg) >= 0 ? '+' : ''}{diffFromAvg}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Cross-Mandi Price Comparison
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">
              {commodity}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inter-market price arbitrage and spread across Indian agricultural mandis
          </p>
        </div>

        {/* Average Price Pill */}
        {average_price > 0 && (
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
            <span className="text-slate-400">Mandi Avg:</span>
            <span className="font-extrabold text-white text-sm">
              ₹{Math.round(average_price).toLocaleString('en-IN')}/q
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Arbitrage Insight Box */}
      {dynamic_insight && (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-brand-950/40 to-slate-900/60 border border-brand-500/30 flex items-start gap-2.5 text-xs text-slate-200">
          <Award className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-brand-400">Arbitrage Intelligence: </span>
            <span>{dynamic_insight}</span>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="w-full h-72 sm:h-80">
        {displayMarkets.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No market comparison data available for {commodity}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayMarkets}
              margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              onClick={(state) => {
                if (state && state.activePayload && onSelectMarket) {
                  onSelectMarket(state.activePayload[0].payload.market);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
              
              <XAxis
                dataKey="market"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />

              {/* Average reference line */}
              {average_price > 0 && (
                <ReferenceLine 
                  y={average_price} 
                  stroke="#fbbf24" 
                  strokeDasharray="4 4" 
                  label={{ value: `Avg: ₹${Math.round(average_price)}`, fill: '#fbbf24', fontSize: 10, position: 'right' }} 
                />
              )}

              <Bar 
                dataKey="current_price" 
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              >
                {displayMarkets.map((entry, index) => {
                  const isHighest = highest_market && entry.market === highest_market.market;
                  const isLowest = lowest_market && entry.market === lowest_market.market;
                  
                  let fill = '#3b82f6'; // default blue
                  if (isHighest) fill = '#22c55e'; // highest green
                  else if (isLowest) fill = '#f43f5e'; // lowest red
                  else if (entry.current_price >= average_price) fill = '#10b981';

                  return <Cell key={`cell-${index}`} fill={fill} className="cursor-pointer hover:opacity-80 transition-opacity" />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-300 font-medium">Highest / Above Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-slate-300 font-medium">Standard Markets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-300 font-medium">Lowest Market</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Click any bar to focus on that market
        </div>
      </div>
    </div>
  );
}
