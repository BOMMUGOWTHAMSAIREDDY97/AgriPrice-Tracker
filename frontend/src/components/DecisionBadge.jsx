import React from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Eye, AlertCircle, Sparkles } from 'lucide-react';

export default function DecisionBadge({ 
  recommendation = {}, 
  currentPrice, 
  forecastPrice, 
  horizon = 7,
  compact = false 
}) {
  const { action = 'MONITOR', color = 'amber', rationale, confidence_score = 92, disclaimer } = recommendation;

  const isWait = action.includes('WAIT');
  const isSell = action.includes('SELL');
  const isMonitor = !isWait && !isSell;

  const badgeTheme = isWait
    ? {
        bg: 'from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-400',
        pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-900/30',
        icon: TrendingUp,
        dot: 'bg-emerald-400',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
        emoji: '🟢'
      }
    : isSell
    ? {
        bg: 'from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/40 text-rose-400',
        pill: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-900/30',
        icon: TrendingDown,
        dot: 'bg-rose-400',
        glow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]',
        emoji: '🔴'
      }
    : {
        bg: 'from-amber-950/80 via-slate-900 to-slate-900 border-amber-500/40 text-amber-400',
        pill: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-900/30',
        icon: Eye,
        dot: 'bg-amber-400',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
        emoji: '🟡'
      };

  const Icon = badgeTheme.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${badgeTheme.pill} font-bold text-xs shadow-md`}>
        <span className="text-sm">{badgeTheme.emoji}</span>
        <span>{action}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${badgeTheme.bg} border p-5 relative overflow-hidden ${badgeTheme.glow} transition-all duration-300`}>
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 min-w-[48px] rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shadow-inner flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5 truncate">
              <Sparkles className="w-3 h-3 text-brand-400 flex-shrink-0" />
              <span className="truncate">AI Decision Support Recommendation</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>{badgeTheme.emoji}</span>
                <span>{action}</span>
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold whitespace-nowrap ${badgeTheme.pill}`}>
                {horizon}-Day Strategy
              </span>
            </div>
          </div>
        </div>

        {/* Confidence metric */}
        <div className="flex items-center gap-2.5 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 flex-shrink-0 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <div className="whitespace-nowrap">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Confidence</div>
            <div className="text-sm font-extrabold text-white">{confidence_score}%</div>
          </div>
        </div>
      </div>

      {/* Rationale description */}
      <div className="mt-3.5 space-y-2">
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {rationale || (
            isWait ? "Prices are estimated to increase over the next 7 days. Holding stock could yield better market returns." :
            isSell ? "Prices are estimated to decline over the next 7 days. Selling now protects against anticipated market downturn." :
            "Prices are expected to remain relatively stable. Monitor market arrivals before committing large shipments."
          )}
        </p>

        {/* Dynamic price comparison snippet */}
        {currentPrice && forecastPrice && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-2 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Current:</span>
              <span className="text-white">₹{Number(currentPrice).toLocaleString('en-IN')}/q</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Forecast:</span>
              <span className={forecastPrice >= currentPrice ? 'text-emerald-400' : 'text-rose-400'}>
                ₹{Number(forecastPrice).toLocaleString('en-IN')}/q
              </span>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="flex items-start gap-1.5 pt-2 text-[11px] text-slate-500">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {disclaimer || "Decision-support recommendation generated dynamically from ML model. Not guaranteed financial advice."}
          </span>
        </div>
      </div>
    </div>
  );
}
