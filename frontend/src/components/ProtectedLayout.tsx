import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const ProtectedLayout: React.FC = () => {
  const { token, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        {/* Animated Loading Spinner */}
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium tracking-wide text-sm animate-pulse">Initializing dashboard workspace...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main workspace layout */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar sidebarCollapsed={sidebarCollapsed} />

        {/* Content Outlet */}
        <main className="flex-1 mt-16 p-6 overflow-y-auto page-bg-gradient">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
