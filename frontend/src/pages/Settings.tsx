import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Settings as SettingsIcon, User, Shield, Moon, Database, HelpCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.full_name || 'Charlie Brown');
  const [email, setEmail] = useState(user?.email || 'viewer@retail.com');

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-brand-500" />
          <span>System Settings</span>
        </h2>
        <p className="text-slate-400 text-sm">Configure user profile, role-based controls, and database specifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          {/* User Profile Form */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User size={16} className="text-brand-500" />
              <span>Workspace Profile</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Security and Roles description */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Shield size={16} className="text-indigo-500" />
              <span>Role Permissions Matrix</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account currently holds <span className="font-bold text-brand-500">{user?.role}</span> system level authorization.
            </p>
            <div className="space-y-3">
              <div className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl flex items-start gap-3">
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase mt-0.5">Viewer</span>
                <div className="text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-200">Read-Only Analyst</p>
                  <span className="text-slate-400">Can view dashboard metrics, charts, forecasting outputs, products, customers, and order history.</span>
                </div>
              </div>

              <div className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl flex items-start gap-3">
                <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded uppercase mt-0.5">Manager</span>
                <div className="text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-200">Stock & Order Planner</p>
                  <span className="text-slate-400">Holds Viewer permissions plus: create products, restock low inventory, import CSV files, and trigger ML retraining.</span>
                </div>
              </div>

              <div className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl flex items-start gap-3">
                <span className="text-[10px] font-bold bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded uppercase mt-0.5">Admin</span>
                <div className="text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-200">Super Administrator</p>
                  <span className="text-slate-400">Full operational capability. Exclusive ability to delete products, cancel billing orders, and remove customer profiles.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings Column */}
        <div className="space-y-6">
          {/* Display Configuration */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Moon size={16} className="text-violet-500" />
              <span>Theme Preferences</span>
            </h4>
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Dark Interface</p>
                <span className="text-slate-400">Toggles CSS document mode</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Toggle {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Database & API Status */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Database size={16} className="text-emerald-500" />
              <span>Database Workspace</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Database Engine</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">SQLite (Local fallback)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File Path</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">backend/retail.db</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API Connection</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
