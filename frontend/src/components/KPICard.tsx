import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeSuffix?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeSuffix = '% vs last month',
  icon: Icon,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          </div>
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
        <div className="mt-4 h-4 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/80 hover:shadow-md hover:border-brand-500/20 dark:hover:border-brand-500/10 transition-all duration-200 group">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            {title}
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mt-1 select-all">
            {value}
          </h3>
        </div>
        <div className="p-3 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-xl group-hover:scale-110 transition-transform duration-200">
          <Icon size={22} />
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-4 text-xs font-medium">
          <span
            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(1)}%
            </span>
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            {changeSuffix}
          </span>
        </div>
      )}
    </div>
  );
};
