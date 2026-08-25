import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  change, 
  changeLabel = 'vs 7d ago', 
  icon: Icon, 
  badgeText, 
  badgeColor = 'brand',
  trendType // 'up' | 'down' | 'neutral'
}) {
  const isPositive = typeof change === 'number' ? change > 0 : change?.startsWith('+');
  const isNegative = typeof change === 'number' ? change < 0 : change?.startsWith('-');
  const isNeutral = !isPositive && !isNegative;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group">
      {/* Subtle top edge light highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
      
      {/* Top row: Title + Icon / Badge */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-brand-400 shadow-inner">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        {badgeText && (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
            badgeColor === 'emerald' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
            badgeColor === 'rose' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
            badgeColor === 'amber' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
            'bg-brand-500/15 text-brand-400 border-brand-500/30'
          }`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mb-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </div>
        )}
      </div>

      {/* Bottom Change Pill */}
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
            isPositive ? 'bg-emerald-500/15 text-emerald-400' :
            isNegative ? 'bg-rose-500/15 text-rose-400' :
            'bg-slate-800 text-slate-300'
          }`}>
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5" />}
            <span>{typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}</span>
          </div>
          <span className="text-slate-500">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
