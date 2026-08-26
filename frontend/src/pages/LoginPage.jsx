import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Shield, UserCheck, Zap, AlertCircle, ArrowRight, Sprout, SunMedium, Tractor } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signInAsGuest, error, isFirebaseConfigured } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="farm-login min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10 sm:py-14">
      <div className="farm-login__sun" aria-hidden="true">
        <SunMedium className="w-8 h-8" />
      </div>
      <div className="farm-login__field" aria-hidden="true">
        <div className="farm-login__hill farm-login__hill--back" />
        <div className="farm-login__hill farm-login__hill--front" />
        <div className="farm-login__rows" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">
        <div className="hidden lg:block max-w-xl pb-10">
          <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-[0.22em] mb-5">
            <Sprout className="w-4 h-4" />
            Farm intelligence, grounded in data
          </div>
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.04] tracking-tight">
            Read the market.
            <span className="block text-emerald-300">Grow with confidence.</span>
          </h1>
          <p className="mt-5 text-slate-300 text-base leading-relaxed max-w-lg">
            A clear view of mandi prices, crop movement, and practical forecasts for the next decision in the field.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
            <div className="farm-stat"><Sprout className="w-4 h-4 text-lime-300" /><strong>123</strong><span>Crops</span></div>
            <div className="farm-stat"><Tractor className="w-4 h-4 text-amber-300" /><strong>1,622</strong><span>Mandis</span></div>
            <div className="farm-stat"><Shield className="w-4 h-4 text-sky-300" /><strong>298K+</strong><span>Records</span></div>
          </div>
        </div>

      <div className="relative w-full max-w-md mx-auto lg:mx-0">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-300 via-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/30 mb-4 ring-1 ring-white/20">
            <Sprout className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            AgriPrice<span className="text-emerald-400"> Tracker</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            India's agricultural intelligence platform &amp; ML price forecasting engine.
          </p>
        </div>

        {/* Sign-In Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          {/* Top shine */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Sign In</h2>
              <p className="text-slate-400 text-xs mt-0.5">Choose your preferred access method</p>
            </div>
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              isFirebaseConfigured 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {isFirebaseConfigured ? '● Firebase Live' : '● Demo Ready'}
            </span>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-white/10 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none mb-3 text-sm"
          >
            {/* Google logo SVG */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isSigningIn ? 'Signing in with Google...' : 'Continue with Google'}
          </button>

          {/* Quick 1-Click Demo / Guest Options */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium tracking-wider">
                Or Quick Access (No Setup)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => signInAsGuest('Trader')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 hover:border-emerald-500/50 transition-all text-center group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Agri Trader</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">Instant 1-Click</span>
            </button>

            <button
              onClick={() => signInAsGuest('Analyst')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 hover:border-sky-500/50 transition-all text-center group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-sky-400">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Market Analyst</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">Explore All Features</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {error}
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-emerald-400 font-bold text-base">298K+</div>
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Records</div>
              </div>
              <div>
                <div className="text-teal-400 font-bold text-base">1,622</div>
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Mandis</div>
              </div>
              <div>
                <div className="text-sky-400 font-bold text-base">123</div>
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Crops</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          AgriPrice Tracker &bull; Machine Learning Agricultural Intelligence Platform
        </p>
      </div>
      </div>
    </div>
  );
}
