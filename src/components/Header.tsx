import React from 'react';
import { Search, Bookmark, Sun, Moon, Sparkles, TrendingUp } from 'lucide-react';
import { MarketCategory } from '../types/market';

interface HeaderProps {
  activeTab: MarketCategory | 'heatmap';
  onSelectTab: (tab: MarketCategory | 'heatmap') => void;
  onOpenSearch: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCount,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2e39] bg-[#131722]/95 backdrop-blur-md transition-colors dark:border-[#2a2e39] dark:bg-[#131722]/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('all')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            {/* TradingView Iconic 3-shape mark */}
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#2962ff] text-white shadow-sm transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M4 17h3v3H4v-3zm5-7h3v10H9V10zm5-7h3v17h-3V3zm5 9h3v8h-3v-8z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-[#2962ff]">
              TradingView <span className="font-medium text-[#787b86]">Markets</span>
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onSelectTab('stocks')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'stocks'
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => onSelectTab('crypto')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'crypto'
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              Crypto
            </button>
            <button
              onClick={() => onSelectTab('forex')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'forex'
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              Forex
            </button>
            <button
              onClick={() => onSelectTab('indices')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'indices'
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              Indices
            </button>
            <button
              onClick={() => onSelectTab('commodities')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'commodities'
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              Commodities
            </button>
            <button
              onClick={() => onSelectTab('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'heatmap'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Heatmap
            </button>
          </nav>
        </div>

        {/* Zone 3: Actions & Search */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-[#2a2e39] bg-[#1e222d] px-3 py-1.5 text-xs text-[#787b86] transition-colors hover:border-[#363a45] hover:text-[#d1d4dc]"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search markets...</span>
            <kbd className="hidden lg:inline-block rounded border border-[#363a45] bg-[#131722] px-1.5 py-0.5 text-[10px] text-[#787b86]">
              ⌘K
            </kbd>
          </button>

          {/* Watchlist Drawer Button */}
          <button
            onClick={onToggleWatchlist}
            className="relative flex items-center gap-1.5 rounded-lg border border-[#2a2e39] bg-[#1e222d] px-3 py-1.5 text-xs font-medium text-[#d1d4dc] transition-colors hover:bg-[#2a2e39]"
            title="Watchlist"
          >
            <Bookmark className="h-3.5 w-3.5 text-[#2962ff]" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="ml-1 rounded-full bg-[#2962ff] px-1.5 py-0.2 text-[10px] font-semibold text-white">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2e39] bg-[#1e222d] text-[#787b86] transition-colors hover:text-white"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Sign In CTA */}
          <button
            onClick={() => onSelectTab('all')}
            className="hidden sm:inline-flex rounded-lg bg-[#2962ff] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1e53e5] whitespace-nowrap"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};
