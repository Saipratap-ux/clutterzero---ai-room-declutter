import React from 'react';
import { Sparkles, Layers, CheckSquare, Plus, Printer, History } from 'lucide-react';

interface NavbarProps {
  activeTab: 'upload' | 'studio' | 'history';
  setActiveTab: (tab: 'upload' | 'studio' | 'history') => void;
  hasActiveAnalysis: boolean;
  onNewScan: () => void;
  onPrintReport: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveAnalysis,
  onNewScan,
  onPrintReport,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(hasActiveAnalysis ? 'studio' : 'upload')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                ClutterZero
              </span>
              <span className="text-xs text-slate-500 font-medium">AI Room Decluttering</span>
            </div>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('upload')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'upload'
                ? 'border-emerald-700 text-emerald-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Upload & Scan
          </button>

          {hasActiveAnalysis && (
            <button
              onClick={() => setActiveTab('studio')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'border-emerald-700 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              Active Analysis
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-700 text-emerald-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-slate-500" />
            Saved Rooms ({savedCount})
          </button>
        </nav>

        {/* Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveAnalysis && (
            <button
              onClick={onPrintReport}
              title="Print or export checklist"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Export
            </button>
          )}

          <button
            onClick={onNewScan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all hover:shadow whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Room Scan
          </button>
        </div>
      </div>
    </header>
  );
};
