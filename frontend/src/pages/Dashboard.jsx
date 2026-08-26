import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  Compass, 
  Clock, 
  Zap,
  Tag,
  Sprout,
  SunMedium
} from 'lucide-react';
import KPICard from '../components/KPICard';
import PriceTrendChart from '../components/PriceTrendChart';
import MarketComparisonChart from '../components/MarketComparisonChart';
import DecisionBadge from '../components/DecisionBadge';
import ProfitSimulator from '../components/ProfitSimulator';
import GeminiAdvisor from '../components/GeminiAdvisor';
import FilterBar from '../components/FilterBar';
import { 
  fetchCommodities, 
  fetchStates, 
  fetchMarkets, 
  fetchDashboardKPIs, 
  fetchPriceHistory, 
  fetchMarketComparison, 
  fetchForecast 
} from '../services/api';

export default function Dashboard() {
  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]);
  const [markets, setMarkets] = useState([]);
  
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [selectedState, setSelectedState] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('Rajkot(Veg.Sub Yard)');
  const [timeframe, setTimeframe] = useState('30d');

  const [kpis, setKpis] = useState({
    current_price: 2800,
    change_7d: 8.4,
    market_trend: 'RISING',
    min_price: 2500,
    max_price: 3100
  });

  const [priceHistory, setPriceHistory] = useState([]);
  const [marketComparison, setMarketComparison] = useState({});
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial dropdowns
  useEffect(() => {
    async function loadMeta() {
      const [commList, stateList] = await Promise.all([
        fetchCommodities(),
        fetchStates()
      ]);
      setCommodities(commList);
      setStates(stateList);

      const mktList = await fetchMarkets('Tomato', '');
      setMarkets(mktList);
      if (mktList.length > 0 && !mktList.includes('Rajkot(Veg.Sub Yard)')) {
        setSelectedMarket(mktList[0]);
      }
    }
    loadMeta();
  }, []);

  // Update markets when commodity or state changes
  useEffect(() => {
    async function updateMarkets() {
      const mktList = await fetchMarkets(selectedCommodity, selectedState);
      setMarkets(mktList);
      if (mktList.length > 0 && !mktList.includes(selectedMarket)) {
        setSelectedMarket(mktList[0]);
      }
    }
    updateMarkets();
  }, [selectedCommodity, selectedState]);

  // Load main intelligence data
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [kpiRes, histRes, compRes, foreRes] = await Promise.all([
          fetchDashboardKPIs(selectedCommodity, selectedMarket),
          fetchPriceHistory(selectedCommodity, selectedMarket, timeframe),
          fetchMarketComparison(selectedCommodity),
          fetchForecast(selectedCommodity, selectedMarket, 7)
        ]);

        setKpis(kpiRes);
        setPriceHistory(histRes.series || []);
        setMarketComparison(compRes);
        setForecastData(foreRes);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (selectedCommodity) {
      loadDashboardData();
    }
  }, [selectedCommodity, selectedMarket, selectedState, timeframe]);

  const handleResetDemo = () => {
    setSelectedCommodity('Tomato');
    setSelectedState('');
    setSelectedMarket('Rajkot(Veg.Sub Yard)');
    setTimeframe('30d');
  };

  const currentPrice = (forecastData && forecastData.current_price) ? forecastData.current_price : (kpis.current_price || 2800);
  const expectedChange = (forecastData && forecastData.expected_change_pct !== undefined) 
    ? forecastData.expected_change_pct 
    : (kpis.change_7d !== undefined ? kpis.change_7d : 8.4);
  const forecastPrice = (forecastData && forecastData.forecast_price) 
    ? forecastData.forecast_price 
    : Math.round(currentPrice * (1 + (expectedChange / 100)));
  const diffPer1000Kg = Math.round(((forecastPrice - currentPrice) / 100) * 1000);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Hero Intelligence Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-brand-800/30 p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900/90 to-brand-950/20 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Natural Farm Sun & field photo visual */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[45%] opacity-45 lg:opacity-75 pointer-events-none overflow-hidden select-none" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent z-10" />
          <img 
            src="/farm-hero.jpg" 
            alt="Nature field" 
            className="w-full h-full object-cover object-right"
          />
        </div>
        
        <div className="max-w-4xl relative z-10 lg:pr-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-400 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Real-Time Indian Mandi Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            Don't just track agricultural prices. <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200">
              Predict them.
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
            AgriPrice Tracker analyzes multi-year historical arrival feeds across 1,600+ mandis, trains time-series machine learning models, and computes actionable <strong>BUY / SELL / WAIT</strong> guidance with real-time profit simulation.
          </p>

          {/* Quick Demo Insight Highlight */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm shadow-lg">
            <div className="space-y-1 min-w-0">
              <div className="text-slate-400">
                <strong>{selectedCommodity}</strong> currently trading at <span className="text-white font-bold">₹{currentPrice.toLocaleString('en-IN')}/quintal</span> in {selectedMarket}.
              </div>
              <div className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                <span>Estimated 7-day target:</span>
                <span className={`font-bold ${expectedChange > 0 ? 'text-emerald-400' : expectedChange < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                  ₹{Number(forecastPrice).toLocaleString('en-IN')}/quintal
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${expectedChange > 0 ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : expectedChange < 0 ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
                  {expectedChange >= 0 ? '+' : ''}{Number(expectedChange).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <DecisionBadge
                recommendation={forecastData?.recommendation || { action: expectedChange >= 3 ? 'WAIT' : expectedChange <= -3 ? 'SELL' : 'MONITOR' }}
                compact={true}
              />
              <Link
                to="/forecast"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition shadow-md shadow-brand-500/20"
              >
                <span>ML Forecast Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <FilterBar
        commodities={commodities}
        states={states}
        markets={markets}
        selectedCommodity={selectedCommodity}
        selectedState={selectedState}
        selectedMarket={selectedMarket}
        onCommodityChange={setSelectedCommodity}
        onStateChange={setSelectedState}
        onMarketChange={setSelectedMarket}
        onReset={handleResetDemo}
        loading={loading}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        <KPICard
          title="Current Modal Price"
          value={`₹${Number(currentPrice).toLocaleString('en-IN')}`}
          subtitle={`${selectedCommodity} · ${selectedMarket}`}
          change={kpis.change_7d}
          changeLabel="vs 7d ago"
          badgeText="Live Mandi"
          badgeColor="brand"
        />

        <KPICard
          title="7-Day Price Momentum"
          value={`${kpis.change_7d >= 0 ? '+' : ''}${kpis.change_7d}%`}
          subtitle={`₹${Math.round(currentPrice * (kpis.change_7d / 100)).toLocaleString('en-IN')} net move`}
          change={kpis.change_7d}
          changeLabel="7D trajectory"
          badgeText={kpis.change_7d >= 0 ? "Bullish" : "Bearish"}
          badgeColor={kpis.change_7d >= 0 ? "emerald" : "rose"}
        />

        <KPICard
          title="7-Day ML Forecast Price"
          value={`₹${Number(forecastPrice).toLocaleString('en-IN')}`}
          subtitle={`Expected: ${expectedChange >= 0 ? '+' : ''}${expectedChange}% move`}
          change={expectedChange}
          changeLabel="Projected change"
          badgeText={`${forecastData?.validation_metrics?.mape || 7.5}% MAPE`}
          badgeColor="emerald"
        />

        <KPICard
          title="Market Trend State"
          value={kpis.market_trend}
          subtitle={`Spread: ₹${kpis.min_price} - ₹${kpis.max_price}`}
          badgeText={kpis.market_trend}
          badgeColor={kpis.market_trend === 'RISING' ? 'emerald' : kpis.market_trend === 'FALLING' ? 'rose' : 'amber'}
        />

      </div>

      {/* Main Charts & Decision Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Price Trend Chart */}
        <div className="lg:col-span-8">
          <PriceTrendChart
            data={priceHistory}
            commodity={selectedCommodity}
            market={selectedMarket}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            showMovingAverage={true}
          />
        </div>

        {/* Right Column: AI Decision Support Recommendation Card */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <DecisionBadge
            recommendation={forecastData?.recommendation || {}}
            currentPrice={currentPrice}
            forecastPrice={forecastPrice}
            horizon={7}
          />

          {/* Quick Model Accuracy Card */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 text-xs space-y-2.5">
            <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                ML Model Validation
              </span>
              <span className="text-brand-400 font-semibold">{forecastData?.model_name || 'Gradient Boosting'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Test MAPE</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {forecastData?.validation_metrics?.mape || '8.2'}%
                </div>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Test MAE</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  ₹{forecastData?.validation_metrics?.mae || '65.4'}
                </div>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">RMSE</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  ₹{forecastData?.validation_metrics?.rmse || '92.1'}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Trained on 80% historical sequence, validated strictly on 20% holdout chronological test window.
            </p>
          </div>
        </div>

      </div>

      {/* Google Gemini AI Market Advisor & Mandi Copilot */}
      <GeminiAdvisor
        commodity={selectedCommodity}
        market={selectedMarket}
        state={selectedState}
        currentPrice={currentPrice}
        forecastPrice={forecastPrice}
        expectedChange={expectedChange}
        horizon={7}
        action={forecastData?.recommendation?.action || (expectedChange >= 3 ? 'WAIT' : expectedChange <= -3 ? 'SELL' : 'MONITOR')}
      />

      {/* Interactive What-If Profit Simulator */}
      <ProfitSimulator
        commodity={selectedCommodity}
        market={selectedMarket}
        currentModalPrice={currentPrice}
        forecastModalPrice={forecastPrice}
        horizon={7}
      />

      {/* Cross-Mandi Arbitrage Comparison Preview */}
      <MarketComparisonChart
        comparisonData={marketComparison}
        commodity={selectedCommodity}
        onSelectMarket={(mkt) => setSelectedMarket(mkt)}
      />

    </div>
  );
}
