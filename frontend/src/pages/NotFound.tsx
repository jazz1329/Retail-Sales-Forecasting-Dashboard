import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="absolute top-1/3 left-1/2 w-[350px] h-[350px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="z-10 space-y-6 max-w-md animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
          <HelpCircle size={36} />
        </div>
        <div>
          <h1 className="text-6xl font-extrabold text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200 mt-3">Page Not Found</h2>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            The page workspace you are searching for does not exist or has been relocated to another workspace node.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
