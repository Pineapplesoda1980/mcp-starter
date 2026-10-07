import React, { useState } from 'react';
import { MarketAsset, Timeframe } from '../types/market';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface MarketOverviewCardsProps {
  benchmarks: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const MarketOverviewCards: React.FC<MarketOverviewCardsProps> = ({
  benchmarks,
  onSelectAsset,
}) => {
  const [hoveredPoints, setHoveredPoints] = useState<Record<string, { value: number; index: number } | null>>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');

  const timeframes: Timeframe[] = ['1D', '5D', '1M', '1Y'];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Global Markets Overview</h2>
          <p className="text-xs text-[#787b86]">Key equity indices, digital assets, commodities, and benchmark yields</p>
        </div>
        <div className="flex items-center gap-1 bg-[#1e222d] p-1 rounded-lg border border-[#2a2e39] self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedTimeframe === tf
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {benchmarks.map((asset) => {
          const isUp = asset.changePercent >= 0;
          const strokeColor = isUp ? '#089981' : '#f23645';
          const fillColor = isUp ? 'rgba(8, 153, 129, 0.12)' : 'rgba(242, 54, 69, 0.12)';
          const hovered = hoveredPoints[asset.symbol];

          // Compute SVG sparkline path
          const spark = asset.sparkline;
          const min = Math.min(...spark);
          const max = Math.max(...spark);
          const range = max - min || 1;
          const width = 180;
          const height = 48;

          const points = spark.map((val, idx) => {
            const x = (idx / (spark.length - 1)) * width;
            const y = height - ((val - min) / range) * (height - 8) - 4;
            return { x, y, val };
          });

          const pathD = points.reduce((acc, p, idx) => {
            return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
          }, '');

          const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

          const displayPrice = hovered ? hovered.value : asset.price;

          // Day range position calculation
          const dayRange = asset.high - asset.low || 1;
          const currentPos = Math.min(100, Math.max(0, ((asset.price - asset.low) / dayRange) * 100));

          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className="group relative flex flex-col justify-between rounded-xl border border-[#2a2e39] bg-[#1e222d] p-3.5 transition-all duration-200 hover:border-[#363a45] hover:bg-[#222735] hover:shadow-lg cursor-pointer"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-[#2962ff] transition-colors">
                      {asset.symbol}
                    </span>
                    <span className="text-[11px] text-[#787b86] truncate max-w-[90px]">{asset.name}</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold tabular-nums text-white">
                      {displayPrice.toLocaleString(undefined, {
                        minimumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                        maximumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                      })}
                      {asset.currency === '%' ? '%' : ''}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold font-mono tabular-nums ${
                    isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                  }`}
                >
                  {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isUp ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </div>
              </div>

              {/* Interactive SVG Sparkline */}
              <div className="my-2.5 h-12 w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                  onMouseLeave={() => setHoveredPoints((prev) => ({ ...prev, [asset.symbol]: null }))}
                >
                  <defs>
                    <linearGradient id={`grad-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <path d={areaD} fill={`url(#grad-${asset.symbol})`} />
                  {/* Stroke path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Hover interactive vertical line and dot */}
                  {hovered && points[hovered.index] && (
                    <>
                      <line
                        x1={points[hovered.index].x}
                        y1={0}
                        x2={points[hovered.index].x}
                        y2={height}
                        stroke="#787b86"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={points[hovered.index].x}
                        cy={points[hovered.index].y}
                        r="3.5"
                        fill={strokeColor}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                  {/* Transparent hover capture zones */}
                  {points.map((pt, idx) => (
                    <rect
                      key={idx}
                      x={idx === 0 ? 0 : pt.x - width / points.length / 2}
                      y={0}
                      width={width / points.length}
                      height={height}
                      fill="transparent"
                      onMouseEnter={() =>
                        setHoveredPoints((prev) => ({
                          ...prev,
                          [asset.symbol]: { value: pt.val, index: idx },
                        }))
                      }
                    />
                  ))}
                </svg>
              </div>

              {/* Day range bar */}
              <div className="pt-1 border-t border-[#2a2e39]/50">
                <div className="flex justify-between text-[10px] text-[#787b86] font-mono tabular-nums mb-1">
                  <span>L: {asset.low.toFixed(asset.category === 'bonds' ? 2 : 1)}</span>
                  <span>H: {asset.high.toFixed(asset.category === 'bonds' ? 2 : 1)}</span>
                </div>
                <div className="relative h-1 w-full rounded-full bg-[#2a2e39]">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-[#787b86]/60"
                    style={{ left: '0%', width: '100%' }}
                  />
                  <div
                    className="absolute top-1/2 -mt-1 h-2 w-2 -ml-1 rounded-full bg-white shadow-sm ring-1 ring-[#2962ff]"
                    style={{ left: `${currentPos}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
