import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Database,
  BrainCircuit,
  Terminal,
  Play,
  RotateCw,
  Cpu,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import heroImg from '../assets/hero.png';

export const Landing: React.FC = () => {
  const { token } = useAuth();
  
  // Interactive Simulator Widget state
  const [simulating, setSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelTrained, setModelTrained] = useState(false);
  
  const handleSimulate = () => {
    setSimulating(true);
    setProgress(0);
    setModelTrained(false);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimulating(false);
          setModelTrained(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden relative">
      {/* Glow Backdrops */}
      <div className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 w-[700px] h-[700px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative max-w-7xl mx-auto h-20 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-2.5 font-bold text-white tracking-wide text-xl">
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <TrendingUp size={20} />
          </span>
          <span className="font-extrabold">Predictive<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Retail</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            to={token ? "/dashboard" : "/login"}
            className="text-xs font-bold text-slate-350 hover:text-white tracking-wider uppercase transition-colors"
          >
            Sign In
          </Link>
          <Link
            to={token ? "/dashboard" : "/register"}
            className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/25 transition-all cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-brand-400 text-xs font-semibold mb-6 shadow-xl select-none hover:border-brand-500/30 transition-all">
          <Sparkles size={14} className="text-amber-400" />
          <span>Interactive AI Sales Forecasting Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-tight max-w-5xl mx-auto">
          Predict Daily Sales Volumes using{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-400">
            Machine Learning
          </span>
        </h1>
        
        <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          PredictiveRetail integrates multi-seasonal temporal features, historical transactions, and stock levels to construct out-of-sample demand forecasts.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={token ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 group transition-all cursor-pointer"
          >
            <span>Launch Platform Dashboard</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#simulator"
            className="w-full sm:w-auto px-8 py-4 font-bold bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-800/80 rounded-xl transition-all"
          >
            Launch Interactive ML Simulator
          </a>
        </div>

        {/* Dashboard Preview Graphic Image */}
        <div className="mt-16 border border-slate-850/80 rounded-2xl bg-slate-950/80 p-3 shadow-2xl relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none rounded-2xl z-10" />
          <img 
            src={heroImg} 
            alt="SaaS Executive Overview Dashboard Preview" 
            className="w-full h-auto rounded-xl border border-slate-850 shadow-inner block object-cover" 
          />
        </div>
      </section>

      {/* Simulator Widget Section */}
      <section id="simulator" className="py-20 border-t border-slate-900 bg-slate-950/40 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive ML Trainer Simulator</h2>
            <p className="text-slate-400 text-xs mt-2">Test drive our custom RandomForest regression fitting model directly from the landing page</p>
          </div>

          <div className="border border-slate-850 bg-[#0b101b] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
            {/* Terminal Column */}
            <div className="w-full md:w-1/2 flex flex-col h-60 bg-black/50 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-350 p-4 overflow-hidden relative shadow-inner">
              <div className="flex items-center gap-1.5 shrink-0 text-slate-500 border-b border-slate-900/60 pb-2 mb-2">
                <Terminal size={12} />
                <span>FORECASTER_PIPELINE.LOG</span>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                <p className="text-slate-500">&gt; Loading retail forecasting datasets...</p>
                <p className="text-slate-500">&gt; Columns found: date, product_id, store_id, sales</p>
                {simulating && (
                  <>
                    <p className="text-brand-400">&gt; Transforming features: lags_7, lags_14, day_of_week</p>
                    {progress >= 30 && <p className="text-brand-400">&gt; Engineering sine/cosine trigonometric months...</p>}
                    {progress >= 60 && <p className="text-indigo-400">&gt; Splitting train (85%) / test (15%)...</p>}
                    {progress >= 90 && <p className="text-violet-400">&gt; Fitting RandomForestRegressor: n_estimators=100</p>}
                  </>
                )}
                {modelTrained && (
                  <>
                    <p className="text-emerald-500 font-bold">&gt; MODEL FITTING COMPLETED SUCCESSFULLY!</p>
                    <p className="text-emerald-400">&gt; Metrics: R² = 0.885 | MAE = 0.72 | RMSE = 1.01</p>
                    <p className="text-slate-300">&gt; Forecast projection matrix compiled: 90 out-of-sample days.</p>
                  </>
                )}
              </div>
              {simulating && (
                <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>

            {/* Controller Column */}
            <div className="w-full md:w-1/2 space-y-4">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Cpu className="text-brand-500" />
                <span>Model Controller</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click the trainer button below to trigger real-time feature engineering, out-of-sample data splits, and model coefficients fitting.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="px-5 py-3 w-full bg-brand-600 hover:bg-brand-500 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-brand-600/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {simulating ? (
                    <>
                      <RotateCw size={14} className="animate-spin" />
                      <span>Fitting Model...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Train Forecasting Model</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-900 bg-slate-950/20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-white">Full-Stack SaaS Platform Architecture</h2>
          <p className="mt-4 text-xs text-slate-400">Everything you need to audit, verify, and forecast retail sales demand.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#0b101b] border border-slate-850 p-6 rounded-2xl hover:border-brand-500/20 transition-all group">
            <div className="p-3 bg-brand-500/10 text-brand-400 w-fit rounded-xl group-hover:scale-110 transition-transform shadow-inner">
              <Zap size={22} />
            </div>
            <h3 className="text-base font-bold text-white mt-4">Random Forest Forecaster</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Utilize historical transactions data to predict daily stock demands. Leverages temporal indices.
            </p>
          </div>

          <div className="bg-[#0b101b] border border-slate-850 p-6 rounded-2xl hover:border-brand-500/20 transition-all group">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 w-fit rounded-xl group-hover:scale-110 transition-transform shadow-inner">
              <BarChart3 size={22} />
            </div>
            <h3 className="text-base font-bold text-white mt-4">Granular Analytics</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Break down profit margins, top categories, and city distributions. Filter by product, region, store, or date horizons.
            </p>
          </div>

          <div className="bg-[#0b101b] border border-slate-850 p-6 rounded-2xl hover:border-brand-500/20 transition-all group">
            <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-xl group-hover:scale-110 transition-transform shadow-inner">
              <Layers size={22} />
            </div>
            <h3 className="text-base font-bold text-white mt-4">Inventory Operations</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Automated stock warnings. Restock single products or bulk-buy alerts with single-click actions.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Grid */}
      <section className="py-20 max-w-5xl mx-auto px-6 border-t border-slate-900 bg-slate-950/10">
        <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-12">SaaS Pricing Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-slate-850 bg-[#0b101b] rounded-2xl p-6 shadow-xl flex flex-col justify-between h-[360px]">
            <div>
              <h3 className="text-base font-extrabold text-slate-350">Analytics Analyst</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Viewer Access</p>
              <h4 className="text-3xl font-black text-white mt-4">$29<span className="text-xs text-slate-500 font-normal"> / mo</span></h4>
              <ul className="text-xs text-slate-400 mt-6 space-y-2">
                <li className="flex items-center gap-2"><BadgeCheck size={14} className="text-brand-500" /> <span>Read-only analytics dashboards</span></li>
                <li className="flex items-center gap-2"><BadgeCheck size={14} className="text-brand-500" /> <span>Access forecasts & models accuracy</span></li>
                <li className="flex items-center gap-2"><BadgeCheck size={14} className="text-brand-500" /> <span>Search products, cities & segment logs</span></li>
              </ul>
            </div>
            <Link to="/register" className="py-3 text-center bg-slate-800 hover:bg-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer">
              Register Analyst Access
            </Link>
          </div>

          <div className="border border-brand-500/30 bg-[#0d1325] rounded-2xl p-6 shadow-2xl flex flex-col justify-between h-[360px] relative">
            <span className="absolute top-3 right-3 text-[8px] bg-brand-500/10 text-brand-400 font-bold px-2 py-0.5 rounded border border-brand-500/20 uppercase tracking-widest">Recommended</span>
            <div>
              <h3 className="text-base font-extrabold text-white">Supply Chain Manager</h3>
              <p className="text-[10px] text-brand-400 mt-1 uppercase font-bold tracking-wider">Manager Access</p>
              <h4 className="text-3xl font-black text-white mt-4">$89<span className="text-xs text-slate-500 font-normal"> / mo</span></h4>
              <ul className="text-xs text-slate-350 mt-6 space-y-2">
                <li className="flex items-center gap-2"><BadgeCheck size={14} className="text-brand-500" /> <span>Trigger active ML model retraining</span></li>
                <li className="flex items-center gap-2"><BadgeCheck size={14} className="text-brand-500" /> <span>Edit stock count & execute restocking</span></li>
                <li className="flex items-center gap-2"><BadgeCheck size={14} className="text-brand-500" /> <span>Import spreadsheets (CSV/Excel files)</span></li>
              </ul>
            </div>
            <Link to="/register" className="py-3 text-center bg-brand-600 hover:bg-brand-500 font-semibold text-xs rounded-xl shadow-lg shadow-brand-500/20 text-white transition-all cursor-pointer">
              Register Manager Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 px-6 text-center text-xs text-slate-500">
        <p>&copy; 2026 PredictiveRetail Inc. All rights reserved.</p>
        <p className="mt-2">Portfolio showcase item for commercial-grade retail operations software.</p>
      </footer>
    </div>
  );
};
