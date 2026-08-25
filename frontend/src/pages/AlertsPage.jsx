import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { fetchCommodities, fetchMarkets } from '../services/api';

export default function AlertsPage() {
  const [commodities, setCommodities] = useState([]);
  const [markets, setMarkets] = useState([]);

  // Alert Form State
  const [commodity, setCommodity] = useState('Tomato');
  const [market, setMarket] = useState('Rajkot(Veg.Sub Yard)');
  const [conditionType, setConditionType] = useState('INCREASE_PCT'); // INCREASE_PCT, DECREASE_PCT, PRICE_ABOVE, PRICE_BELOW
  const [thresholdValue, setThresholdValue] = useState(10); // 10%

  // Default active alerts
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      commodity: 'Tomato',
      market: 'Rajkot(Veg.Sub Yard)',
      conditionType: 'INCREASE_PCT',
      thresholdValue: 10,
      status: 'TRIGGERED',
      triggeredAt: '2025-05-19',
      currentPrice: 1500,
      baselinePrice: 1300,
      message: 'Tomato in Rajkot(Veg.Sub Yard) increased +15.4% over 7 days, exceeding +10% threshold.'
    },
    {
      id: 2,
      commodity: 'Onion',
      market: 'Surat',
      conditionType: 'DECREASE_PCT',
      thresholdValue: 8,
      status: 'ACTIVE',
      triggeredAt: null,
      currentPrice: 1350,
      baselinePrice: 1400,
      message: 'Monitoring Surat Mandi for price drop below -8%.'
    },
    {
      id: 3,
      commodity: 'Wheat',
      market: 'Kota',
      conditionType: 'PRICE_ABOVE',
      thresholdValue: 2600,
      status: 'ACTIVE',
      triggeredAt: null,
      currentPrice: 2500,
      baselinePrice: 2400,
      message: 'Monitoring Kota Mandi for modal price exceeding ₹2,600/q.'
    }
  ]);

  const [notificationSuccess, setNotificationSuccess] = useState('');

  useEffect(() => {
    async function loadMeta() {
      const commList = await fetchCommodities();
      setCommodities(commList);
      const mktList = await fetchMarkets('Tomato', '');
      setMarkets(mktList);
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function updateMarkets() {
      const mktList = await fetchMarkets(commodity, '');
      setMarkets(mktList);
      if (mktList.length > 0 && !mktList.includes(market)) {
        setMarket(mktList[0]);
      }
    }
    updateMarkets();
  }, [commodity]);

  const handleCreateAlert = (e) => {
    e.preventDefault();
    const newAlert = {
      id: Date.now(),
      commodity,
      market,
      conditionType,
      thresholdValue: Number(thresholdValue),
      status: 'ACTIVE',
      triggeredAt: null,
      currentPrice: 2800,
      baselinePrice: 2800,
      message: `Watching ${commodity} in ${market} for ${
        conditionType === 'INCREASE_PCT' ? `price rise > +${thresholdValue}%` :
        conditionType === 'DECREASE_PCT' ? `price decline < -${thresholdValue}%` :
        conditionType === 'PRICE_ABOVE' ? `price above ₹${thresholdValue}` :
        `price below ₹${thresholdValue}`
      }.`
    };

    setAlerts([newAlert, ...alerts]);
    setNotificationSuccess(`Alert successfully configured for ${commodity} in ${market}!`);
    setTimeout(() => setNotificationSuccess(''), 4000);
  };

  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-400 mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Smart Mandi Threshold Watcher</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Price Alert Rules & Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Set automated notifications for sudden price surges, harvest arrival dumps, or target realization limits.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3.5 py-2 rounded-xl">
            <Sparkles className="w-4 h-4" />
            <span>Simulated Instant Trigger Engine</span>
          </div>
        </div>
      </div>

      {notificationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{notificationSuccess}</span>
        </div>
      )}

      {/* Main Grid: Create Alert Form + Active Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Create Alert Form */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Plus className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Create New Alert Rule</h3>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              {/* Commodity */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Crop / Commodity
                </label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {commodities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Mandi Market */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Mandi / Market
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {markets.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Condition Type */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Trigger Condition
                </label>
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="INCREASE_PCT">Price increases above X%</option>
                  <option value="DECREASE_PCT">Price decreases below X%</option>
                  <option value="PRICE_ABOVE">Modal price reaches above ₹ Target</option>
                  <option value="PRICE_BELOW">Modal price drops below ₹ Floor</option>
                </select>
              </div>

              {/* Threshold Value */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Threshold ({conditionType.includes('PCT') ? 'Percentage %' : 'Price in ₹/q'})
                </label>
                <input
                  type="number"
                  required
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder={conditionType.includes('PCT') ? 'e.g. 10' : 'e.g. 3000'}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Bell className="w-4 h-4 font-bold" />
                <span>Save & Activate Alert</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active & Triggered Alerts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Configured Market Watchers</h3>
                <p className="text-xs text-slate-400">Live evaluation against actual mandi arrival transactions</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {alerts.length} Rules Active
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((item) => {
                const isTriggered = item.status === 'TRIGGERED';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isTriggered
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">
                            {item.commodity} ({item.market})
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            isTriggered
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-medium">
                          {item.message}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAlert(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition"
                        title="Delete Alert Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-slate-700/50 text-slate-400">
                      <span>Condition: <strong>{item.conditionType} ({item.thresholdValue}{item.conditionType.includes('PCT') ? '%' : ' ₹'})</strong></span>
                      <span>Current: <strong className="text-white">₹{item.currentPrice}/q</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
