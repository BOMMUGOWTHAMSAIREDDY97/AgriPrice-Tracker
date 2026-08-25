import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, DollarSign, TrendingUp, AlertCircle, Sparkles, Scale } from 'lucide-react';

export default function ProfitSimulator({
  commodity = 'Tomato',
  market = 'Rajkot',
  currentModalPrice = 2800, // per quintal (100 kg)
  forecastModalPrice = 3080, // per quintal (100 kg)
  horizon = 7
}) {
  const [quantityKg, setQuantityKg] = useState(1000); // 1000 kg default (10 quintals)
  const [unit, setUnit] = useState('kg'); // 'kg' or 'quintal'

  const currentPricePerKg = currentModalPrice / 100;
  const forecastPricePerKg = forecastModalPrice / 100;

  const currentTotalValue = Math.round(quantityKg * currentPricePerKg);
  const futureTotalValue = Math.round(quantityKg * forecastPricePerKg);
  const valueDifference = futureTotalValue - currentTotalValue;
  const diffPct = currentTotalValue > 0 ? ((valueDifference / currentTotalValue) * 100).toFixed(1) : 0;
  const isPositive = valueDifference >= 0;

  const presetQuantities = [
    { label: '500 kg (5 qtl)', val: 500 },
    { label: '1,000 kg (10 qtl)', val: 1000 },
    { label: '2,500 kg (25 qtl)', val: 2500 },
    { label: '5,000 kg (50 qtl)', val: 5000 },
    { label: '10,000 kg (100 qtl)', val: 10000 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-700/70 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md shadow-brand-500/20">
            <Calculator className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>What If I Sell Later?</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30">
                Profit Simulator
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate the monetary impact of holding vs immediate mandi selling for {commodity} in {market}
            </p>
          </div>
        </div>

        {/* Horizon Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>{horizon}-Day Forecast Horizon</span>
        </div>
      </div>

      {/* Main Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        
        {/* Left column: Quantity & Price Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
              <label className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Scale className="w-4 h-4 text-brand-400" />
                <span>Quantity to Sell:</span>
              </label>
              <div className="text-brand-400 font-bold">
                {quantityKg.toLocaleString('en-IN')} kg ({(quantityKg / 100).toFixed(1)} Quintals)
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
            />
            
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetQuantities.map((p) => (
                <button
                  key={p.val}
                  onClick={() => setQuantityKg(p.val)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition ${
                    quantityKg === p.val
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Rate Comparison cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
              <div className="text-slate-400">Current Mandi Rate</div>
              <div className="text-base font-bold text-white mt-0.5">
                ₹{currentPricePerKg.toFixed(2)} <span className="text-[11px] text-slate-400 font-normal">/ kg</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                ₹{Number(currentModalPrice).toLocaleString('en-IN')} / quintal
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
              <div className="text-slate-400">Predicted Future Rate ({horizon}d)</div>
              <div className={`text-base font-bold mt-0.5 ${forecastPricePerKg >= currentPricePerKg ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{forecastPricePerKg.toFixed(2)} <span className="text-[11px] text-slate-400 font-normal">/ kg</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                ₹{Number(forecastModalPrice).toLocaleString('en-IN')} / quintal
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Simulation Result Box */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/80 shadow-xl">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700/80">
              <span className="text-slate-400 font-medium">Estimated Value If Sold Today</span>
              <span className="font-bold text-white text-sm">
                ₹{currentTotalValue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700/80">
              <span className="text-slate-400 font-medium">Estimated Value In {horizon} Days</span>
              <span className="font-bold text-white text-sm">
                ₹{futureTotalValue.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Difference Highlight */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isPositive 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider opacity-80">
                  {isPositive ? 'Potential Value Gain' : 'Estimated Value Loss'}
                </div>
                <div className="text-xl sm:text-2xl font-black mt-0.5">
                  {isPositive ? '+' : ''}₹{valueDifference.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                  isPositive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {isPositive ? '+' : ''}{diffPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Realistic Disclaimer / Caveat */}
          <div className="flex items-start gap-1.5 mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-snug">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Potential difference before transportation, storage, commissions, spoilage and other operating costs.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
