import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Mail, Lock, ShieldAlert, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Connection failed. Please check if your backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Logo and Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-extrabold text-white tracking-wide text-2xl mb-3">
            <span className="bg-brand-600 p-1.5 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </span>
            <span>Predictive<span className="text-brand-500">Retail</span></span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Retail Sales Forecasting SaaS Workspace</p>
        </div>

        {/* Login Form Box */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative">
          <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center gap-2 text-xs font-medium text-red-400">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@retail.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-600/10 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Seeding Hints */}
          <div className="mt-6 border-t border-slate-800/50 pt-5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" />
              <span>Demo Account Credentials</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
              <div className="bg-slate-900/55 p-1.5 rounded border border-slate-800/50 hover:text-white cursor-pointer" onClick={() => { setEmail('admin@retail.com'); setPassword('adminpassword'); }} title="Click to fill">
                <span className="block font-bold text-brand-400">Admin</span>
                admin@retail.com
              </div>
              <div className="bg-slate-900/55 p-1.5 rounded border border-slate-800/50 hover:text-white cursor-pointer" onClick={() => { setEmail('manager@retail.com'); setPassword('managerpassword'); }} title="Click to fill">
                <span className="block font-bold text-indigo-400">Manager</span>
                manager@...
              </div>
              <div className="bg-slate-900/55 p-1.5 rounded border border-slate-800/50 hover:text-white cursor-pointer" onClick={() => { setEmail('viewer@retail.com'); setPassword('viewerpassword'); }} title="Click to fill">
                <span className="block font-bold text-slate-400">Viewer</span>
                viewer@re...
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 hover:text-brand-400 underline font-semibold transition-colors">
            Register Workspace
          </Link>
        </p>
      </div>
    </div>
  );
};
