import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  loading = false,
  children,
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/80 hover:shadow-md transition-all duration-200 flex flex-col h-[380px]">
      <div className="mb-4">
        <h4 className="text-base font-bold text-slate-800 dark:text-white">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 w-full relative min-h-0 flex items-center justify-center">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Compiling analytical metrics...</span>
          </div>
        ) : (
          <div className="w-full h-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
