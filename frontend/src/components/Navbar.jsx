import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Search, 
  Sparkles, 
  Bell, 
  User, 
  Activity, 
  Database,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/prices', label: 'Price Explorer', icon: Search },
    { to: '/markets', label: 'Market Comparison', icon: Activity },
    { to: '/forecast', label: 'ML Forecast', icon: Sparkles },
    { to: '/insights', label: 'Insights', icon: TrendingUp },
    { to: '/alerts', label: 'Alerts', icon: Bell }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/60 bg-slate-900/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  AgriPrice <span className="text-brand-400">Tracker</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30">
                  AI Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                National Mandi Price & Forecast Network
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Dataset Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <Database className="w-3.5 h-3.5 text-brand-400" />
              <span>190K+ Mandi Records</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
                title="Notifications & Market Alerts"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-900" />
              </button>

              {/* Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-semibold text-white">Live Market Alerts</h4>
                    <span className="text-[11px] text-brand-400 font-medium">3 New</span>
                  </div>
                  <div className="space-y-2.5 mt-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-slate-200">
                      <span className="font-semibold text-emerald-400">Tomato Price Surge:</span> +18% increase observed in Rajkot Veg Yard compared to 7-day average.
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-slate-200">
                      <span className="font-semibold text-rose-400">Onion Dip:</span> -8.2% drop recorded in Surat Mandi due to increased arrivals.
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                      <span className="font-semibold text-brand-400">ML Model Retrained:</span> Forecast horizon models updated with 92.4% validation accuracy.
                    </div>
                  </div>
                  <Link
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium pt-2 border-t border-slate-800"
                  >
                    <span>View All Alerts & Rules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Avatar / Demo Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-300 hidden xl:inline">
                Trader Pro
              </span>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-800 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                      : 'text-slate-300 bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

      </div>
    </header>
  );
}
