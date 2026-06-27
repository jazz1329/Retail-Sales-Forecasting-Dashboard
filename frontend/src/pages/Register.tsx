import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Mail, Lock, User, ShieldAlert, BadgeCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const { registerUser, token } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Viewer');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser(email, name, password, role);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to register. Please check your inputs or network connection.');
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
          <p className="text-slate-400 text-sm font-medium">Create a new user account workspace</p>
        </div>

        {/* Register Box */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative">
          <h2 className="text-xl font-bold text-white mb-6">Register workspace account</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center gap-2 text-xs font-medium text-red-400">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs font-medium text-emerald-400">
              <BadgeCheck size={16} className="shrink-0" />
              <span>Registration completed! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

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
                  placeholder="john@example.com"
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
                  placeholder="•••••••• (min 6 characters)"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                System Role Permission
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="Viewer">Viewer (Read-only data access)</option>
                <option value="Manager">Manager (Edit inventory, create products & orders)</option>
                <option value="Admin">Admin (Full administrative control, delete permissions)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-600/10 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-400 underline font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
