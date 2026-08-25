import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Search, 
  Sparkles, 
  Bell, 
  User, 
  Activity, 
  Database,
  ArrowRight,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sliders,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const navSections = [
    {
      title: 'MARKET INTELLIGENCE',
      items: [
        { to: '/', label: 'Dashboard', icon: BarChart3, badge: 'Live' },
        { to: '/prices', label: 'Price Explorer', icon: Search, badge: null },
        { to: '/markets', label: 'Market Comparison', icon: Activity, badge: null },
      ]
    },
    {
      title: 'PREDICTIONS & INSIGHTS',
      items: [
        { to: '/forecast', label: 'ML Forecast', icon: Sparkles, badge: 'AI' },
        { to: '/insights', label: 'Market Insights', icon: TrendingUp, badge: 'Hot' },
        { to: '/alerts', label: 'Price Alerts', icon: Bell, badge: '3' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-md shadow-brand-500/20">
            <span className="text-lg">🌾</span>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight">
              AgriPrice <span className="text-brand-400">Tracker</span>
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Vertical Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          flex flex-col justify-between
          bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80
          transition-all duration-300 ease-in-out
          ${isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Top Section: Logo & Toggle */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
            <Link 
              to="/" 
              onClick={() => setIsOpenMobile(false)}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
                <span className="text-xl">🌾</span>
              </div>
              
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white truncate">
                      AgriPrice <span className="text-brand-400">Tracker</span>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/90 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    AI Intelligence
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse / Expand Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links Grouped */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpenMobile(false)}
                        title={isCollapsed ? item.label : undefined}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative
                          ${isActive
                            ? 'bg-gradient-to-r from-brand-500/20 to-emerald-500/10 text-brand-400 border border-brand-500/30 shadow-sm shadow-brand-500/10 font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                          }
                          ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                      >
                        {/* Active Indicator Bar */}
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 bg-brand-400 rounded-r-full shadow-sm shadow-brand-400" />
                        )}

                        <Icon className={`w-5 h-5 min-w-[20px] transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'}`} />

                        {!isCollapsed && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}

                        {!isCollapsed && item.badge && (
                          <span className={`
                            text-[10px] font-bold px-1.5 py-0.5 rounded-md
                            ${item.badge === 'AI' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              item.badge === 'Hot' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              item.badge === 'Live' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-brand-500/20 text-brand-400 border border-brand-500/30'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Live Feed Card & User Profile */}
        <div className="p-3 border-t border-slate-800/80 space-y-2.5 bg-slate-950/40 relative">
          
          {/* Notifications Popover Anchored to Sidebar Width */}
          {showNotifications && !isCollapsed && (
            <div className="absolute bottom-full mb-2 left-3 right-3 rounded-2xl glass-panel bg-slate-900/98 border border-slate-700 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Market Alerts
                </span>
                <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">3 Active</span>
              </div>
              <div className="space-y-2 mt-2.5 text-xs">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-200 leading-snug">
                  <span className="font-bold text-emerald-400">Tomato Surge:</span> +18% in Rajkot Veg Yard.
                </div>
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-200 leading-snug">
                  <span className="font-bold text-rose-400">Onion Dip:</span> -8.2% in Surat Mandi.
                </div>
              </div>
              <Link
                to="/alerts"
                onClick={() => setShowNotifications(false)}
                className="mt-2.5 flex items-center justify-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-bold pt-2 border-t border-slate-800 transition"
              >
                <span>View All Alerts & Rules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Live Data Feed Status */}
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Mandi Feed Live</span>
                </div>
                <Database className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>298,232 Records</span>
                <span className="text-emerald-400 font-medium">1,622 Mandis</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="298K+ Records Live">
              <div className="p-2 rounded-lg bg-slate-800/80 text-emerald-400 relative">
                <Database className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          )}

          {/* User Profile Card */}
          <div className={`
            flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-200
            ${isCollapsed ? 'justify-center p-2' : ''}
          `}>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                <User className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-100 truncate">Trader Pro</div>
                <div className="text-[10px] text-emerald-400/90 font-medium truncate">Mandi Intelligence v1.0</div>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-1.5 rounded-lg transition ${showNotifications ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/60'}`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}
