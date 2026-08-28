import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PriceExplorer from './pages/PriceExplorer';
import MarketComparison from './pages/MarketComparison';
import ForecastPage from './pages/ForecastPage';
import InsightsPage from './pages/InsightsPage';
import AlertsPage from './pages/AlertsPage';
import LoginPage from './pages/LoginPage';
import { MapPin, Sprout, Waves } from 'lucide-react';

import LiveMarketTicker from './components/LiveMarketTicker';

function AppShell() {
  const { user } = useAuth();

  // Still loading auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 animate-pulse" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in — show login
  if (!user) {
    return <LoginPage />;
  }

  // Signed in — show full app
  return (
    <div className="app-shell min-h-screen flex flex-col lg:flex-row text-slate-100 selection:bg-brand-500 selection:text-white antialiased">

      {/* Vertical Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden relative">

        {/* Live Mandi Rate Ticker Ribbon */}
        <LiveMarketTicker />

        <div className="field-operations-bar" aria-label="Field operations status">
          <div className="field-operations-inner">
            <span className="field-operations-title"><Sprout className="w-3.5 h-3.5" /> Field operations</span>
            <span className="field-operations-item"><span className="field-status-dot" /> Mandi network online</span>
            <span className="field-operations-item"><MapPin className="w-3.5 h-3.5" /> 31 states covered</span>
            <span className="field-operations-item"><Waves className="w-3.5 h-3.5" /> Live Daily Prices</span>
          </div>
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prices" element={<PriceExplorer />} />
            <Route path="/markets" element={<MarketComparison />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/90 mt-auto py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">AgriPrice Tracker</span>
              <span>— Agricultural Market Intelligence &amp; ML Price Forecasting Platform</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>National Mandi Dataset</span>
              <span>&bull;</span>
              <span>GBR / RF ML Models</span>
              <span>&bull;</span>
              <span>Production MVP</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}
