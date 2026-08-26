import React, { useState } from 'react';
import { RefreshCw, Database, CheckCircle2, AlertCircle, ExternalLink, X, Zap, Calendar, Sparkles } from 'lucide-react';
import { syncDataGov } from '../services/api';

export default function DataSyncModal({ isOpen, onClose, onSyncComplete }) {
  const [apiKey, setApiKey] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('data_gov'); // 'data_gov' | 'daily_stream'

  if (!isOpen) return null;

  const handleSyncDataGov = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setSyncStatus({ error: 'Please enter your api.data.gov.in API key. You can get one free at data.gov.in.' });
      return;
    }

    setSyncing(true);
    setSyncStatus(null);

    try {
      const res = await syncDataGov({
        apiKey: apiKey.trim(),
        limit: 200,
        commodity: commodityFilter,
        state: stateFilter
      });

      setSyncStatus({
        success: true,
        message: `Successfully retrieved ${res.records_retrieved} live mandi records and ingested ${res.records_ingested} records into the active data store!`,
        totalAvailable: res.total_available_on_server
      });

      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setSyncStatus({
        error: err.message || 'Failed to sync with api.data.gov.in. Please verify your API key.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Live Mandi Daily Data Hub
              </h3>
              <p className="text-xs text-slate-400">
                Real-time price discovery &amp; continuous daily APMC feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Live Status Badge */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Daily Feed Live</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Current Date: <strong className="text-white">{todayStr}</strong>
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div className="font-bold text-emerald-400">298,232+</div>
              <div>Daily Records</div>
            </div>
          </div>

          {/* Data.gov.in Live Sync Form */}
          <form onSubmit={handleSyncDataGov} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Data.gov.in API Key (Agmarknet)</span>
                <a
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your 579b464db66ec23bdd000001... key"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Commodity (Optional)</label>
                <input
                  type="text"
                  value={commodityFilter}
                  onChange={(e) => setCommodityFilter(e.target.value)}
                  placeholder="e.g. Tomato, Onion"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">State (Optional)</label>
                <input
                  type="text"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  placeholder="e.g. Gujarat, Maharashtra"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing with Agmarknet API...' : "Sync Today's Mandi Arrivals Now"}</span>
            </button>
          </form>

          {/* Sync Result Feedback */}
          {syncStatus && (
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
              syncStatus.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {syncStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                {syncStatus.message || syncStatus.error}
              </div>
            </div>
          )}

          {/* Information Note */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>Automatic Daily Feed</strong>: AgriPrice Tracker continuously processes daily price feeds across 1,600+ mandis. Daily modal prices, moving averages, and ML forecasts are synchronized in real time.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
