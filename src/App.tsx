import React, { useState, useEffect } from 'react';
import { MarketCategory, MarketAsset } from './types/market';
import { MAJOR_BENCHMARKS, ALL_MARKET_ASSETS } from './data/marketData';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketOverviewCards } from './components/MarketOverviewCards';
import { MarketHeatmap } from './components/MarketHeatmap';
import { MarketTable } from './components/MarketTable';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { MarketNews } from './components/MarketNews';
import { EconomicCalendar } from './components/EconomicCalendar';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { TrendingUp, Globe2, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<MarketCategory | 'heatmap'>('all');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(['nvda', 'btcusd', 'spx', 'aapl']);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply dark or light mode class to document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('theme-light');
      document.body.classList.add('bg-[#131722]', 'text-[#d1d4dc]');
    } else {
      document.body.classList.add('theme-light');
      document.body.classList.remove('bg-[#131722]', 'text-[#d1d4dc]');
    }
  }, [isDarkMode]);

  // Global keyboard shortcut for ⌘K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleWatchlist = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAssetBySymbol = (symbol: string) => {
    const found = ALL_MARKET_ASSETS.find(
      (a) => a.symbol.toLowerCase() === symbol.toLowerCase()
    );
    if (found) {
      setSelectedAsset(found);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[#131722] text-[#d1d4dc]' : 'bg-[#f8f9fd] text-[#131722]'}`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        watchlistCount={watchlist.length}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Ticker Tape */}
      <TickerTape
        assets={ALL_MARKET_ASSETS}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      {/* Main Container */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-[#2a2e39] bg-gradient-to-r from-[#181d2a] via-[#1e2333] to-[#161a25] p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-[#089981] animate-pulse" />
              <span className="text-xs font-semibold text-[#089981] tracking-wide uppercase">
                Markets Open · Live Streaming Data
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Where the world charts, chats and trades markets.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#787b86] leading-relaxed">
              Explore global indices, stocks, cryptocurrency, foreign exchange, and commodities with real-time technical indicators, sector heatmaps, and institutional depth.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#787b86]">
              <div className="flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-[#2962ff]" />
                <span>120+ Global Exchanges</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[#089981]" />
                <span>Sub-millisecond Ticks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#f59e0b]" />
                <span>Institutional Grade Analytics</span>
              </div>
            </div>
          </div>

          {/* Decorative backdrop glow */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#2962ff]/10 via-[#2962ff]/5 to-transparent pointer-events-none" />
        </div>

        {/* Global Markets Overview Cards */}
        <section>
          <MarketOverviewCards
            benchmarks={MAJOR_BENCHMARKS}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
          />
        </section>

        {/* Heatmap Section (Displayed if activeTab === 'heatmap' or 'all') */}
        {(activeTab === 'all' || activeTab === 'heatmap') && (
          <section>
            <MarketHeatmap onSelectAssetBySymbol={handleSelectAssetBySymbol} />
          </section>
        )}

        {/* Screener & High-Density Asset Table */}
        {activeTab !== 'heatmap' && (
          <section>
            <div className="mb-3">
              <h2 className="text-xl font-bold tracking-tight text-white">Market Screener & Assets</h2>
              <p className="text-xs text-[#787b86]">Comprehensive quotes, technical ratings, volume metrics, and performance</p>
            </div>
            <MarketTable
              assets={ALL_MARKET_ASSETS}
              category={activeTab}
              onSelectCategory={(cat) => setActiveTab(cat)}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </section>
        )}

        {/* Two-Column Grid: News & Economic Calendar */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketNews onSelectSymbol={handleSelectAssetBySymbol} />
          <EconomicCalendar />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#2a2e39] bg-[#161a25] py-8 text-xs text-[#787b86]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2962ff] text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M4 17h3v3H4v-3zm5-7h3v10H9V10zm5-7h3v17h-3V3zm5 9h3v8h-3v-8z" />
              </svg>
            </div>
            <span className="font-semibold text-white">TradingView Markets</span>
            <span>·</span>
            <span>Global Financial Hub</span>
          </div>

          <p className="text-[11px] text-center md:text-right max-w-xl">
            Financial market quotes, candlestick charts, and technical indicators are provided for informational and educational purposes. Not financial advice.
          </p>
        </div>
      </footer>

      {/* Interactive Chart Modal */}
      {selectedAsset && (
        <InteractiveChartModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          isWatchlisted={watchlist.includes(selectedAsset.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Watchlist Sidebar Drawer */}
      <WatchlistSidebar
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistIds={watchlist}
        allAssets={ALL_MARKET_ASSETS}
        onSelectAsset={(asset) => {
          setSelectedAsset(asset);
          setIsWatchlistOpen(false);
        }}
        onRemoveFromWatchlist={handleToggleWatchlist}
        onAddToWatchlist={handleToggleWatchlist}
      />

      {/* Symbol Search Modal */}
      <SymbolSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={ALL_MARKET_ASSETS}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />
    </div>
  );
}
