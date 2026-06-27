import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Low Stock Alert',
      message: '4K Smart TV 55-inch is below its reorder point (4 remaining).',
      time: '10 mins ago',
      read: false,
    },
    {
      id: 2,
      title: 'Model Retrained',
      message: 'Random Forest forecasting model updated successfully.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      title: 'Order Completed',
      message: 'New order completed for Central Hub Store ($599.99).',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 z-10 flex items-center justify-between px-6 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Search Input */}
      <div className="relative w-64 max-w-lg md:w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Global search products, orders, categories..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-500/30 transition-all placeholder-slate-400"
        />
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all relative cursor-pointer"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-900" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-2 animate-slide-up">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      !n.read ? 'bg-brand-50/20 dark:bg-brand-950/10' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-xs font-semibold ${!n.read ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
              {user ? user.full_name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            {user && (
              <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200">
                {user.full_name}
              </span>
            )}
          </button>

          {profileOpen && user && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-2 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setProfileOpen(false)}
                >
                  <SettingsIcon size={16} />
                  <span>Account Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
