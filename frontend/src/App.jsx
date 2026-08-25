import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PriceExplorer from './pages/PriceExplorer';
import MarketComparison from './pages/MarketComparison';
import ForecastPage from './pages/ForecastPage';
import InsightsPage from './pages/InsightsPage';
import AlertsPage from './pages/AlertsPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white antialiased">
        
        {/* Vertical Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden relative">
          
          {/* Luminous Ambient Background Glow Orbs */}
          <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10 pulse-glow" />
          <div className="fixed top-1/3 left-1/3 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-sky-500/8 rounded-full blur-[130px] pointer-events-none -z-10" />
          
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
                <span className="text-base">🌾</span>
                <span className="font-bold text-slate-200">AgriPrice Tracker</span>
                <span>— Agricultural Market Intelligence & ML Price Forecasting Platform</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <span>National Mandi Dataset</span>
                <span>•</span>
                <span>GBR / RF ML Models</span>
                <span>•</span>
                <span>Production MVP</span>
              </div>
            </div>
          </footer>

        </div>

      </div>
    </Router>
  );
}
