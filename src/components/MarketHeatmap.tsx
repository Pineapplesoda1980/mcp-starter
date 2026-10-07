import React, { useState } from 'react';
import { HEATMAP_DATA, HeatmapItem } from '../data/marketData';
import { MarketAsset } from '../types/market';
import { Layers, Maximize2, Info } from 'lucide-react';

interface MarketHeatmapProps {
  onSelectAssetBySymbol: (symbol: string) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ onSelectAssetBySymbol }) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [sizeMode, setSizeMode] = useState<'market_cap' | 'equal'>('market_cap');
  const [hoveredItem, setHoveredItem] = useState<HeatmapItem | null>(null);

  const sectors = ['All', 'Technology', 'Consumer Discretionary', 'Communication', 'Financials', 'Healthcare', 'Energy'];

  const filteredItems = selectedSector === 'All'
    ? HEATMAP_DATA
    : HEATMAP_DATA.filter((i) => i.sector === selectedSector);

  // Helper for color coding
  const getPerformanceBg = (pct: number) => {
    if (pct >= 3.0) return 'bg-[#089981] hover:bg-[#078570] text-white';
    if (pct >= 1.5) return 'bg-[#0da088] hover:bg-[#0c8d78] text-white';
    if (pct > 0) return 'bg-[#126b5d] hover:bg-[#0f5c50] text-white';
    if (pct === 0) return 'bg-[#2a2e39] hover:bg-[#323642] text-[#d1d4dc]';
    if (pct > -1.5) return 'bg-[#8c242d] hover:bg-[#7a1f27] text-white';
    if (pct > -3.0) return 'bg-[#c72836] hover:bg-[#b0222f] text-white';
    return 'bg-[#f23645] hover:bg-[#d82a39] text-white';
  };

  // Group items by sector for sector layout
  const sectorGroups = React.useMemo(() => {
    const groups: Record<string, HeatmapItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.sector]) groups[item.sector] = [];
      groups[item.sector].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="w-full rounded-xl border border-[#2a2e39] bg-[#1e222d] p-5 shadow-sm">
      {/* Heatmap header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2a2e39]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#2962ff]" />
            <h3 className="text-lg font-bold text-white tracking-tight">Stock Market Heatmap</h3>
            <span className="text-xs text-[#787b86]">· S&P 500 Mega-Cap & Sectors</span>
          </div>
          <p className="text-xs text-[#787b86] mt-0.5">
            Tile area represents market capitalization, color indicates 1-day percentage price change.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sector filters */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1 bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  selectedSector === sec
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Size Mode */}
          <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
            <button
              onClick={() => setSizeMode('market_cap')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                sizeMode === 'market_cap' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSizeMode('equal')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                sizeMode === 'equal' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Equal
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap color legend */}
      <div className="my-3 flex items-center justify-between text-xs text-[#787b86]">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[11px]">-3.0%</span>
          <span className="h-3 w-5 rounded-sm bg-[#f23645]" />
          <span className="h-3 w-5 rounded-sm bg-[#c72836]" />
          <span className="h-3 w-5 rounded-sm bg-[#8c242d]" />
          <span className="h-3 w-5 rounded-sm bg-[#2a2e39]" />
          <span className="h-3 w-5 rounded-sm bg-[#126b5d]" />
          <span className="h-3 w-5 rounded-sm bg-[#0da088]" />
          <span className="h-3 w-5 rounded-sm bg-[#089981]" />
          <span className="text-[11px]">+3.0%</span>
        </div>
        <div className="text-[11px]">Click any block to view candlestick charts & technical analysis</div>
      </div>

      {/* Heatmap Grid Layout */}
      <div className="relative min-h-[460px] w-full rounded-lg bg-[#131722] p-2 border border-[#2a2e39]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Object.entries(sectorGroups).map(([sectorTitle, items]) => {
            return (
              <div
                key={sectorTitle}
                className="flex flex-col rounded-lg border border-[#2a2e39] bg-[#161a25] p-2"
              >
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider">
                    {sectorTitle}
                  </span>
                  <span className="text-[10px] text-[#787b86] font-mono">
                    {items.length} stocks
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 flex-1">
                  {items.map((item) => {
                    const isDominant = sizeMode === 'market_cap' && item.marketCapNum >= 1500;
                    const isMid = sizeMode === 'market_cap' && item.marketCapNum >= 500 && item.marketCapNum < 1500;
                    
                    const spanClass = isDominant
                      ? 'col-span-2 row-span-2 min-h-[120px]'
                      : isMid
                      ? 'col-span-1 row-span-1 min-h-[75px]'
                      : 'min-h-[65px]';

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectAssetBySymbol(item.symbol)}
                        onMouseEnter={() => setHoveredItem(item)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`group relative flex flex-col justify-between p-2 rounded transition-transform duration-150 hover:scale-[1.02] cursor-pointer text-left shadow-sm ${spanClass} ${getPerformanceBg(
                          item.changePercent
                        )}`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className={`font-bold tracking-tight ${isDominant ? 'text-base' : 'text-xs'}`}>
                            {item.symbol}
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${isDominant ? 'text-xs' : 'text-[11px]'}`}>
                            {item.changePercent >= 0 ? '+' : ''}
                            {item.changePercent.toFixed(2)}%
                          </span>
                        </div>

                        <div className="w-full">
                          <p className={`truncate text-white/80 ${isDominant ? 'text-xs' : 'text-[10px]'}`}>
                            {item.name}
                          </p>
                          <div className="flex items-baseline justify-between mt-0.5">
                            <span className="font-mono text-[11px] tabular-nums font-medium text-white/90">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-white/70 font-mono">
                              ${(item.marketCapNum >= 1000 ? (item.marketCapNum / 1000).toFixed(1) + 'T' : item.marketCapNum + 'B')}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      {hoveredItem && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-[#161a25] px-4 py-2 border border-[#2a2e39] text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm">{hoveredItem.symbol}</span>
            <span className="text-[#d1d4dc]">{hoveredItem.name}</span>
            <span className="text-[#787b86]">Sector: {hoveredItem.sector}</span>
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span className="text-white font-semibold">${hoveredItem.price.toFixed(2)}</span>
            <span
              className={`font-semibold ${
                hoveredItem.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {hoveredItem.changePercent >= 0 ? '+' : ''}
              {hoveredItem.changePercent.toFixed(2)}%
            </span>
            <span className="text-[#787b86]">
              Market Cap: ${(hoveredItem.marketCapNum >= 1000 ? (hoveredItem.marketCapNum / 1000).toFixed(2) + 'T' : hoveredItem.marketCapNum + 'B')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
