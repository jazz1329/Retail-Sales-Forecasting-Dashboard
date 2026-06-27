import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  Layers,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/forecast', label: 'Forecast', icon: TrendingUp },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/inventory', label: 'Inventory', icon: Layers },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-20 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2 font-bold text-white tracking-wide text-lg select-none">
              <span className="bg-brand-600 text-white p-1.5 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} />
              </span>
              <span>Predictive<span className="text-brand-500">Retail</span></span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto bg-brand-600 text-white p-1.5 rounded-lg">
              <TrendingUp size={18} />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative font-medium ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-950 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-2 border-t border-slate-800 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 bg-slate-800/40 rounded-lg flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shadow-md">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
              <span className="text-xs text-brand-400 capitalize bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-900/40">{user.role}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-950/40 hover:text-red-400 text-slate-400 transition-colors group relative font-medium"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-950 text-red-400 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
              Sign Out
            </div>
          )}
        </button>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-8 border-t border-slate-800 mt-2 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};
