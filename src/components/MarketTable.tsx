import React, { useState, useMemo } from 'react';
import { MarketAsset, MarketCategory, ScreenerFilter, TechnicalRating } from '../types/market';
import { Star, TrendingUp, TrendingDown, ArrowUpDown, ExternalLink, Search } from 'lucide-react';

interface MarketTableProps {
  assets: MarketAsset[];
  category: MarketCategory;
  onSelectCategory: (cat: MarketCategory) => void;
  onSelectAsset: (asset: MarketAsset) => void;
  watchlist: string[]; // asset IDs
  onToggleWatchlist: (id: string) => void;
}

export const MarketTable: React.FC<MarketTableProps> = ({
  assets,
  category,
  onSelectCategory,
  onSelectAsset,
  watchlist,
  onToggleWatchlist,
}) => {
  const [screenerFilter, setScreenerFilter] = useState<ScreenerFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'price' | 'changePercent' | 'symbol' | 'volume'>('changePercent');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter by category
  const categoryFiltered = useMemo(() => {
    if (category === 'all') return assets;
    return assets.filter((a) => a.category === category);
  }, [assets, category]);

  // Filter by screener filter & search query
  const filteredAssets = useMemo(() => {
    let result = categoryFiltered;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      );
    }

    if (screenerFilter === 'gainers') {
      result = result.filter((a) => a.changePercent > 0);
    } else if (screenerFilter === 'losers') {
      result = result.filter((a) => a.changePercent < 0);
    } else if (screenerFilter === 'large_cap') {
      result = result.filter((a) => (a.marketCapNum || 0) > 200 || a.category === 'indices');
    } else if (screenerFilter === 'active') {
      result = result.filter((a) => a.volume && a.volume.includes('M') || a.volume.includes('B'));
    }

    // Sort
    return [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'changePercent') {
        comparison = a.changePercent - b.changePercent;
      } else if (sortField === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      } else if (sortField === 'volume') {
        comparison = (a.marketCapNum || 0) - (b.marketCapNum || 0);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [categoryFiltered, screenerFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: 'price' | 'changePercent' | 'symbol' | 'volume') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getRatingBadge = (rating: TechnicalRating) => {
    switch (rating) {
      case 'Strong Buy':
        return <span className="text-[#089981] font-semibold">Strong Buy</span>;
      case 'Buy':
        return <span className="text-[#0da088] font-medium">Buy</span>;
      case 'Neutral':
        return <span className="text-[#787b86]">Neutral</span>;
      case 'Sell':
        return <span className="text-[#c72836] font-medium">Sell</span>;
      case 'Strong Sell':
        return <span className="text-[#f23645] font-semibold">Strong Sell</span>;
    }
  };

  const categories: { label: string; value: MarketCategory }[] = [
    { label: 'All Assets', value: 'all' },
    { label: 'Stocks', value: 'stocks' },
    { label: 'Crypto', value: 'crypto' },
    { label: 'Forex', value: 'forex' },
    { label: 'Indices', value: 'indices' },
    { label: 'Commodities', value: 'commodities' },
    { label: 'Bonds', value: 'bonds' },
  ];

  const filters: { label: string; value: ScreenerFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Top Gainers', value: 'gainers' },
    { label: 'Top Losers', value: 'losers' },
    { label: 'Most Active', value: 'active' },
    { label: 'Mega-Cap', value: 'large_cap' },
  ];

  return (
    <div className="w-full rounded-xl border border-[#2a2e39] bg-[#1e222d] shadow-sm overflow-hidden">
      {/* Category Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#2a2e39] px-4 pt-3 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => onSelectCategory(c.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                category === c.value
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#181c27] border-b border-[#2a2e39]">
        {/* Screener quick buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setScreenerFilter(f.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                screenerFilter === f.value
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#787b86]" />
          <input
            type="text"
            placeholder="Filter by symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#2a2e39] bg-[#131722] py-1 pl-8 pr-3 text-xs text-white placeholder-[#787b86] focus:border-[#2962ff] focus:outline-none"
          />
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2a2e39] bg-[#161a25] text-[#787b86] font-medium select-none">
              <th className="py-2.5 pl-4 pr-2 w-8"></th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-3 hover:text-white cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol & Name</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right hover:text-white cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Chg</th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 text-right hover:text-white cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Chg %</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Technical Rating</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Vol</th>
              <th
                onClick={() => handleSort('volume')}
                className="py-2.5 px-3 text-right hover:text-white cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Market Cap</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">7-Day Trend</th>
              <th className="py-2.5 pr-4 pl-2 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/60 font-mono tabular-nums">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-sm text-[#787b86]">
                  No matching assets found for "{searchQuery}".
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isUp = asset.changePercent >= 0;
                const isSaved = watchlist.includes(asset.id);

                // Mini sparkline for table
                const spark = asset.sparkline;
                const min = Math.min(...spark);
                const max = Math.max(...spark);
                const range = max - min || 1;
                const width = 80;
                const height = 24;
                const strokeColor = isUp ? '#089981' : '#f23645';

                const points = spark.map((val, idx) => {
                  const x = (idx / (spark.length - 1)) * width;
                  const y = height - ((val - min) / range) * (height - 4) - 2;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <tr
                    key={asset.id}
                    className="group transition-colors hover:bg-[#242938] cursor-pointer"
                    onClick={() => onSelectAsset(asset)}
                  >
                    {/* Star / Watchlist */}
                    <td
                      className="py-2.5 pl-4 pr-2 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(asset.id);
                      }}
                    >
                      <button
                        title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className="text-[#787b86] hover:text-[#f59e0b] transition-colors"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            isSaved ? 'fill-[#f59e0b] text-[#f59e0b]' : ''
                          }`}
                        />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded font-sans text-[11px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: asset.logoColor || '#2962ff' }}
                        >
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div className="font-sans leading-tight">
                          <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {asset.symbol}
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[140px] sm:max-w-[200px]">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Last Price */}
                    <td className="py-2.5 px-3 text-right font-semibold text-white">
                      {asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                        maximumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                      })}
                      {asset.currency === '%' ? '%' : ''}
                    </td>

                    {/* Change $ */}
                    <td
                      className={`py-2.5 px-3 text-right font-medium ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {asset.change.toFixed(asset.category === 'forex' ? 4 : 2)}
                    </td>

                    {/* Change % */}
                    <td
                      className={`py-2.5 px-3 text-right font-semibold ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-2.5 px-3 text-center font-sans text-[11px]">
                      {getRatingBadge(asset.technicalRating)}
                    </td>

                    {/* Volume */}
                    <td className="py-2.5 px-3 text-right text-[#d1d4dc]">
                      {asset.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-2.5 px-3 text-right text-[#d1d4dc]">
                      {asset.marketCap || '—'}
                    </td>

                    {/* 7-Day Sparkline */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-block h-6 w-20">
                        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
                          <polyline
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                          />
                        </svg>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 pr-4 pl-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
                        }}
                        className="rounded p-1 text-[#787b86] hover:bg-[#2a2e39] hover:text-[#2962ff] transition-colors"
                        title="Interactive Chart"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
